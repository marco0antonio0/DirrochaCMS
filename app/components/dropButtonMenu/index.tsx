"use client"

import { useMemo } from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
  Button,
} from "@heroui/react";
import { FileText, Home, LogOut, Plus, Settings, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/app/hooks/useCurrentUser";

type ButtonDropdownProps = {
  actiondelet?: () => void;
  addItem?: () => void;
  isItem?: boolean;
  addLabel?: string;
  addDescription?: string;
  onSettings?: () => void;
  onDocs?: () => void;
  onLogout?: () => void;
};

export default function ButtonDropdown({
  actiondelet,
  addItem,
  isItem = false,
  addLabel,
  addDescription,
  onSettings,
  onDocs,
  onLogout,
}: ButtonDropdownProps) {
  const router = useRouter();

  // O cookie de sessao e HttpOnly: a identidade vem de /api/admin/auth/me, nao de um
  // decode do JWT no browser (que era, alem de invisivel agora, nao verificado).
  const { user } = useCurrentUser();
  const userName = user?.name?.trim() || user?.email || null;

  const userInitial = useMemo(() => {
    const value = userName || "Dirrocha";
    return value.charAt(0).toUpperCase();
  }, [userName]);

  const userLabel = userName || "Dirrocha CMS";
  const deleteLabel = isItem ? "Excluir registro" : "Excluir endpoint";
  const deleteDescription = isItem
    ? "Remove este registro definitivamente"
    : "Remove este endpoint definitivamente";
  const addActionLabel = addLabel || "Adicionar registro";
  const addActionDescription = addDescription || "Cria um novo item para este endpoint";

  return (
    <Dropdown
      showArrow
      radius="md"
      classNames={{
        base: "before:bg-white",
        content: "min-w-[280px] border border-slate-200 bg-white p-2 shadow-xl",
      }}
    >
      <DropdownTrigger>
        <Button
          isIconOnly
          aria-label="Abrir menu do usuário"
          className="h-11 w-11 min-w-11 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 p-0 text-sm font-medium text-white shadow-sm ring-2 ring-white transition hover:scale-[1.03] hover:shadow-md"
        >
          {userInitial}
        </Button>
      </DropdownTrigger>

      <DropdownMenu
        aria-label="Menu do usuário"
        disabledKeys={["profile"]}
        itemClasses={{
          base: [
            "rounded-md",
            "px-3",
            "py-2",
            "text-slate-700",
            "data-[hover=true]:bg-slate-100",
            "data-[hover=true]:text-slate-950",
          ],
          title: "font-medium",
          description: "text-xs text-slate-500",
        }}
      >
        <DropdownSection showDivider aria-label="Perfil">
          <DropdownItem key="profile" isReadOnly className="cursor-default opacity-100">
            <div className="flex items-center gap-3 py-1">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-sm font-medium text-white">
                {userInitial}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950">{userLabel}</p>
                <p className="text-xs font-medium text-slate-500">DirrochaCMS Beta</p>
              </div>
            </div>
          </DropdownItem>
        </DropdownSection>

        <DropdownSection showDivider aria-label="Ações">
          <DropdownItem
            key="homePage"
            startContent={<Home className="h-4 w-4 text-slate-500" />}
            onClick={() => router.push("/home")}
          >
            Página inicial
          </DropdownItem>

          {addItem ? (
            <DropdownItem
              key="add_action"
              description={addActionDescription}
              startContent={<Plus className="h-4 w-4 text-slate-500" />}
              onClick={addItem}
            >
              {addActionLabel}
            </DropdownItem>
          ) : null}

          {onSettings ? (
            <DropdownItem
              key="settings"
              startContent={<Settings className="h-4 w-4 text-slate-500" />}
              onClick={onSettings}
            >
              Configurações
            </DropdownItem>
          ) : null}

          {onDocs ? (
            <DropdownItem
              key="docs"
              startContent={<FileText className="h-4 w-4 text-slate-500" />}
              onClick={onDocs}
            >
              Documentação
            </DropdownItem>
          ) : null}
        </DropdownSection>

        {onLogout ? (
          <DropdownSection showDivider aria-label="Sessão">
            <DropdownItem
              key="logout"
              className="text-red-600 data-[hover=true]:bg-red-50 data-[hover=true]:text-red-700"
              startContent={<LogOut className="h-4 w-4 text-red-600" />}
              onClick={onLogout}
            >
              Sair
            </DropdownItem>
          </DropdownSection>
        ) : null}

        {actiondelet ? (
          <DropdownSection title="Zona de risco" aria-label="Zona de risco">
            <DropdownItem
              key="delete"
              className="text-danger data-[hover=true]:bg-red-50 data-[hover=true]:text-red-700"
              color="danger"
              description={deleteDescription}
              startContent={<Trash2 className="h-4 w-4 text-danger" />}
              onClick={actiondelet}
            >
              {deleteLabel}
            </DropdownItem>
          </DropdownSection>
        ) : null}
      </DropdownMenu>
    </Dropdown>
  );
}
