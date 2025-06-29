import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/router"
import { ArrowLeft, Plus, Search, ExternalLink, Trash2, Eye, Settings, Database, FileText, LogOut, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import debounce from "lodash.debounce"
import toast from "react-hot-toast"
import Cookies from "js-cookie"
import axios from "axios"
import { logout as handleLogout } from "@/services/logout"
import { endpointService } from "@/services/endpointService"
import { User } from "@/services/user/user"
import Head from "next/head"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>([])
  const [filteredData, setFilteredData] = useState<any>([])
  const [isEmptyData, setIsEmptyData] = useState(false)
  const [selectedTab, setSelectedTab] = useState("endpoints")
  const [authSettings, setAuthSettings] = useState({
    loginEnabled: false,
    registerEnabled: false,
  })
  const [showDocs, setShowDocs] = useState(false)

  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      const token = Cookies.get("token")
    
      if (!token) {
        return false
      }
    
      try {
        await axios.get("/api/verifyToken", {
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
        handleLogout(router)
      }
    })

    async function fetchAuthSettings() {
      const settings = await User.getAuthVisibility()
      setAuthSettings(settings)
    }

    fetchAuthSettings()
  }, [])

  useEffect(() => {
    setLoading(true)
    if (selectedTab === "endpoints") {
      endpointService.listEndpoints()
        .then((response: any) => {
          if (response.data.length === 0) {
            setIsEmptyData(true)
          } else {
            setData(response.data)
            setFilteredData(response.data)
            setIsEmptyData(false)
          }
          setLoading(false)
        })
        .catch(() => {
          setIsEmptyData(true)
          setLoading(false)
        })
    } else if (selectedTab === "users") {
      User.listUsers()
        .then((response: any) => {
          if (response.data.length === 0) {
            setIsEmptyData(true)
          } else {
            setData(response.data)
            setFilteredData(response.data)
            setIsEmptyData(false)
          }
          setLoading(false)
        })
        .catch(() => {
          setIsEmptyData(true)
          setLoading(false)
        })
    }
  }, [selectedTab])

  const handleSearch = useCallback(
    debounce((value: string) => {
      if (!value) {
        setFilteredData(data)
        return
      }
      
      const filtered = data.filter((item: any) =>
        (selectedTab === "endpoints" ? item.title : item.email)
          .toLowerCase()
          .includes(value.toLowerCase())
      )
      setFilteredData(filtered)
    }, 300),
    [data, selectedTab]
  )

  function handleUserDelete(email: string) {
    setData((prev: any) => prev.filter((user: any) => user.email !== email))
    setFilteredData((prev: any) => prev.filter((user: any) => user.email !== email))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Head>
        <title>Home - Content Management System</title>
        <meta name="description" content="Plataforma de gerenciamento de conteúdos e endpoints" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 smi:px-6 lgi:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Database className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">DirrochaCMS</h1>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={() => router.push("/create")}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="hidden smi:flex">
                    <FileText className="w-4 h-4 mr-2" />
                    Docs
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                      <FileText className="w-5 h-5" />
                      <span>DirrochaCMS Documentation</span>
                    </DialogTitle>
                    <DialogDescription>Complete guide for managing endpoints and items</DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="h-[60vh] pr-4">
                    <DocumentationContent />
                  </ScrollArea>
                </DialogContent>
              </Dialog>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleLogout(router)
                }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 smi:px-6 lgi:px-8 py-8">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex flex-col smi:flex-row smi:items-center smi:justify-between space-y-4 smi:space-y-0">
              <div>
                <CardTitle className="text-2xl">Content Dashboard</CardTitle>
                <CardDescription className="text-base mt-1">
                  Manage your endpoints and users in one place
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <Tabs 
              value={selectedTab} 
              onValueChange={(value:any) => setSelectedTab(value)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="endpoints" className="flex items-center space-x-2">
                    <Database className="w-4 h-4" />
                    <span>Endpoints</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="users"
                    className="flex items-center space-x-2"
                    disabled={!authSettings.loginEnabled && !authSettings.registerEnabled}
                  >
                    <Users className="w-4 h-4" />
                    <span>Users</span>
                  </TabsTrigger>
                </TabsList>

              <TabsContent value="endpoints" className="space-y-6">
                <div className="space-y-2">
                  <Label>Search Endpoints</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search by name..."
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
                  <div className="text-center py-12">
                    <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No endpoints found</h3>
                    <p className="text-gray-600 mb-4">Create your first endpoint in settings</p>
                    <Button onClick={() => router.push("/create")}>
                      <Settings className="w-4 h-4 mr-2" />
                      Go to Settings
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lgi:grid-cols-3">
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
                          <div className="flex justify-between items-center">
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
              </TabsContent>

              <TabsContent value="users" className="space-y-6">
                <div className="space-y-2">
                  <Label>Search Users</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search by email..."
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
                  <div className="text-center py-12">
                    <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                    <p className="text-gray-600">User registration might be disabled</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredData.map((user: any) => (
                      <Card key={user.email}>
                        <CardContent className="p-4 flex justify-between items-center">
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => {
                              User.deleteUser(user.email).then(() => {
                                handleUserDelete(user.email)
                                toast.success("User deleted successfully")
                              }).catch(() => {
                                toast.error("Failed to delete user")
                              })
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      {/* Documentation Modal */}
      <Dialog open={showDocs} onOpenChange={setShowDocs}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
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
                To create a new endpoint, go to Settings and fill in the endpoint details. 
                Specify the fields you want to include and their types. Click "Save" when done.
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
                When user authentication is enabled, you can manage registered users in the Users tab. 
                Administrators can delete users as needed.
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
          <Settings className="w-5 h-5 mr-2 text-blue-600" />
          Creating an Endpoint
        </h3>
        <p className="text-gray-700 leading-relaxed">
          To create a new endpoint, click the <strong>Settings</strong> button. Fill in the endpoint name and select the
          fields you want to include. Click <strong>Save</strong> to finalize.
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
