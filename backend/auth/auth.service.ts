import "server-only";
import bcrypt from "bcryptjs";
import { adminDb } from "@/backend/config/admin";
import { authRepository, AuthRepository } from "@/backend/auth/auth.repository";
import {
  AUTH_SETTINGS_DOC,
  CONFIGURATION_COLLECTION,
  capabilitiesForRole,
  resolveUserRole,
  USER_COLLECTION,
  type UserRole,
} from "@/backend/user/user.entity";
import { sessaoRepository, SessaoRepository } from "@/backend/sessao/sessao.repository";
import { userRepository, UserRepository } from "@/backend/user/user.repository";
import { signSessionToken } from "@/backend/common/tokens";
import { auditService } from "@/backend/audit/audit.service";
import { validatePassword } from "@/backend/common/passwordPolicy";
import { consumeRateLimit, resetRateLimit } from "@/backend/common/rateLimit";

const BCRYPT_ROUNDS = 12;

/**
 * Limites de tentativa de login.
 *
 * Duas dimensoes de proposito: por conta (impede alvejar um usuario especifico) e por
 * IP (impede varrer varias contas da mesma origem).
 */
const LIMITE_POR_CONTA = { limit: 8, windowSeconds: 15 * 60 };
const LIMITE_POR_IP = { limit: 30, windowSeconds: 15 * 60 };

/**
 * Hash descartavel usado quando o e-mail nao existe.
 *
 * Sem isso, um e-mail inexistente responde imediatamente enquanto um existente paga o
 * custo do bcrypt -- diferenca de tempo que revela quais contas existem. Comparar
 * contra este hash iguala os dois caminhos.
 */
const HASH_DUMMY = "$2a$12$C6UzMDM.H6dfI/f/IKcEeO3Zq2Q3vQ6qkGZ2hZ0Kx5aQpTvUj5mYu";

export interface LoginResult {
  token: string;
  user: { id: string; name: string; email: string; role: UserRole; canManageUsers: boolean };
  /** Preenchido quando o acesso legado acabou de ser convertido, para avisar na UI. */
  migratedTo?: string;
}

export interface LoginContext {
  ip: string;
}

export class AuthError extends Error {
  constructor(
    message: string,
    readonly status: number = 401,
  ) {
    super(message);
  }
}

export class AuthService {
  constructor(
    private readonly legacy: AuthRepository,
    private readonly users: UserRepository,
    private readonly sessions: SessaoRepository,
  ) {}

  /** Cria a sessao e assina o token, gravando o hash para permitir revogacao. */
  private async issueSession(user: { id: string; email: string }) {
    const sid = await this.sessions.createSessao({ userId: user.id, email: user.email });
    const token = await signSessionToken({ sub: user.id, email: user.email, sid });
    await this.sessions.attachTokenHash(sid, token);
    return token;
  }

  /**
   * Login unico do painel, substituindo os quatro caminhos anteriores.
   *
   * Diferenca central: a senha e conferida contra o hash DO PROPRIO usuario, e a
   * identidade vem do documento encontrado -- nao do texto enviado pelo cliente.
   * Isso elimina o bypass em que qualquer `name` somado a senha compartilhada
   * produzia um token com identidade arbitraria.
   */
  async login(identifier: string, password: string, context: LoginContext): Promise<LoginResult> {
    const email = identifier?.trim();
    if (!email || !password) {
      throw new AuthError("Informe e-mail e senha", 400);
    }

    const chaveConta = `login:conta:${email.toLowerCase()}`;
    const chaveIp = `login:ip:${context.ip}`;

    const [porConta, porIp] = await Promise.all([
      consumeRateLimit({ key: chaveConta, ...LIMITE_POR_CONTA }),
      consumeRateLimit({ key: chaveIp, ...LIMITE_POR_IP }),
    ]);

    if (!porConta.allowed || !porIp.allowed) {
      const espera = Math.max(porConta.retryAfterSeconds, porIp.retryAfterSeconds);
      await auditService.record({
        action: "login_blocked",
        target: { email },
        summary: `Tentativas de login bloqueadas para ${email}`,
        metadata: { ip: context.ip, retryAfterSeconds: espera },
      });
      throw new AuthError(
        `Muitas tentativas. Tente novamente em ${Math.ceil(espera / 60)} minuto(s).`,
        429,
      );
    }

    const existing = await this.users.findUserWithSecretByEmail(email);

    if (existing) {
      const hash = typeof existing.password === "string" && existing.password ? existing.password : HASH_DUMMY;
      const ok = await bcrypt.compare(password, hash);

      // A conta desativada e verificada DEPOIS do bcrypt: responder "conta desativada"
      // antes de conferir a senha revelaria que a conta existe.
      if (!ok) {
        await this.registrarFalha(email, context.ip, "senha incorreta");
        throw new AuthError("Usuario ou senha incorretos");
      }
      if (existing.disabled === true) throw new AuthError("Conta desativada", 403);

      const role = resolveUserRole(existing);
      const token = await this.issueSession({ id: existing.id, email: existing.email });

      await Promise.all([resetRateLimit(chaveConta), resetRateLimit(chaveIp)]);
      await auditService.record({
        action: "login_succeeded",
        actor: { id: existing.id, email: existing.email },
        summary: `Login de ${existing.email}`,
        metadata: { ip: context.ip, role },
      });

      return {
        token,
        user: {
          id: existing.id,
          name: existing.name ?? "",
          email: existing.email,
          role,
          canManageUsers: capabilitiesForRole(role).manageUsers,
        },
      };
    }

    return this.loginViaLegacyMigration(password, email, context);
  }

  private async registrarFalha(email: string, ip: string, motivo: string) {
    await auditService.record({
      action: "login_failed",
      target: { email },
      summary: `Falha de login para ${email}`,
      metadata: { ip, motivo },
    });
  }

  /**
   * Caminho de transicao, valido uma unica vez.
   *
   * O acesso antigo era uma senha compartilhada em `users/default` cujo `name` nunca
   * era validado. Convertemos para um usuario real copiando o hash bcrypt sem alteracao
   * -- a mesma senha continua funcionando e ninguem fica trancado fora. Em seguida
   * `migratedAt` desativa este caminho definitivamente.
   */
  private async loginViaLegacyMigration(
    password: string,
    emailTentado: string,
    context: LoginContext,
  ): Promise<LoginResult> {
    const legacyUser = await this.legacy.getLegacyUser();

    // Compara contra um hash descartavel quando nao ha caminho legado, para que o tempo
    // de resposta nao revele se o e-mail existe.
    const hash = legacyUser && !legacyUser.migratedAt ? legacyUser.password : HASH_DUMMY;
    const ok = await bcrypt.compare(password, hash);

    if (!legacyUser || legacyUser.migratedAt || !ok) {
      await this.registrarFalha(emailTentado, context.ip, "e-mail inexistente ou senha incorreta");
      throw new AuthError("Usuario ou senha incorretos");
    }

    const email = String(legacyUser.name || "").trim();
    if (!email) {
      throw new AuthError("Acesso legado sem identificador; contate o administrador", 500);
    }

    // Concorrencia: dois logins simultaneos nao podem criar dois usuarios.
    const created = await adminDb.runTransaction(async (tx) => {
      const dup = await tx.get(
        adminDb.collection(USER_COLLECTION).where("emailLower", "==", email.toLowerCase()).limit(1),
      );
      if (!dup.empty) return { id: dup.docs[0].id };

      const ref = adminDb.collection(USER_COLLECTION).doc();
      tx.set(ref, {
        name: legacyUser.name,
        email,
        emailLower: email.toLowerCase(),
        password: legacyUser.password, // hash copiado verbatim: mesma senha continua valendo
        disabled: false,
        role: "admin", // quem tinha o acesso legado administrava tudo
        createdAt: new Date(),
        migratedFrom: "users/default",
      });
      return { id: ref.id };
    });

    await this.legacy.markLegacyAsMigrated(created.id);

    const token = await this.issueSession({ id: created.id, email });

    await auditService.record({
      action: "legacy_account_migrated",
      actor: { id: created.id, email },
      summary: `Acesso legado convertido na conta ${email} (Administrador)`,
      metadata: { ip: context.ip },
    });

    return {
      token,
      user: { id: created.id, name: legacyUser.name, email, role: "admin", canManageUsers: true },
      migratedTo: email,
    };
  }

  async logout(sid: string) {
    await this.sessions.deleteSessao(sid);
    return { success: true as const };
  }

  /** O painel ainda nao tem nenhuma conta? */
  async getSetupState() {
    const [userCount, legacyAvailable] = await Promise.all([
      this.users.countUsers(),
      this.legacy.isLegacyLoginAvailable(),
    ]);

    return {
      needsSetup: userCount === 0 && !legacyAvailable,
      configured: userCount > 0 || legacyAvailable,
    };
  }

  /** Cria a primeira conta do painel. Transacao evita dois admins numa corrida. */
  async bootstrapFirstAdmin({ name, email, password }: { name: string; email: string; password: string }) {
    const cleanEmail = email?.trim();
    if (!name?.trim() || !cleanEmail) throw new AuthError("Informe nome e e-mail", 400);

    const senhaOk = validatePassword(password);
    if (!senhaOk.ok) throw new AuthError(senhaOk.error!, 400);

    const state = await this.getSetupState();
    if (!state.needsSetup) throw new AuthError("O painel ja foi configurado", 409);

    const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const settingsRef = adminDb.collection(CONFIGURATION_COLLECTION).doc(AUTH_SETTINGS_DOC);

    const userId = await adminDb.runTransaction(async (tx) => {
      const settings = await tx.get(settingsRef);
      if (settings.exists && settings.data()?.bootstrappedAt) {
        throw new AuthError("O painel ja foi configurado", 409);
      }

      const ref = adminDb.collection(USER_COLLECTION).doc();
      tx.set(ref, {
        name: name.trim(),
        email: cleanEmail,
        emailLower: cleanEmail.toLowerCase(),
        password: hashed,
        disabled: false,
        role: "admin",
        createdAt: new Date(),
      });
      tx.set(settingsRef, { bootstrappedAt: new Date(), bootstrappedBy: ref.id }, { merge: true });

      return ref.id;
    });

    const token = await this.issueSession({ id: userId, email: cleanEmail });

    await auditService.record({
      action: "first_admin_created",
      actor: { id: userId, email: cleanEmail },
      summary: `Primeira conta do painel criada: ${cleanEmail} (Administrador)`,
    });

    return {
      token,
      user: {
        id: userId,
        name: name.trim(),
        email: cleanEmail,
        role: "admin" as UserRole,
        canManageUsers: true,
      },
    };
  }
}

export const authService = new AuthService(authRepository, userRepository, sessaoRepository);
