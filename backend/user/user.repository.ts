import "server-only";
import { adminDb } from "@/backend/config/admin";
import {
  capabilitiesForRole,
  DEFAULT_USER_ROLE,
  resolveUserRole,
  USER_COLLECTION,
} from "@/backend/user/user.entity";
import type { UserPayload, UserRecord, UserUpdatePayload } from "@/backend/user/user.model";

const usersRef = () => adminDb.collection(USER_COLLECTION);

/** Nunca vaza `password` para fora da camada de dados. */
const toPublicUser = (id: string, data: Record<string, any>): UserRecord => {
  const role = resolveUserRole(data);
  return {
    id,
    name: data.name ?? "",
    email: data.email ?? "",
    disabled: data.disabled === true,
    role,
    canManageUsers: capabilitiesForRole(role).manageUsers,
  };
};

export class UserRepository {
  /** Uso interno de autenticacao: este e o unico metodo que devolve o hash. */
  async findUserWithSecretByEmail(email: string) {
    const normalized = email.trim().toLowerCase();

    // `emailLower` e escrito pelos registros novos; a busca exata cobre os antigos.
    let snapshot = await usersRef().where("emailLower", "==", normalized).limit(1).get();
    if (snapshot.empty) {
      snapshot = await usersRef().where("email", "==", email.trim()).limit(1).get();
    }
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Record<string, any> & {
      id: string;
      password?: string;
      disabled?: boolean;
      name?: string;
      email: string;
      role?: unknown;
      canManageUsers?: unknown;
    };
  }

  async findUserByEmail(email: string) {
    const found = await this.findUserWithSecretByEmail(email);
    if (!found) return null;
    return toPublicUser(found.id, found);
  }

  async findUserById(userId: string) {
    const doc = await usersRef().doc(userId).get();
    if (!doc.exists) return null;
    return toPublicUser(doc.id, doc.data()!);
  }

  /** Como o guard carrega o usuario a cada request, precisa dos campos de estado. */
  async findAuthUserById(userId: string) {
    const doc = await usersRef().doc(userId).get();
    if (!doc.exists) return null;

    const data = doc.data()!;
    const role = resolveUserRole(data);
    return {
      id: doc.id,
      name: data.name ?? "",
      email: data.email ?? "",
      disabled: data.disabled === true,
      role,
      capabilities: capabilitiesForRole(role),
    };
  }

  async findUsers(): Promise<UserRecord[]> {
    const snapshot = await usersRef().get();
    return snapshot.docs.map((doc) => toPublicUser(doc.id, doc.data()));
  }

  async countUsers() {
    const snapshot = await usersRef().count().get();
    return snapshot.data().count;
  }

  /**
   * Conta administradores ativos.
   *
   * Percorre a colecao em vez de usar `where`, porque o papel pode vir do campo `role`
   * (contas novas) ou ser derivado de `canManageUsers` (contas anteriores aos papeis) --
   * uma unica query nao cobre os dois formatos. A colecao de usuarios do painel e
   * pequena, entao o custo e irrelevante.
   */
  async countActiveAdmins() {
    const snapshot = await usersRef().get();
    return snapshot.docs.filter(
      (doc) => resolveUserRole(doc.data()) === "admin" && doc.data().disabled !== true,
    ).length;
  }

  /** `password` deve chegar JA hasheado. */
  async createUser(userData: UserPayload) {
    const docRef = await usersRef().add({
      name: userData.name,
      email: userData.email.trim(),
      emailLower: userData.email.trim().toLowerCase(),
      password: userData.password,
      disabled: userData.disabled ?? false,
      role: userData.role ?? DEFAULT_USER_ROLE,
      createdAt: new Date(),
    });
    return docRef.id;
  }

  async updateUserById(userId: string, payload: UserUpdatePayload) {
    const patch: Record<string, unknown> = { ...payload, updatedAt: new Date() };
    if (typeof payload.email === "string") {
      patch.email = payload.email.trim();
      patch.emailLower = payload.email.trim().toLowerCase();
    }

    await usersRef().doc(userId).update(patch);
    return { success: true as const };
  }

  async deleteUserById(userId: string) {
    try {
      await usersRef().doc(userId).delete();
      return { success: true as const };
    } catch (error) {
      console.error("Erro ao deletar usuario:", error);
      return { success: false as const, error: "Erro ao deletar usuario" };
    }
  }

  async deleteUserByEmail(email: string) {
    try {
      const found = await this.findUserWithSecretByEmail(email);
      if (!found) return { success: false as const, error: "Usuario nao encontrado" };

      await usersRef().doc(found.id).delete();
      return { success: true as const, id: found.id };
    } catch (error) {
      console.error("Erro ao deletar usuario:", error);
      return { success: false as const, error: "Erro ao deletar usuario" };
    }
  }
}

export const userRepository = new UserRepository();
