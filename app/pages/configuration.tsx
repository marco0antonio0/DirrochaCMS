"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Database,
  GripVertical,
  KeyRound,
  Plus,
  Save,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  ShieldOff,
  ShieldX,
  Trash2,
  UserPlus,
  Users,
  Wand2,
} from "lucide-react"
import toast from "react-hot-toast"
import { AppHeader } from "@/app/components/app-header"
import ButtonDropdown from "@/app/components/dropButtonMenu"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { Switch } from "@/app/components/ui/switch"
import { Alert, AlertDescription } from "@/app/components/ui/alert"
import { Badge } from "@/app/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/components/ui/tooltip"
import { logout } from "@/app/services/logout"
import { adminApi } from "@/app/services/adminApi"
import { useCurrentUser } from "@/app/hooks/useCurrentUser"

type FieldType = "string" | "number" | "date" | "img"

interface EndpointFieldSchema {
  name: string
  type: FieldType
  mult: boolean
}

type UserRole = "admin" | "editor" | "viewer"

interface ManagedUser {
  id: string
  name: string
  email: string
  disabled?: boolean
  role: UserRole
  canManageUsers?: boolean
}

/** Rótulos e descrições espelham `backend/user/user.entity.ts`. */
const ROLE_OPTIONS: Array<{ value: UserRole; label: string; description: string }> = [
  { value: "admin", label: "Administrador", description: "Acesso total, incluindo gerenciar contas." },
  { value: "editor", label: "Editor", description: "Cria, edita e exclui conteúdo. Não gerencia contas." },
  { value: "viewer", label: "Leitor", description: "Somente leitura. Não altera nada." },
]

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  editor: "Editor",
  viewer: "Leitor",
}

const ROLE_BADGE: Record<UserRole, string> = {
  admin: "bg-indigo-100 text-indigo-700 ring-indigo-200",
  editor: "bg-blue-100 text-blue-700 ring-blue-200",
  viewer: "bg-slate-100 text-slate-600 ring-slate-200",
}

/**
 * Espelha a regra do servidor: quem gerencia contas é apenas o papel `admin`.
 * A UI não deve prometer o que o guard vai negar.
 */
const hasAccountsAccess = (user?: { role?: UserRole } | null) => user?.role === "admin"

function IconActionButton({
  label,
  onClick,
  disabled,
  className = "",
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          disabled={disabled}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-500 transition disabled:pointer-events-none disabled:opacity-40 ${className}`}
          onClick={onClick}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

const fieldTypes: Array<{ value: FieldType; label: string }> = [
  { value: "string", label: "Texto" },
  { value: "number", label: "Numero" },
  { value: "date", label: "Data" },
  { value: "img", label: "Imagem" },
]

const defaultBuilderFields: EndpointFieldSchema[] = [{ name: "titulo", type: "string", mult: false }]

const endpointTemplates: Array<{ title: string; description: string; fields: EndpointFieldSchema[] }> = [
  {
    title: "Conteúdo",
    description: "Título, descrição e imagem.",
    fields: [
      { name: "titulo", type: "string", mult: false },
      { name: "descricao", type: "string", mult: true },
      { name: "image", type: "img", mult: false },
    ],
  },
  {
    title: "Produto",
    description: "Nome, preço e imagem.",
    fields: [
      { name: "nome", type: "string", mult: false },
      { name: "preco", type: "number", mult: false },
      { name: "image", type: "img", mult: false },
    ],
  },
  {
    title: "Evento",
    description: "Título, data e local.",
    fields: [
      { name: "titulo", type: "string", mult: false },
      { name: "data", type: "date", mult: false },
      { name: "local", type: "string", mult: false },
    ],
  },
]

export default function ConfigurationPage() {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState<"endpoint" | "users">("endpoint")
  const [loading, setLoading] = useState(false)
  const [usersLoading, setUsersLoading] = useState(false)
  const [endpointName, setEndpointName] = useState("")
  const [builderFields, setBuilderFields] = useState<EndpointFieldSchema[]>(defaultBuilderFields)
  const [draggedFieldIndex, setDraggedFieldIndex] = useState<number | null>(null)
  const [dragOverFieldIndex, setDragOverFieldIndex] = useState<number | null>(null)
  const [errors, setErrors] = useState({ endpointName: false, fields: "" })
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [userSearch, setUserSearch] = useState("")
  const [editingUserId, setEditingUserId] = useState("")
  const [userForm, setUserForm] = useState<{ name: string; email: string; password: string; role: UserRole }>(
    { name: "", email: "", password: "", role: "editor" },
  )
  const [userDialogOpen, setUserDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ManagedUser | null>(null)

  // A identidade vem de /api/admin/auth/me (cookie HttpOnly), nao mais de um decode
  // do JWT no browser. Isto controla apenas a UI: o guard do servidor decide de fato.
  const { user: currentUser, loading: currentUserLoading } = useCurrentUser()
  const currentUserAccess = hasAccountsAccess(currentUser)
  // `viewer` é somente leitura: esconder a ação evita prometer o que o guard vai negar.
  const canWrite = currentUser ? currentUser.role !== "viewer" : false

  useEffect(() => {
    if (currentUserLoading) return
    if (!currentUser) {
      logout(router)
      return
    }
    if (currentUserAccess) fetchUsers()
  }, [currentUserLoading, currentUser, currentUserAccess, router])

  const fetchUsers = async () => {
    setUsersLoading(true)
    try {
      const response = await adminApi.users.list()
      setUsers(response?.data || [])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao carregar usuários")
    } finally {
      setUsersLoading(false)
    }
  }

  const filteredUsers = useMemo(() => {
    const term = userSearch.trim().toLowerCase()
    if (!term) return users
    return users.filter(
      (user) => user.name?.toLowerCase().includes(term) || user.email?.toLowerCase().includes(term)
    )
  }, [users, userSearch])

  const isDefaultBuilderState =
    builderFields.length === 1 && builderFields[0].name === "titulo" && builderFields[0].type === "string"

  const applyTemplate = (fields: EndpointFieldSchema[]) => {
    if (!isDefaultBuilderState && !window.confirm("Isso substituirá os campos atuais pelos do modelo. Continuar?")) {
      return
    }
    setBuilderFields(fields.map((field) => ({ ...field })))
    setErrors((prev) => ({ ...prev, fields: "" }))
  }

  const validateEndpointName = (name: string) => /^[a-zA-Z0-9_]+$/.test(name)

  const validateBuilderFields = () => {
    const seen = new Set<string>()
    for (const [index, field] of builderFields.entries()) {
      const name = field.name.trim()
      if (!name) throw new Error(`Campo ${index + 1} está sem nome.`)
      if (!validateEndpointName(name)) throw new Error(`Campo "${name}" deve usar letras, números e underscores.`)
      if (name === "titulo_identificador") throw new Error("titulo_identificador já é criado automaticamente.")
      if (seen.has(name)) throw new Error(`Campo duplicado: ${name}`)
      seen.add(name)
    }
    return builderFields.map((field) => ({
      ...field,
      name: field.name.trim(),
      mult: field.type === "string" ? field.mult : false,
    }))
  }

  const getUniqueFieldName = (name: string) => {
    const baseName = name.trim() || `campo_${builderFields.length + 1}`
    const usedNames = new Set(builderFields.map((field) => field.name))
    if (!usedNames.has(baseName)) return baseName

    let suffix = 2
    while (usedNames.has(`${baseName}_${suffix}`)) suffix += 1
    return `${baseName}_${suffix}`
  }

  const addField = (field?: Partial<EndpointFieldSchema>) => {
    setBuilderFields((prev) => [
      ...prev,
      {
        name: getUniqueFieldName(field?.name || `campo_${builderFields.length + 1}`),
        type: field?.type || "string",
        mult: field?.mult || false,
      },
    ])
    setErrors((prev) => ({ ...prev, fields: "" }))
  }

  const updateField = (index: number, patch: Partial<EndpointFieldSchema>) => {
    setBuilderFields((prev) => prev.map((field, i) => (i === index ? { ...field, ...patch } : field)))
    setErrors((prev) => ({ ...prev, fields: "" }))
  }

  const removeField = (index: number) => {
    setBuilderFields((prev) => prev.filter((_, i) => i !== index))
    setErrors((prev) => ({ ...prev, fields: "" }))
  }

  const reorderFields = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return
    const nextFields = [...builderFields]
    const [field] = nextFields.splice(fromIndex, 1)
    nextFields.splice(toIndex, 0, field)
    setBuilderFields(nextFields)
  }

  const handleCreateEndpoint = async () => {
    let payload: { title: string; router: string; campos: EndpointFieldSchema[] }
    try {
      const routerName = endpointName.trim()
      if (!routerName) throw new Error("Informe o nome da rota.")
      if (!validateEndpointName(routerName)) throw new Error("A rota deve usar letras, números e underscores.")
      payload = { title: routerName, router: routerName, campos: validateBuilderFields() }
      setErrors({ endpointName: false, fields: "" })
    } catch (error: any) {
      setErrors({ endpointName: endpointName.trim() === "", fields: error.message || "Revise os campos." })
      toast.error(error.message || "Revise os campos.")
      return
    }

    setLoading(true)
    try {
      // A autoria (`createdBy`) e derivada da sessao no servidor, nao enviada pelo client.
      await adminApi.endpoints.create(payload)
      toast.success("Endpoint criado com sucesso")
      router.push("/home")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao criar endpoint")
    } finally {
      setLoading(false)
    }
  }

  const resetUserForm = () => {
    setEditingUserId("")
    setUserForm({ name: "", email: "", password: "", role: "editor" })
  }

  const openCreateUserDialog = () => {
    resetUserForm()
    setUserDialogOpen(true)
  }

  const openEditUserDialog = (user: ManagedUser) => {
    handleEditUser(user)
    setUserDialogOpen(true)
  }

  const closeUserDialog = () => {
    setUserDialogOpen(false)
    resetUserForm()
  }

  const handleSaveUser = async () => {
    const name = userForm.name.trim()
    const email = userForm.email.trim()
    const password = userForm.password.trim()

    if (!name || !email) {
      toast.error("Informe nome e e-mail")
      return
    }
    if (!editingUserId && !password) {
      toast.error("Informe uma senha para a nova conta")
      return
    }
    if (password && password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres")
      return
    }

    setUsersLoading(true)
    try {
      if (editingUserId) {
        await adminApi.users.update(editingUserId, {
          name,
          email,
          role: userForm.role,
          // Senha vazia = manter a atual.
          ...(password ? { password } : {}),
        })
      } else {
        await adminApi.users.create({ name, email, password, role: userForm.role })
      }

      toast.success(editingUserId ? "Usuário atualizado" : "Usuário criado")
      closeUserDialog()
      await fetchUsers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar usuário")
    } finally {
      setUsersLoading(false)
    }
  }

  const handleEditUser = (user: ManagedUser) => {
    setEditingUserId(user.id)
    setUserForm({ name: user.name || "", email: user.email || "", password: "", role: user.role ?? "editor" })
  }

  const handleToggleUser = async (user: ManagedUser) => {
    setUsersLoading(true)
    try {
      await adminApi.users.update(user.id, { disabled: !user.disabled })
      setUsers((prev) => prev.map((item) => (item.id === user.id ? { ...item, disabled: !user.disabled } : item)))
      toast.success(user.disabled ? "Usuário ativado" : "Usuário desativado")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao alterar status")
    } finally {
      setUsersLoading(false)
    }
  }

  /** Alterna rapidamente entre Administrador e Editor, direto na linha da lista. */
  const handleTogglePanelAccess = async (user: ManagedUser) => {
    const nextRole: UserRole = user.role === "admin" ? "editor" : "admin"
    setUsersLoading(true)
    try {
      await adminApi.users.update(user.id, { role: nextRole })
      setUsers((prev) =>
        prev.map((item) =>
          item.id === user.id
            ? { ...item, role: nextRole, canManageUsers: nextRole === "admin" }
            : item,
        ),
      )
      if (editingUserId === user.id) setUserForm((prev) => ({ ...prev, role: nextRole }))
      toast.success(`Perfil alterado para ${ROLE_LABELS[nextRole]}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao alterar permissão")
    } finally {
      setUsersLoading(false)
    }
  }

  const confirmDeleteUser = async () => {
    if (!deleteTarget) return
    setUsersLoading(true)
    try {
      await adminApi.users.remove(deleteTarget.id)
      setUsers((prev) => prev.filter((item) => item.id !== deleteTarget.id))
      if (editingUserId === deleteTarget.id) closeUserDialog()
      toast.success("Usuário excluído")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao excluir usuário")
    } finally {
      setUsersLoading(false)
      setDeleteTarget(null)
    }
  }

  return (
    <TooltipProvider delayDuration={200}>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <AppHeader
        page="Configuração"
        onBack="/home"
        actions={<ButtonDropdown onLogout={() => logout(router)} />}
      />

      <main className="mx-auto max-w-6xl space-y-6 px-3 py-4 smi:px-6 smi:py-8 lgi:px-8">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="p-4 smi:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-600 text-white shadow-sm smi:h-11 smi:w-11">
                <Settings className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <CardTitle className="text-xl smi:text-2xl">Configuração</CardTitle>
                <CardDescription className="mt-1 text-sm smi:text-base">
                  Crie endpoints e administre contas do painel.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 pt-0 smi:p-6 smi:pt-0">
            <Tabs value={selectedTab} onValueChange={(value: any) => setSelectedTab(value)} className="w-full">
              <TabsList className={`grid w-full ${currentUserAccess ? "grid-cols-2" : "grid-cols-1"}`}>
                <TabsTrigger value="endpoint" className="flex items-center gap-2 text-xs smi:text-sm">
                  <Database className="h-4 w-4" />
                  <span>Novo endpoint</span>
                </TabsTrigger>
                {currentUserAccess ? (
                  <TabsTrigger value="users" className="flex items-center gap-2 text-xs smi:text-sm">
                    <Users className="h-4 w-4" />
                    <span>Contas do painel</span>
                  </TabsTrigger>
                ) : null}
              </TabsList>

              <TabsContent value="endpoint" className="space-y-6 pt-4">
                <div className="grid grid-cols-3 gap-2 smi:gap-3">
                  {endpointTemplates.map((template) => (
                    <button
                      key={template.title}
                      type="button"
                      className="rounded-md border border-slate-200 bg-white p-2 text-left transition hover:border-blue-300 hover:bg-blue-50 smi:p-4"
                      onClick={() => applyTemplate(template.fields)}
                    >
                      <Wand2 className="mb-1.5 h-4 w-4 text-blue-600 smi:mb-3 smi:h-5 smi:w-5" />
                      <div className="text-xs font-semibold leading-snug text-slate-900 smi:text-base">{template.title}</div>
                      <div className="mt-1 text-[11px] leading-snug text-slate-500 smi:text-sm">{template.description}</div>
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endpoint-name" className="text-base font-semibold">Nome da rota</Label>
                  <Input
                    id="endpoint-name"
                    placeholder="ex: produtos, noticias, equipe"
                    value={endpointName}
                    onChange={(event) => {
                      const value = event.target.value
                      if (validateEndpointName(value) || value === "") {
                        setEndpointName(value)
                        setErrors((prev) => ({ ...prev, endpointName: false }))
                      }
                    }}
                    className={errors.endpointName ? "border-red-500" : ""}
                  />
                  <p className="text-sm text-slate-500">Resultado: /api/{endpointName || "nome_da_rota"}</p>
                </div>

                <div className="flex flex-col gap-3 smi:flex-row smi:items-center smi:justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900">Campos personalizados</h3>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      {builderFields.length} campo{builderFields.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <Button type="button" onClick={() => addField()} className="w-full smi:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar campo
                  </Button>
                </div>

                {errors.fields ? (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.fields}</AlertDescription>
                  </Alert>
                ) : null}

                <div className="overflow-hidden rounded-md border border-slate-200">
                  <div className="hidden grid-cols-[48px_1fr_160px_130px_48px] gap-3 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase text-slate-500 mdi:grid">
                    <span />
                    <span>Nome do campo</span>
                    <span>Tipo</span>
                    <span>Multi-Linha</span>
                    <span />
                  </div>
                  <div className="divide-y divide-slate-200">
                    {builderFields.map((field, index) => {
                      const typeSelect = (
                        <Select value={field.type} onValueChange={(value) => updateField(index, { type: value as FieldType, mult: value === "string" ? field.mult : false })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {fieldTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )
                      const multSwitch = (
                        <label className="flex h-10 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm text-slate-700">
                          <Switch
                            checked={field.type === "string" && field.mult}
                            disabled={field.type !== "string"}
                            onCheckedChange={(checked: any) => updateField(index, { mult: field.type === "string" ? checked : false })}
                          />
                          {field.type === "string" ? (field.mult ? "Sim" : "Não") : "—"}
                        </label>
                      )
                      const dragHandle = (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              draggable
                              className="flex h-10 w-10 shrink-0 cursor-grab items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-500"
                              onDragStart={() => setDraggedFieldIndex(index)}
                              aria-label={`Arrastar ${field.name || `campo ${index + 1}`}`}
                            >
                              <GripVertical className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Arrastar para reordenar</TooltipContent>
                        </Tooltip>
                      )
                      const removeButton = (
                        <IconActionButton
                          label={`Remover ${field.name || `campo ${index + 1}`}`}
                          className="text-red-600 hover:bg-red-50"
                          disabled={builderFields.length === 1}
                          onClick={() => removeField(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </IconActionButton>
                      )

                      return (
                        <div
                          key={`${field.name}-${index}`}
                          className={`transition ${
                            draggedFieldIndex === index
                              ? "bg-slate-50 opacity-60"
                              : dragOverFieldIndex === index && draggedFieldIndex !== null
                                ? "bg-blue-50"
                                : "bg-white"
                          }`}
                          onDragOver={(event) => {
                            event.preventDefault()
                            setDragOverFieldIndex(index)
                          }}
                          onDrop={() => {
                            if (draggedFieldIndex !== null) reorderFields(draggedFieldIndex, index)
                            setDraggedFieldIndex(null)
                            setDragOverFieldIndex(null)
                          }}
                          onDragEnd={() => {
                            setDraggedFieldIndex(null)
                            setDragOverFieldIndex(null)
                          }}
                        >
                          {/* Mobile layout */}
                          <div className="flex flex-col gap-3 p-3 mdi:hidden">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-medium text-slate-400">Campo {index + 1}</span>
                              <div className="flex items-center gap-1">
                                <IconActionButton
                                  label={`Mover ${field.name || `campo ${index + 1}`} para cima`}
                                  className="border border-slate-200 bg-slate-50"
                                  onClick={() => reorderFields(index, index - 1)}
                                  disabled={index === 0}
                                >
                                  <ChevronUp className="h-4 w-4" />
                                </IconActionButton>
                                <IconActionButton
                                  label={`Mover ${field.name || `campo ${index + 1}`} para baixo`}
                                  className="border border-slate-200 bg-slate-50"
                                  onClick={() => reorderFields(index, index + 1)}
                                  disabled={index === builderFields.length - 1}
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </IconActionButton>
                                {removeButton}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-medium text-slate-500">Nome do campo</Label>
                              <Input value={field.name} placeholder="ex: telefone" onChange={(event) => updateField(index, { name: event.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs font-medium text-slate-500">Tipo</Label>
                                {typeSelect}
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs font-medium text-slate-500">Multi-linha</Label>
                                {multSwitch}
                              </div>
                            </div>
                          </div>

                          {/* Desktop layout */}
                          <div className="hidden gap-3 p-3 mdi:grid mdi:grid-cols-[48px_1fr_160px_130px_48px] mdi:items-center">
                            {dragHandle}
                            <Input value={field.name} placeholder="ex: telefone" onChange={(event) => updateField(index, { name: event.target.value })} />
                            {typeSelect}
                            {multSwitch}
                            {removeButton}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {canWrite ? (
                  <div className="flex flex-col gap-3 rounded-md border border-blue-100 bg-blue-50 p-4 smi:flex-row smi:items-center smi:justify-between">
                    <p className="text-sm text-blue-800">
                      {endpointName ? `/api/${endpointName}` : "Informe o nome da rota"} com {builderFields.length} campo{builderFields.length === 1 ? "" : "s"}.
                    </p>
                    <Button onClick={handleCreateEndpoint} className="h-12 w-full smi:w-auto" disabled={loading}>
                      <Plus className="h-4 w-4 mr-2" />
                      {loading ? "Criando..." : "Criar endpoint"}
                    </Button>
                  </div>
                ) : (
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Seu perfil é <strong>Leitor</strong>, que tem acesso somente de leitura.
                      Solicite a um administrador para criar endpoints.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              {currentUserAccess ? (
              <TabsContent value="users" className="space-y-4 pt-4">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Buscar por nome ou e-mail..."
                    value={userSearch}
                    onChange={(event) => setUserSearch(event.target.value)}
                    className="h-11 pl-10"
                  />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {filteredUsers.length} conta{filteredUsers.length === 1 ? "" : "s"}
                  </span>
                  <Button type="button" size="sm" onClick={openCreateUserDialog}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Nova conta
                  </Button>
                </div>

                {usersLoading && users.length === 0 ? (
                  <div className="flex min-h-40 items-center justify-center">
                    <span className="loader h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
                  </div>
                ) : users.length === 0 ? (
                  <div className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                    Nenhum usuário cadastrado.
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                    Nenhuma conta encontrada para &quot;{userSearch}&quot;.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className={`flex items-center gap-3 rounded-md border p-3 transition smi:p-4 ${
                          editingUserId === user.id ? "border-blue-300 bg-blue-50/50" : "border-slate-200 bg-white hover:border-blue-200"
                        }`}
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-sm font-semibold text-white">
                          {(user.name || user.email || "?").charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate font-semibold text-slate-900">{user.name || "Sem nome"}</p>
                            {user.disabled ? <Badge variant="destructive">Desativado</Badge> : null}
                            <span
                              className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${ROLE_BADGE[user.role]}`}
                            >
                              <Shield className="h-3 w-3" />
                              {ROLE_LABELS[user.role]}
                            </span>
                          </div>
                          <p className="truncate text-sm text-slate-500">{user.email}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <IconActionButton
                            label="Editar usuário"
                            className="hover:bg-blue-50 hover:text-blue-700"
                            onClick={() => openEditUserDialog(user)}
                          >
                            <KeyRound className="h-4 w-4" />
                          </IconActionButton>
                          <IconActionButton
                            label={user.disabled ? "Ativar usuário" : "Desativar usuário"}
                            className="hover:bg-amber-50 hover:text-amber-700"
                            onClick={() => handleToggleUser(user)}
                          >
                            <ShieldOff className="h-4 w-4" />
                          </IconActionButton>
                          <IconActionButton
                            label={hasAccountsAccess(user) ? "Revogar acesso à aba Contas do painel" : "Conceder acesso à aba Contas do painel"}
                            className="hover:bg-indigo-50 hover:text-indigo-700"
                            onClick={() => handleTogglePanelAccess(user)}
                          >
                            {hasAccountsAccess(user) ? <ShieldX className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                          </IconActionButton>
                          <IconActionButton
                            label="Excluir usuário"
                            className="hover:bg-red-50 hover:text-red-600"
                            onClick={() => setDeleteTarget(user)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </IconActionButton>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              ) : null}
            </Tabs>
          </CardContent>
        </Card>
      </main>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Excluir conta
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a conta <strong>{deleteTarget?.email}</strong>? Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={usersLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={usersLoading}
              onClick={(event) => {
                event.preventDefault()
                confirmDeleteUser()
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={userDialogOpen} onOpenChange={(open) => !open && closeUserDialog()}>
        <DialogContent className="max-h-[90vh] max-w-[calc(100vw-24px)] overflow-y-auto smi:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingUserId ? <Save className="h-5 w-5 text-blue-600" /> : <UserPlus className="h-5 w-5 text-blue-600" />}
              {editingUserId ? "Editar usuário" : "Nova conta"}
            </DialogTitle>
            <DialogDescription>
              {editingUserId ? "Deixe a senha vazia para manter a senha atual." : "A conta criada poderá acessar o painel."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={userForm.name} onChange={(event) => setUserForm((prev) => ({ ...prev, name: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input type="email" value={userForm.email} onChange={(event) => setUserForm((prev) => ({ ...prev, email: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{editingUserId ? "Nova senha" : "Senha"}</Label>
              <Input type="password" value={userForm.password} onChange={(event) => setUserForm((prev) => ({ ...prev, password: event.target.value }))} />
              {!editingUserId ? (
                <p className="text-xs text-slate-500">Mínimo de 10 caracteres. Evite senhas comuns.</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-slate-500" />
                Perfil de acesso
              </Label>
              <Select
                value={userForm.role}
                onValueChange={(value) => setUserForm((prev) => ({ ...prev, role: value as UserRole }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o perfil" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs leading-5 text-slate-500">
                {ROLE_OPTIONS.find((option) => option.value === userForm.role)?.description}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeUserDialog} disabled={usersLoading}>Cancelar</Button>
            <Button type="button" onClick={handleSaveUser} disabled={usersLoading}>
              {editingUserId ? <Save className="h-4 w-4 mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
              {editingUserId ? "Salvar usuário" : "Criar conta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </TooltipProvider>
  )
}
