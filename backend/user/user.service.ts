import "server-only";
import bcrypt from "bcryptjs";
import { userRepository, UserRepository } from "@/backend/user/user.repository";
import { sessaoRepository, SessaoRepository } from "@/backend/sessao/sessao.repository";
import { auditService } from "@/backend/audit/audit.service";
import { validatePassword } from "@/backend/common/passwordPolicy";
import { DEFAULT_USER_ROLE, isUserRole, ROLE_LABELS, type UserRole } from "@/backend/user/user.entity";
import type { UserUpdatePayload } from "@/backend/user/user.model";
import type { Actor } from "@/backend/common/actor";

const BCRYPT_ROUNDS = 12;

export class UserServiceError extends Error {
  constructor(
    message: string,
    readonly status: number = 400,
  ) {
    super(message);
  }
}

export class UserService {
  constructor(
    private readonly repository: UserRepository,
    private readonly sessions: SessaoRepository,
  ) {}

  async listUsers() {
    const data = await this.repository.findUsers();
    return { success: true as const, data };
  }

  async getUserById(userId: string) {
    return this.repository.findUserById(userId);
  }

  async createUser(
    {
      name,
      email,
      password,
      role,
    }: { name: string; email: string; password: string; role?: unknown },
    actor: Actor,
  ) {
    const cleanName = name?.trim();
    const cleanEmail = email?.trim();

    if (!cleanName || !cleanEmail) throw new UserServiceError("Informe nome e e-mail");

    const senhaOk = validatePassword(password);
    if (!senhaOk.ok) throw new UserServiceError(senhaOk.error!);

    const papel: UserRole = isUserRole(role) ? role : DEFAULT_USER_ROLE;

    const existing = await this.repository.findUserWithSecretByEmail(cleanEmail);
    if (existing) throw new UserServiceError("E-mail ja cadastrado", 409);

    const id = await this.repository.createUser({
      name: cleanName,
      email: cleanEmail,
      password: await bcrypt.hash(password, BCRYPT_ROUNDS),
      disabled: false,
      role: papel,
    });

    await auditService.record({
      action: "user_created",
      actor,
      target: { id, email: cleanEmail },
      summary: `Conta ${cleanEmail} criada como ${ROLE_LABELS[papel]}`,
      metadata: { role: papel },
    });

    return { success: true as const, id };
  }

  /**
   * `actingUserId` vem do guard, nunca do corpo da requisicao. E o que sustenta as
   * guardas de auto-lockout.
   */
  async updateUser(userId: string, payload: UserUpdatePayload, actor: Actor) {
    const actingUserId = actor.id;
    const target = await this.repository.findUserById(userId);
    if (!target) throw new UserServiceError("Usuario nao encontrado", 404);

    const isSelf = userId === actingUserId;
    const novoPapel = payload.role;

    if (novoPapel !== undefined && !isUserRole(novoPapel)) {
      throw new UserServiceError("Papel invalido");
    }

    if (isSelf && payload.disabled === true) {
      throw new UserServiceError("Voce nao pode desativar a propria conta");
    }
    if (isSelf && novoPapel && novoPapel !== "admin" && target.role === "admin") {
      throw new UserServiceError("Voce nao pode rebaixar o proprio perfil de administrador");
    }

    // Nao deixar o painel sem nenhum administrador ativo.
    const perdendoAdmin =
      target.role === "admin" && ((novoPapel && novoPapel !== "admin") || payload.disabled === true);
    if (perdendoAdmin && (await this.repository.countActiveAdmins()) <= 1) {
      throw new UserServiceError("Este e o unico administrador ativo do painel");
    }

    const patch: UserUpdatePayload = { ...payload };

    if (typeof patch.email === "string") {
      const cleanEmail = patch.email.trim();
      if (!cleanEmail) throw new UserServiceError("E-mail nao pode ser vazio");

      const emailOwner = await this.repository.findUserWithSecretByEmail(cleanEmail);
      if (emailOwner && emailOwner.id !== userId) {
        throw new UserServiceError("E-mail ja cadastrado", 409);
      }
      patch.email = cleanEmail;
    }

    const trocouSenha = !!patch.password;
    if (trocouSenha) {
      const senhaOk = validatePassword(patch.password);
      if (!senhaOk.ok) throw new UserServiceError(senhaOk.error!);
      patch.password = await bcrypt.hash(patch.password!, BCRYPT_ROUNDS);
    } else {
      delete patch.password;
    }

    const result = await this.repository.updateUserById(userId, patch);

    // Trocar a senha ou desativar a conta precisa encerrar as sessoes existentes,
    // senao um token antigo continuaria valido.
    if (trocouSenha || payload.disabled === true) {
      await this.sessions.deleteSessoesByUserId(userId);
    }

    const alvo = { id: userId, email: patch.email ?? target.email };

    if (novoPapel && novoPapel !== target.role) {
      await auditService.record({
        action: "user_role_changed",
        actor,
        target: alvo,
        summary: `Perfil de ${alvo.email} alterado de ${ROLE_LABELS[target.role]} para ${ROLE_LABELS[novoPapel]}`,
        metadata: { from: target.role, to: novoPapel },
      });
    }
    if (payload.disabled !== undefined && payload.disabled !== target.disabled) {
      await auditService.record({
        action: payload.disabled ? "user_disabled" : "user_enabled",
        actor,
        target: alvo,
        summary: `Conta ${alvo.email} ${payload.disabled ? "desativada" : "reativada"}`,
      });
    }
    if (trocouSenha) {
      await auditService.record({
        action: "user_password_changed",
        actor,
        target: alvo,
        summary: `Senha de ${alvo.email} alterada`,
      });
    }
    if (patch.name !== undefined || patch.email !== undefined) {
      await auditService.record({
        action: "user_updated",
        actor,
        target: alvo,
        summary: `Dados de ${alvo.email} atualizados`,
      });
    }

    return result;
  }

  async deleteUserById(userId: string, actor: Actor) {
    if (userId === actor.id) {
      throw new UserServiceError("Voce nao pode excluir a propria conta");
    }

    const target = await this.repository.findUserById(userId);
    if (!target) throw new UserServiceError("Usuario nao encontrado", 404);

    if (target.role === "admin" && (await this.repository.countActiveAdmins()) <= 1) {
      throw new UserServiceError("Este e o unico administrador ativo do painel");
    }

    const result = await this.repository.deleteUserById(userId);
    if (result.success) {
      await this.sessions.deleteSessoesByUserId(userId);
      await auditService.record({
        action: "user_deleted",
        actor,
        target: { id: userId, email: target.email },
        summary: `Conta ${target.email} excluida`,
        metadata: { role: target.role },
      });
    }

    return result;
  }
}

export const userService = new UserService(userRepository, sessaoRepository);
export const User = userService;
