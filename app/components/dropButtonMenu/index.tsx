"use client"

import { useEffect, useMemo, useState } from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
  Button,
} from "@heroui/react";
import { FileText, Home, LogOut, Plus, Settings, Trash2 } from "lucide-react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

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

const getUserFromToken = () => {
  try {
    const token = Cookies.get("token");
    const payload = token?.split(".")[1];
    if (!payload) return null;

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decodedPayload = JSON.parse(window.atob(normalizedPayload));
    return decodedPayload?.name || decodedPayload?.email || null;
  } catch (error) {
    return null;
  }
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
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    setUserName(getUserFromToken());
  }, []);

  const userInitial = useMemo(() => {
    const value = userName?.trim() || "Dirrocha";
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
