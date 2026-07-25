"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { adminApi, type AdminUser } from "@/app/services/adminApi";

/**
 * Identidade da sessao.
 *
 * Substitui o antigo `getCurrentActor`, que decodificava o JWT no browser sem verificar
 * assinatura (e por isso era falsificavel). Como o cookie e HttpOnly, a unica fonte de
 * verdade e `/api/admin/auth/me`.
 *
 * Isto controla apenas a UI. A autorizacao real e enforcada pelo guard no servidor.
 */

interface CurrentUserState {
  user: AdminUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const CurrentUserContext = createContext<CurrentUserState>({
  user: null,
  loading: true,
  refresh: async () => {},
});

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { user: fetched } = await adminApi.auth.me();
      setUser(fetched);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(() => ({ user, loading, refresh }), [user, loading, refresh]);

  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>;
}

export const useCurrentUser = () => useContext(CurrentUserContext);

/**
 * Garante que existe sessao; redireciona para o login caso nao exista.
 * Substitui o padrao `checkAuth().then(...)` repetido nas paginas.
 */
export function useRequireAuth() {
  const { user, loading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [loading, user, router]);

  return { user, loading };
}
