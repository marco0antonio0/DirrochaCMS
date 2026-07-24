"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Database, FileText, Globe, GripVertical, ImageIcon, ListPlus, Plus, Settings, Shield, Trash2, Users, Wand2, Info } from "lucide-react"
import { AppHeader } from "@/app/components/app-header"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { Switch } from "@/app/components/ui/switch"
import { Badge } from "@/app/components/ui/badge"
import { Alert, AlertDescription } from "@/app/components/ui/alert"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/app/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog"
import { ScrollArea } from "@/app/components/ui/scroll-area"
import { Separator } from "@/app/components/ui/separator"
import toast from "react-hot-toast"
import Cookies from "js-cookie"
import axios from "axios"
import { logout } from "@/app/services/logout"
import { endpointService } from "@/backend/endpoint/endpoint.service"
import { User } from "@/backend/user/user.service"
import ButtonDropdown from "@/app/components/dropButtonMenu"
import { adminPath } from "@/app/lib/admin-path"
import { siteService } from "@/backend/site/site.service"

interface FieldOption {
  key: string
  title: string
  description: string
  type: FieldType
  mult: boolean
  icon: string
}

type FieldType = "string" | "number" | "date" | "img"

interface EndpointFieldSchema {
  name: string
  type: FieldType
  mult: boolean
}

const fieldOptions: FieldOption[] = [
  { key: "titulo", title: "Titulo", description: "Titulo principal", type: "string", mult: false, icon: "📝" },
  { key: "data", title: "Data", description: "Campo de data", type: "date", mult: false, icon: "📅" },
  { key: "descricao", title: "Descricao", description: "Texto longo", type: "string", mult: true, icon: "📄" },
  { key: "breve_descricao", title: "Resumo", description: "Resumo curto", type: "string", mult: true, icon: "📋" },
  { key: "artigo", title: "Artigo", description: "Conteudo completo", type: "string", mult: true, icon: "📰" },
  { key: "image", title: "Imagem", description: "Upload de imagem", type: "img", mult: false, icon: "🖼️" },
  { key: "nome", title: "Nome", description: "Nome", type: "string", mult: false, icon: "👤" },
  { key: "senha", title: "Senha", description: "Senha", type: "string", mult: false, icon: "🔒" },
  { key: "texto", title: "Texto", description: "Texto livre", type: "string", mult: true, icon: "✏️" },
  { key: "link", title: "Link", description: "URL ou referencia", type: "string", mult: false, icon: "🔗" },
  { key: "preco", title: "Preco", description: "Valor numerico", type: "number", mult: false, icon: "💰" },
]

const fieldTypes: Array<{ value: FieldType; label: string; description: string }> = [
  { value: "string", label: "Texto", description: "Texto curto ou longo" },
  { value: "number", label: "Numero", description: "Valores numericos" },
  { value: "date", label: "Data", description: "Campo de data" },
  { value: "img", label: "Imagem", description: "Upload de imagem" },
]

const wordpressPostFields: EndpointFieldSchema[] = [
  { name: "titulo", type: "string", mult: false },
  { name: "descricao", type: "string", mult: true },
  { name: "image", type: "img", mult: false },
  { name: "data", type: "date", mult: false },
  { name: "artigo", type: "string", mult: true },
]

const wordpressPageFields: EndpointFieldSchema[] = [
  { name: "titulo", type: "string", mult: false },
  { name: "descricao", type: "string", mult: true },
  { name: "image", type: "img", mult: false },
  { name: "artigo", type: "string", mult: true },
]

export default function CreatePage() {
  const [selectedTab, setSelectedTab] = useState("endpoint")
  const [loading, setLoading] = useState(false)
  const [endpointName, setEndpointName] = useState("")
  const [builderFields, setBuilderFields] = useState<EndpointFieldSchema[]>([
    { name: "titulo", type: "string", mult: false },
  ])
  const [draggedFieldIndex, setDraggedFieldIndex] = useState<number | null>(null)
  const [dragOverFieldIndex, setDragOverFieldIndex] = useState<number | null>(null)
  const [errors, setErrors] = useState({ endpointName: false, fields: "" })

  // User settings
  const [userSettings, setUserSettings] = useState({
    loginEnabled: false,
    registerEnabled: false,
    logoutEnabled: false,
  })
  const [siteSettings, setSiteSettings] = useState({
    blogEnabled: false,
    title: "DirrochaCMS Blog",
    description: "Conteúdos publicados pelo DirrochaCMS.",
    postsEndpoint: "",
    pagesEndpoint: "",
    primaryColor: "#2563EB",
    homeLayout: "blog" as "blog" | "page",
    homePageSlug: "",
  })
  const [availableEndpoints, setAvailableEndpoints] = useState<any[]>([])

  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      const token = Cookies.get("token")
    
      if (!token) {
        return false
      }
    
      try {
        const response = await axios.get("/api/verifyToken", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
    
        return true
      } catch (error) {
        return false
      }
    }

    checkAuth().then((isAuthenticated) => {
      if (!isAuthenticated) {
        logout(router)
      }
    })

    // Fetch current user settings
    fetchUserSettings()
    fetchSiteSettings()
    fetchAvailableEndpoints()
  }, [])

  const fetchUserSettings = async () => {
    try {
      const settings = await User.getAuthVisibility()
      setUserSettings({
        loginEnabled: settings.loginEnabled,
        registerEnabled: settings.registerEnabled,
        logoutEnabled: settings.logoutEnabled,
      })
    } catch (error) {
      toast.error("Failed to fetch user settings")
    }
  }

  const fetchSiteSettings = async () => {
    try {
      const settings = await siteService.getSettings()
      setSiteSettings({
        ...settings,
        homeLayout: settings.homeLayout === "page" ? "page" : "blog",
      })
    } catch (error) {
      toast.error("Failed to fetch site settings")
    }
  }

  const fetchAvailableEndpoints = async () => {
    try {
      const response: any = await endpointService.listEndpoints()
      setAvailableEndpoints(response.data || [])
    } catch (error) {
      setAvailableEndpoints([])
    }
  }

  const validateEndpointName = (name: string): boolean => {
    return /^[a-zA-Z0-9_]+$/.test(name)
  }

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
    const nextFields = [
      ...builderFields,
      {
        name: getUniqueFieldName(field?.name || `campo_${builderFields.length + 1}`),
        type: field?.type || "string",
        mult: field?.mult || false,
      },
    ]
    setBuilderFields(nextFields)
    setErrors((prev) => ({ ...prev, fields: "" }))
  }

  const updateField = (index: number, patch: Partial<EndpointFieldSchema>) => {
    const nextFields = builderFields.map((field, i) => (i === index ? { ...field, ...patch } : field))
    setBuilderFields(nextFields)
    setErrors((prev) => ({ ...prev, fields: "" }))
  }

  const updateFieldType = (index: number, type: FieldType) => {
    updateField(index, {
      type,
      mult: type === "string" ? builderFields[index]?.mult || false : false,
    })
  }

  const removeField = (index: number) => {
    const nextFields = builderFields.filter((_, i) => i !== index)
    setBuilderFields(nextFields)
    setErrors((prev) => ({ ...prev, fields: "" }))
  }

  const reorderFields = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return
    if (fromIndex < 0 || toIndex < 0) return
    if (fromIndex >= builderFields.length || toIndex >= builderFields.length) return

    const nextFields = [...builderFields]
    const [field] = nextFields.splice(fromIndex, 1)
    nextFields.splice(toIndex, 0, field)
    setBuilderFields(nextFields)
    setErrors((prev) => ({ ...prev, fields: "" }))
  }

  const applyTemplate = (template: EndpointFieldSchema[]) => {
    setBuilderFields(template)
    setErrors((prev) => ({ ...prev, fields: "" }))
  }

  const handleCreateEndpoint = async () => {
    let payload: { title: string; router: string; campos: EndpointFieldSchema[] }
    try {
      const routerName = endpointName.trim()
      if (!routerName) throw new Error("Informe o nome da rota.")
      if (!validateEndpointName(routerName)) throw new Error("A rota deve usar letras, números e underscores.")
      const fields = validateBuilderFields()
      payload = { title: routerName, router: routerName, campos: fields }
      setErrors({ endpointName: false, fields: "" })
    } catch (error: any) {
      setErrors({
        endpointName: endpointName.trim() === "",
        fields: error.message || "Revise os campos.",
      })
      toast.error(error.message || "Revise os campos.")
      return
    }

    const toastId = toast.loading("Creating endpoint...", { duration: 4000 })
    setLoading(true)
    
    try {
      const result = await endpointService.addEndpoint({
        title: payload.title,
        router: payload.router,
        campos: payload.campos
      })

      if (result && result.success) {
        setTimeout(() => {
          setLoading(false)
          toast.dismiss(toastId)
          toast.success("Endpoint created successfully!", { duration: 4000 })
          router.push(adminPath("/home"))
        }, 1000)
      } else {
        setTimeout(() => {
          setLoading(false)
          toast.dismiss(toastId)
          toast.error("Failed to create endpoint", { duration: 4000 })
        }, 1000)
      }
    } catch (error) {
      toast.dismiss(toastId)
      toast.error("Error creating endpoint", { duration: 4000 })
      console.error("Error adding endpoint:", error)
      setLoading(false)
    }
  }

  const handleSaveUserSettings = async () => {
    const toastId = toast.loading("Saving changes...", { duration: 4000 })
    setLoading(true)
    
    try {
      const success = await User.setAuthVisibility({ 
        login: userSettings.loginEnabled,
        register: userSettings.registerEnabled,
        logout: userSettings.logoutEnabled
      })

      if (success) {
        setTimeout(() => {
          setLoading(false)
          toast.dismiss(toastId)
          toast.success("Changes saved successfully!", { duration: 4000 })
          router.push(adminPath("/home"))
        }, 1000)
      } else {
        setTimeout(() => {
          setLoading(false)
          toast.dismiss(toastId)
          toast.error("Error saving changes", { duration: 4000 })
        }, 1000)
      }
    } catch (error) {
      toast.dismiss(toastId)
      toast.error("Error saving changes", { duration: 4000 })
      console.error("Error saving user settings:", error)
      setLoading(false)
    }
  }

  const handleSaveSiteSettings = async () => {
    const toastId = toast.loading("Salvando site...", { duration: 4000 })
    setLoading(true)

    try {
      const result = await siteService.setSettings(siteSettings)
      toast.dismiss(toastId)

      if (result.success) {
        toast.success("Configurações do site salvas", { duration: 4000 })
      } else {
        toast.error("Erro ao salvar site", { duration: 4000 })
      }
    } catch (error) {
      toast.dismiss(toastId)
      toast.error("Erro ao salvar site", { duration: 4000 })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateWordPressStructure = async () => {
    const toastId = toast.loading("Criando estrutura do site...", { duration: 4000 })
    setLoading(true)

    try {
      const endpoints: any = await endpointService.listEndpoints()
      const currentEndpoints = endpoints.data || []

      const ensureEndpoint = async (payload: { title: string; router: string; campos: EndpointFieldSchema[] }) => {
        const existing = currentEndpoints.find((endpoint: any) => endpoint.router === payload.router)
        if (existing) return existing

        const result = await endpointService.addEndpoint(payload)
        if (!result.success) {
          throw new Error(`Erro ao criar endpoint ${payload.router}`)
        }

        return result
      }

      await ensureEndpoint({ title: "Posts", router: "posts", campos: wordpressPostFields })
      await ensureEndpoint({ title: "Páginas", router: "paginas", campos: wordpressPageFields })

      const nextSettings = {
        ...siteSettings,
        blogEnabled: true,
        postsEndpoint: "posts",
        pagesEndpoint: "paginas",
        homeLayout: "blog" as "blog" | "page",
      }

      const saveResult = await siteService.setSettings(nextSettings)
      if (!saveResult.success) {
        throw new Error("Erro ao salvar configurações do site")
      }

      setSiteSettings(nextSettings)
      await fetchAvailableEndpoints()
      toast.dismiss(toastId)
      toast.success("Estrutura WordPress criada", { duration: 4000 })
    } catch (error) {
      toast.dismiss(toastId)
      toast.error("Erro ao criar estrutura WordPress", { duration: 4000 })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <AppHeader
        page="Configuração"
        onBack={adminPath("/home")}
        actions={
          <ButtonDropdown
            addItem={() => setSelectedTab("endpoint")}
            addLabel="Novo endpoint"
            addDescription="Volta para o builder de endpoint"
            onSettings={() => setSelectedTab("users")}
            onLogout={() => logout(router)}
          />
        }
      />

      <main className="mx-auto max-w-6xl px-3 py-4 smi:px-6 smi:py-8 lgi:px-8">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="p-4 smi:p-6">
            <CardTitle className="text-xl smi:text-2xl">Configuração</CardTitle>
            <CardDescription className="text-sm smi:text-base">
              Crie endpoints e ajuste configurações de usuários.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 pt-0 smi:p-6 smi:pt-0">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="endpoint" className="flex items-center space-x-2 text-xs smi:text-sm">
                  <Database className="w-4 h-4" />
                  <span>Endpoints</span>
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center space-x-2 text-xs smi:text-sm">
                  <Users className="w-4 h-4" />
                  <span>Usuários</span>
                </TabsTrigger>
                <TabsTrigger value="site" className="flex items-center space-x-2 text-xs smi:text-sm">
                  <Globe className="w-4 h-4" />
                  <span>Site</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="endpoint" className="space-y-6 mt-6">
                <div className="space-y-5">
                  <div className="grid gap-3 mdi:grid-cols-3">
                    <button
                      type="button"
                      className="rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
                      onClick={() => applyTemplate([
                        { name: "titulo", type: "string", mult: false },
                        { name: "descricao", type: "string", mult: true },
                        { name: "image", type: "img", mult: false },
                      ])}
                    >
                      <FileText className="mb-3 h-5 w-5 text-blue-600" />
                      <div className="font-semibold text-slate-900">Conteúdo</div>
                      <div className="mt-1 text-sm text-slate-500">Título, descrição e imagem.</div>
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
                      onClick={() => applyTemplate([
                        { name: "nome", type: "string", mult: false },
                        { name: "preco", type: "number", mult: false },
                        { name: "image", type: "img", mult: false },
                      ])}
                    >
                      <ImageIcon className="mb-3 h-5 w-5 text-blue-600" />
                      <div className="font-semibold text-slate-900">Produto</div>
                      <div className="mt-1 text-sm text-slate-500">Nome, preço e imagem.</div>
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
                      onClick={() => applyTemplate([
                        { name: "titulo", type: "string", mult: false },
                        { name: "data", type: "date", mult: false },
                        { name: "local", type: "string", mult: false },
                        { name: "descricao", type: "string", mult: true },
                      ])}
                    >
                      <ListPlus className="mb-3 h-5 w-5 text-blue-600" />
                      <div className="font-semibold text-slate-900">Evento</div>
                      <div className="mt-1 text-sm text-slate-500">Título, data, local e descrição.</div>
                    </button>
                  </div>

                  <Card className="border-slate-200">
                    <CardHeader className="border-b border-slate-100 p-4 pb-4 smi:p-6 smi:pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg smi:text-xl">
                        <Database className="h-5 w-5 text-blue-600" />
                        Novo endpoint
                      </CardTitle>
                      <CardDescription>
                        Defina a rota e os campos que aparecerão no formulário de cadastro.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 p-4 smi:p-5">
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="endpoint-name" className="text-base font-semibold">Nome da rota</Label>
                          <Input
                            id="endpoint-name"
                            placeholder="ex: produtos, noticias, equipe"
                            value={endpointName}
                            onChange={(e) => {
                              const value = e.target.value
                              if (validateEndpointName(value) || value === "") {
                                setEndpointName(value)
                                setErrors((prev) => ({ ...prev, endpointName: false }))
                              }
                            }}
                            className={errors.endpointName ? "border-red-500" : ""}
                          />
                          {errors.endpointName ? (
                            <p className="text-sm text-red-600">Informe o nome da rota.</p>
                          ) : (
                            <p className="text-sm text-slate-500">Resultado: /api/{endpointName || "nome_da_rota"}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex flex-col gap-3 smi:flex-row smi:items-center smi:justify-between">
                          <div>
                            <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                              <Wand2 className="h-4 w-4 text-blue-600" />
                              Campos personalizados
                            </h3>
                            <p className="text-sm text-slate-500">Crie nomes livres e escolha o tipo de cada campo.</p>
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
                            {builderFields.map((field, index) => (
                              <div
                                key={`${field.name}-${index}`}
                                className={`grid gap-3 p-3 transition mdi:grid-cols-[48px_1fr_160px_130px_48px] mdi:items-center ${
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
                                <div className="flex items-center justify-between gap-2 mdi:block">
                                  <button
                                    type="button"
                                    draggable
                                    className="flex h-10 w-10 cursor-grab items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-slate-300 hover:bg-white hover:text-slate-700 active:cursor-grabbing"
                                    onDragStart={() => setDraggedFieldIndex(index)}
                                    aria-label={`Arrastar ${field.name || `campo ${index + 1}`}`}
                                  >
                                    <GripVertical className="h-4 w-4" />
                                  </button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="mdi:hidden"
                                    onClick={() => removeField(index)}
                                    disabled={builderFields.length === 1}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </Button>
                                </div>
                                <div className="space-y-1 mdi:space-y-0">
                                  <span className="text-xs font-semibold uppercase text-slate-500 mdi:hidden">Nome do campo</span>
                                  <Input
                                    value={field.name}
                                    placeholder="ex: telefone"
                                    onChange={(event) => updateField(index, { name: event.target.value })}
                                  />
                                </div>
                                <div className="space-y-1 mdi:space-y-0">
                                  <span className="text-xs font-semibold uppercase text-slate-500 mdi:hidden">Tipo</span>
                                  <Select value={field.type} onValueChange={(value) => updateFieldType(index, value as FieldType)}>
                                    <SelectTrigger className="h-10 border-slate-200 bg-white shadow-sm transition hover:border-slate-300 focus:ring-2 focus:ring-blue-100">
                                      <SelectValue placeholder="Tipo" />
                                    </SelectTrigger>
                                    <SelectContent className="border-slate-200">
                                      {fieldTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                          {type.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <label
                                  className={`flex h-10 items-center gap-2 rounded-md border px-3 text-sm transition ${
                                    field.type === "string"
                                      ? "border-slate-200 bg-white text-slate-700"
                                      : "justify-center border-slate-100 bg-slate-50 text-slate-400"
                                  }`}
                                >
                                  <Switch
                                    checked={field.type === "string" && field.mult}
                                    disabled={field.type !== "string"}
                                    onCheckedChange={(checked:any) => updateField(index, { mult: field.type === "string" ? checked : false })}
                                    aria-label="Multi-linha"
                                  />
                                  {field.type === "string" ? (field.mult ? "Sim" : "Não") : null}
                                </label>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="hidden mdi:inline-flex"
                                  onClick={() => removeField(index)}
                                  disabled={builderFields.length === 1}
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <Accordion type="single" collapsible className="rounded-md border border-slate-200 px-4">
                        <AccordionItem value="field-shortcuts" className="border-b-0">
                          <AccordionTrigger className="py-3 text-sm font-semibold text-slate-900 hover:no-underline">
                            Atalhos de campo
                          </AccordionTrigger>
                          <AccordionContent className="pb-4">
                            <div className="grid gap-2 smi:grid-cols-2 mdi:flex mdi:flex-wrap">
                              {fieldOptions.map((field) => (
                                <Button
                                  key={field.key}
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  className="justify-start mdi:justify-center"
                                  onClick={() => addField({ name: field.key, type: field.type, mult: field.mult })}
                                >
                                  {field.icon} {field.title}
                                </Button>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>

                      <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                        <div className="flex flex-col gap-3 smi:flex-row smi:items-center smi:justify-between">
                        <div className="min-w-0">
                          <p className="font-semibold text-blue-950">Pronto para criar</p>
                          <p className="break-words text-sm text-blue-800">
                            {endpointName ? `/api/${endpointName}` : "Informe o nome da rota"} com {builderFields.length} campo{builderFields.length === 1 ? "" : "s"}.
                          </p>
                        </div>
                        <Button
                          onClick={handleCreateEndpoint}
                          className="h-12 w-full text-base font-medium smi:min-w-44 smi:w-auto"
                          disabled={loading}
                        >
                          {loading ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Criando...</span>
                            </div>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 mr-2" />
                              Criar endpoint
                            </>
                          )}
                        </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="users" className="space-y-6 mt-6">
                <div className="space-y-6">
                  <div className="flex flex-col gap-3 smi:flex-row smi:items-center smi:justify-between">
                    <div className="min-w-0">
                      <h3 className="text-lg font-medium">Gerenciamento de usuários</h3>
                      <p className="mt-1 text-sm text-gray-600">
                        Configure autenticação e cadastro de usuários.
                      </p>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full smi:w-auto">
                          <Info className="w-4 h-4 mr-2" />
                          Ver detalhes
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-h-[85vh] max-w-[calc(100vw-24px)] smi:max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Documentação de usuários</DialogTitle>
                          <DialogDescription>Veja como usar os endpoints de autenticação.</DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="h-[60vh] pr-4">
                          <UserManagementDocs />
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="space-y-4">
                    <Card className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0 space-y-1">
                          <h4 className="font-medium">Login de usuário</h4>
                          <p className="text-sm text-gray-600">
                            Habilita autenticação em /api/user/login.
                          </p>
                        </div>
                        <Switch
                          className="shrink-0"
                          checked={userSettings.loginEnabled}
                          onCheckedChange={(checked:any) => setUserSettings((prev) => ({ ...prev, loginEnabled: checked }))}
                        />
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0 space-y-1">
                          <h4 className="font-medium">Cadastro de usuário</h4>
                          <p className="text-sm text-gray-600">
                            Permite cadastro em /api/user/register.
                          </p>
                        </div>
                        <Switch
                          className="shrink-0"
                          checked={userSettings.registerEnabled}
                          onCheckedChange={(checked:any) =>
                            setUserSettings((prev) => ({ ...prev, registerEnabled: checked }))
                          }
                        />
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0 space-y-1">
                          <h4 className="font-medium">Logout de usuário</h4>
                          <p className="text-sm text-gray-600">
                            Habilita invalidação de token em /api/user/logout.
                          </p>
                        </div>
                        <Switch
                          className="shrink-0"
                          checked={userSettings.logoutEnabled}
                          onCheckedChange={(checked:any) =>
                            setUserSettings((prev) => ({ ...prev, logoutEnabled: checked }))
                          }
                        />
                      </div>
                    </Card>
                  </div>

                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Os recursos de usuários dependem da configuração correta do Firebase e das variáveis de ambiente.
                    </AlertDescription>
                  </Alert>

                  <Button
                    onClick={handleSaveUserSettings}
                    className="w-full h-12 text-base font-medium"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Salvando...</span>
                      </div>
                    ) : (
                      <>
                        <Settings className="w-4 h-4 mr-2" />
                        Salvar configuração
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="site" className="space-y-6 mt-6">
                <Card className="border-slate-200">
                  <CardHeader className="border-b border-slate-100 p-4 smi:p-6">
                    <CardTitle className="flex items-center gap-2 text-lg smi:text-xl">
                      <Globe className="h-5 w-5 text-blue-600" />
                      Gerador de site estilo WordPress
                    </CardTitle>
                    <CardDescription>
                      Configure o site público com posts, páginas, menu e aparência básica.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5 p-4 smi:p-6">
                    <div className="rounded-md border border-slate-200 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">Habilitar blog público</p>
                          <p className="mt-1 text-sm text-slate-500">
                            Ativa a página inicial pública baseada nos dados do CMS.
                          </p>
                        </div>
                        <Switch
                          className="shrink-0"
                          checked={siteSettings.blogEnabled}
                          onCheckedChange={(checked:any) => setSiteSettings((prev) => ({ ...prev, blogEnabled: checked }))}
                        />
                      </div>
                    </div>

                    <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                      <div className="flex flex-col gap-4 mdi:flex-row mdi:items-center mdi:justify-between">
                        <div className="min-w-0">
                          <p className="font-semibold text-blue-950">Estrutura WordPress</p>
                          <p className="mt-1 text-sm leading-6 text-blue-800">
                            Cria os endpoints `posts` e `paginas`, configura o menu público e deixa o CMS pronto para publicar.
                          </p>
                        </div>
                        <Button
                          type="button"
                          onClick={handleCreateWordPressStructure}
                          disabled={loading}
                          className="h-11 w-full shrink-0 mdi:w-auto"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Criar estrutura
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-4 mdi:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Título do site</Label>
                        <Input
                          value={siteSettings.title}
                          onChange={(event) => setSiteSettings((prev) => ({ ...prev, title: event.target.value }))}
                          placeholder="ex: Blog da empresa"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Cor principal</Label>
                        <div className="grid grid-cols-[48px_1fr] gap-2">
                          <input
                            type="color"
                            value={siteSettings.primaryColor}
                            onChange={(event) => setSiteSettings((prev) => ({ ...prev, primaryColor: event.target.value }))}
                            className="h-10 w-12 rounded-md border border-slate-200 bg-white p-1"
                            aria-label="Cor principal do site"
                          />
                          <Input
                            value={siteSettings.primaryColor}
                            onChange={(event) => setSiteSettings((prev) => ({ ...prev, primaryColor: event.target.value }))}
                            placeholder="#2563EB"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <Input
                        value={siteSettings.description}
                        onChange={(event) => setSiteSettings((prev) => ({ ...prev, description: event.target.value }))}
                        placeholder="Descreva o blog público"
                      />
                    </div>

                    <div className="grid gap-4 mdi:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Endpoint de posts</Label>
                        <Select
                          value={siteSettings.postsEndpoint || "none"}
                          onValueChange={(value) => setSiteSettings((prev) => ({ ...prev, postsEndpoint: value === "none" ? "" : value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um endpoint" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nenhum endpoint</SelectItem>
                            {availableEndpoints.map((endpoint) => (
                              <SelectItem key={endpoint.id} value={endpoint.router}>
                                {endpoint.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Endpoint de páginas</Label>
                        <Select
                          value={siteSettings.pagesEndpoint || "none"}
                          onValueChange={(value) => setSiteSettings((prev) => ({ ...prev, pagesEndpoint: value === "none" ? "" : value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um endpoint" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nenhum endpoint</SelectItem>
                            {availableEndpoints.map((endpoint) => (
                              <SelectItem key={endpoint.id} value={endpoint.router}>
                                {endpoint.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-4 mdi:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Modelo da página inicial</Label>
                        <Select
                          value={siteSettings.homeLayout}
                          onValueChange={(value) => setSiteSettings((prev) => ({ ...prev, homeLayout: value as "blog" | "page" }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o modelo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="blog">Últimos posts</SelectItem>
                            <SelectItem value="page">Página fixa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Slug da página inicial</Label>
                        <Input
                          value={siteSettings.homePageSlug}
                          disabled={siteSettings.homeLayout !== "page"}
                          onChange={(event) => setSiteSettings((prev) => ({ ...prev, homePageSlug: event.target.value }))}
                          placeholder="ex: inicio"
                        />
                      </div>
                    </div>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Para funcionar como WordPress, use um endpoint de posts com `titulo`, `descricao`, `image`, `artigo`
                        e um endpoint de páginas com `titulo`, `descricao`, `artigo`.
                      </AlertDescription>
                    </Alert>

                    <Button
                      onClick={handleSaveSiteSettings}
                      className="h-12 w-full text-base font-medium"
                      disabled={loading}
                    >
                      {loading ? "Salvando..." : "Salvar site/blog"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function UserManagementDocs() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-blue-600" />
          Authentication - Login
        </h3>
        <p className="text-gray-700 leading-relaxed mb-4">
          Authenticate users by sending a POST request to the login endpoint:
        </p>

        <div className="bg-gray-100 rounded-lg p-4 mb-4">
          <p className="font-medium mb-2">Endpoint:</p>
          <Badge variant="secondary">/api/user/login</Badge>

          <p className="font-medium mt-4 mb-2">Method:</p>
          <Badge>POST</Badge>

          <p className="font-medium mt-4 mb-2">Request Body:</p>
          <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
            {`{
  "email": "user@example.com",
  "password": "password123"
}`}
          </pre>

          <p className="font-medium mt-4 mb-2">Response:</p>
          <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
            {`{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}`}
          </pre>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <Users className="w-5 h-5 mr-2 text-green-600" />
          Registration - Create Account
        </h3>
        <p className="text-gray-700 leading-relaxed mb-4">
          Allow users to create new accounts by sending a POST request:
        </p>

        <div className="bg-gray-100 rounded-lg p-4 mb-4">
          <p className="font-medium mb-2">Endpoint:</p>
          <Badge variant="secondary">/api/user/register</Badge>

          <p className="font-medium mt-4 mb-2">Method:</p>
          <Badge>POST</Badge>

          <p className="font-medium mt-4 mb-2">Request Body:</p>
          <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
            {`{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}`}
          </pre>

          <p className="font-medium mt-4 mb-2">Response:</p>
          <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
            {`{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}`}
          </pre>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <Settings className="w-5 h-5 mr-2 text-red-600" />
          Logout - Invalidate Token
        </h3>
        <p className="text-gray-700 leading-relaxed mb-4">
          Invalidate user tokens by sending a POST request with authentication:
        </p>

        <div className="bg-gray-100 rounded-lg p-4">
          <p className="font-medium mb-2">Endpoint:</p>
          <Badge variant="secondary">/api/user/logout</Badge>

          <p className="font-medium mt-4 mb-2">Method:</p>
          <Badge>POST</Badge>

          <p className="font-medium mt-4 mb-2">Headers:</p>
          <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
            {`Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}
          </pre>

          <p className="font-medium mt-4 mb-2">Response:</p>
          <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
            {`{
  "message": "Token invalidated successfully"
}`}
          </pre>
        </div>
      </div>
    </div>
  )
}
