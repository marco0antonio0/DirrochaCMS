"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, ExternalLink, Eye, FileText } from "lucide-react"
import { AppHeader } from "@/app/components/app-header"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog"
import { Textarea } from "@/app/components/ui/textarea"
import { Alert, AlertDescription } from "@/app/components/ui/alert"
import { Separator } from "@/app/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/app/components/ui/dropdown-menu"
import debounce from "lodash.debounce"
import { logout as handleLogout } from "@/app/services/logout"
import { adminApi } from "@/app/services/adminApi"
import { useRequireAuth } from "@/app/hooks/useCurrentUser"
import { ScrollArea } from "@/app/components/ui/scroll-area"
import ButtonDropdown from "@/app/components/dropButtonMenu"

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>([])
  const [filteredData, setFilteredData] = useState<any>([])
  const [isEmptyData, setIsEmptyData] = useState(false)
  const [showDocs, setShowDocs] = useState(false)

  const router = useRouter()

  // Redireciona para o login quando nao existe sessao valida.
  const { user, loading: authLoading } = useRequireAuth()

  useEffect(() => {
    if (authLoading || !user) return

    setLoading(true)
    adminApi.endpoints
      .list()
      .then((response) => {
        const endpoints = response?.data || []
        if (endpoints.length === 0) {
          setIsEmptyData(true)
        } else {
          setData(endpoints)
          setFilteredData(endpoints)
          setIsEmptyData(false)
        }
      })
      .catch(() => setIsEmptyData(true))
      .finally(() => setLoading(false))
  }, [authLoading, user])

  const handleSearch = useCallback(
    debounce((value: string) => {
      if (!value) {
        setFilteredData(data)
        return
      }

      const filtered = data.filter((item: any) =>
        item.title.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredData(filtered)
    }, 300),
    [data]
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <AppHeader
        actions={
          <ButtonDropdown
            addItem={() => router.push("/configuration")}
            addLabel="Novo endpoint"
            addDescription="Cria uma nova rota de API"
            onSettings={() => router.push("/configuration")}
            onDocs={() => setShowDocs(true)}
            onLogout={() => handleLogout(router)}
          />
        }
      />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-3 py-4 smi:px-6 smi:py-8 lgi:px-8">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="p-4 smi:p-6">
            <div className="flex flex-col smi:flex-row smi:items-center smi:justify-between space-y-4 smi:space-y-0">
              <div className="min-w-0">
                <CardTitle className="text-xl smi:text-2xl">Painel de conteúdo</CardTitle>
                <CardDescription className="mt-1 text-sm smi:text-base">
                  Gerencie os endpoints do seu painel.
                </CardDescription>
              </div>

              <Button onClick={() => router.push("/configuration")} className="w-full smi:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Novo endpoint
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 p-4 pt-0 smi:p-6 smi:pt-0">
            <div className="space-y-2">
              <Label>Buscar endpoints</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nome..."
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : isEmptyData ? (
              <div className="px-4 py-10 text-center smi:py-12">
                <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-base font-medium text-gray-900 smi:text-lg">Nenhum endpoint encontrado</h3>
                <p className="mx-auto mb-4 mt-2 max-w-md text-sm text-gray-600 smi:text-base">
                  Um endpoint define um tipo de conteúdo e sua API. Crie o primeiro para começar.
                </p>
                <Button onClick={() => router.push("/configuration")} className="w-full smi:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo endpoint
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 mdi:grid-cols-2 lgi:grid-cols-3">
                {filteredData.map((endpoint: any) => (
                  <Card
                    key={endpoint.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-200"
                    onClick={() => router.push(`/home/${endpoint.router}`)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg truncate">{endpoint.title}</CardTitle>
                      <CardDescription className="text-sm">/{endpoint.router}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-gray-600">
                          {endpoint.campos?.length || 0} fields
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            const hostname = window.location.hostname
                            const protocol = hostname === "localhost" || hostname === "0.0.0.0" ? "http://" : "https://"
                            const port = hostname === "localhost" || hostname === "0.0.0.0" ? ":3000" : ""
                            window.open(`${protocol}${hostname}${port}/api/${endpoint.router}`, "_blank")
                          }}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          API
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Documentation Modal */}
      <Dialog open={showDocs} onOpenChange={setShowDocs}>
        <DialogContent className="max-h-[80vh] max-w-[calc(100vw-24px)] overflow-y-auto smi:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <span className="text-blue-600">📄</span>
              <span>System Documentation</span>
            </DialogTitle>
            <DialogDescription>
              Complete guide for managing endpoints and content items
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-8">
            {/* Creating an Endpoint */}
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="p-2 bg-blue-50 rounded-md text-blue-600">⚙️</span>
                Creating an Endpoint
              </h3>
              <p className="mt-2 text-gray-700">
                An endpoint is a content type with its own API (e.g. "products" or "blog_posts"). Click the{" "}
                <strong>New Endpoint</strong> button at the top of this page, give it a name, select the fields it
                should have, then click <strong>Create Endpoint</strong>. It will then appear as a card on this
                dashboard.
              </p>
            </div>

            {/* Accessing Endpoint API */}
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="p-2 bg-purple-50 rounded-md text-purple-600">🔗</span>
                Accessing Endpoint API
              </h3>
              <p className="mt-2 text-gray-700">
                Each endpoint has a corresponding API URL that you can access. 
                Click the API button on the endpoint card to open it in a new tab.
              </p>
            </div>

            {/* Managing Content */}
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="p-2 bg-green-50 rounded-md text-green-600">➕</span>
                Managing Content Items
              </h3>
              <p className="mt-2 text-gray-700">
                Click on an endpoint to view and manage its content items. You can add, edit, 
                or delete items as needed. Each item will be available through the endpoint API.
              </p>
            </div>

            {/* User Management */}
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="p-2 bg-yellow-50 rounded-md text-yellow-600">👥</span>
                User Management
              </h3>
              <p className="mt-2 text-gray-700">
                Administrators can create, edit, disable and delete panel accounts from the Configuration page.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowDocs(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DocumentationContent() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <Plus className="w-5 h-5 mr-2 text-blue-600" />
          Creating an Endpoint
        </h3>
        <p className="text-gray-700 leading-relaxed">
          Click the <strong>New Endpoint</strong> button at the top of the Home page. On the Endpoints tab, type a
          name (letters, numbers and underscores only — this becomes part of the API URL), toggle on the fields you
          want, then click <strong>Create Endpoint</strong>. You'll be redirected back to Home, where the new
          endpoint appears as a card with a link to its API.
        </p>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <Eye className="w-5 h-5 mr-2 text-purple-600" />
          Accessing Endpoint API
        </h3>
        <p className="text-gray-700 leading-relaxed">
          On the home page, when accessing an endpoint, there will be a link at the top that directs to the specific API
          for that endpoint.
        </p>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <Plus className="w-5 h-5 mr-2 text-green-600" />
          Adding an Item
        </h3>
        <p className="text-gray-700 leading-relaxed">
          To add a new item to an endpoint, access the desired endpoint and click the <strong>Add</strong> button. Fill
          in the fields with the item information and click <strong>Save</strong> to finish.
        </p>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-yellow-600" />
          Editing or Deleting an Item
        </h3>
        <p className="text-gray-700 leading-relaxed">
          To edit or delete an item, access the endpoint and click on the desired item. On the details page, you can
          change the information or delete the item. To save changes, click <strong>Save</strong>.
        </p>
      </div>
    </div>
  )
}
