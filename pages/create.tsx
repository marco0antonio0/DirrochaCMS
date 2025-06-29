"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Database, Users, Plus, Settings, Shield, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import toast from "react-hot-toast"
import Cookies from "js-cookie"
import axios from "axios"
import { logout } from "@/services/logout"
import { endpointService } from "@/services/endpointService"
import { User } from "@/services/user/user"

interface FieldOption {
  key: string
  title: string
  description: string
  type: string
  icon: string
}

const fieldOptions: FieldOption[] = [
  { key: "titulo", title: "Title", description: "Main title or heading", type: "string", icon: "📝" },
  { key: "data", title: "Date", description: "Date field for timestamps", type: "date", icon: "📅" },
  { key: "descricao", title: "Description", description: "Long text description", type: "text", icon: "📄" },
  { key: "breve_descricao", title: "Brief Description", description: "Short summary text", type: "string", icon: "📋" },
  { key: "artigo", title: "Article", description: "Full article content", type: "text", icon: "📰" },
  { key: "image", title: "Image", description: "Image upload field", type: "image", icon: "🖼️" },
  { key: "nome", title: "Name", description: "Name field", type: "string", icon: "👤" },
  { key: "senha", title: "Password", description: "Password field", type: "password", icon: "🔒" },
  { key: "texto", title: "Text", description: "General text field", type: "string", icon: "✏️" },
  { key: "link", title: "Link", description: "URL or link field", type: "url", icon: "🔗" },
  { key: "preco", title: "Price", description: "Price or currency field", type: "number", icon: "💰" },
]

export default function CreatePage() {
  const [selectedTab, setSelectedTab] = useState("endpoint")
  const [loading, setLoading] = useState(false)
  const [endpointName, setEndpointName] = useState("")
  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>({
    titulo: false,
    data: false,
    descricao: false,
    breve_descricao: false,
    artigo: false,
    image: false,
    nome: false,
    senha: false,
    texto: false,
    link: false,
    preco: false,
  })
  const [errors, setErrors] = useState({ endpointName: false, fields: false })

  // User settings
  const [userSettings, setUserSettings] = useState({
    loginEnabled: false,
    registerEnabled: false,
    logoutEnabled: false,
  })

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

  const validateEndpointName = (name: string): boolean => {
    return /^[a-zA-Z0-9_]+$/.test(name)
  }

  const validateFields = () => {
    const isNameEmpty = endpointName.trim() === ""
    const isFieldsEmpty = Object.values(selectedFields).every((value) => !value)

    setErrors({
      endpointName: isNameEmpty,
      fields: isFieldsEmpty,
    })

    return !isNameEmpty && !isFieldsEmpty
  }

  const handleFieldToggle = (fieldKey: string) => {
    setSelectedFields((prev) => ({
      ...prev,
      [fieldKey]: !prev[fieldKey],
    }))
    validateFields()
  }

  const getSelectedFieldsList = () => {
    return Object.keys(selectedFields).filter((key) => selectedFields[key])
  }

  const handleCreateEndpoint = async () => {
    if (!validateFields()) return

    const toastId = toast.loading("Creating endpoint...", { duration: 4000 })
    setLoading(true)
    
    try {
      const result = await endpointService.addEndpoint({
        title: endpointName,
        router: endpointName,
        campos: getSelectedFieldsList()
      })

      if (result && result.success) {
        setTimeout(() => {
          setLoading(false)
          toast.dismiss(toastId)
          toast.success("Endpoint created successfully!", { duration: 4000 })
          router.push("/home")
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
          router.push("/home")
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 smi:px-6 lgi:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/home")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>

              <div>
                <h1 className="text-xl font-bold text-gray-900">Configuration</h1>
                <p className="text-sm text-gray-600">Set up endpoints and user management</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 smi:px-6 lgi:px-8 py-8">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">System Configuration</CardTitle>
            <CardDescription className="text-base">
              Configure endpoints and user management settings for your CMS
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="endpoint" className="flex items-center space-x-2">
                  <Database className="w-4 h-4" />
                  <span>Endpoints</span>
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>User Management</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="endpoint" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="endpoint-name" className="text-base font-medium">
                      Endpoint Name
                    </Label>
                    <Input
                      id="endpoint-name"
                      placeholder="e.g., blog_posts, products, users"
                      value={endpointName}
                      onChange={(e) => {
                        const value = e.target.value
                        if (validateEndpointName(value) || value === "") {
                          setEndpointName(value)
                          validateFields()
                        }
                      }}
                      className={errors.endpointName ? "border-red-500" : ""}
                    />
                    {errors.endpointName && <p className="text-sm text-red-600">Endpoint name is required</p>}
                    <p className="text-sm text-gray-600">
                      Use only letters, numbers, and underscores. This will be your API endpoint path.
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Select Fields</Label>
                        <p className="text-sm text-gray-600 mt-1">
                          Choose the fields you want to include in your endpoint
                        </p>
                      </div>
                      <Badge variant="secondary">{getSelectedFieldsList().length} selected</Badge>
                    </div>

                    {errors.fields && (
                      <Alert variant="destructive">
                        <AlertDescription>Please select at least one field for your endpoint</AlertDescription>
                      </Alert>
                    )}

                    <div className="grid gap-4 mdi:grid-cols-2">
                      {fieldOptions.map((field) => (
                        <Card
                          key={field.key}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedFields[field.key] ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
                          }`}
                          onClick={() => handleFieldToggle(field.key)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              <div className="text-2xl">{field.icon}</div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-medium text-gray-900">{field.title}</h3>
                                  <Switch
                                    checked={selectedFields[field.key] || false}
                                    onCheckedChange={() => handleFieldToggle(field.key)}
                                  />
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{field.description}</p>
                                <Badge variant="outline" className="mt-2 text-xs">
                                  {field.type}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <Button
                    onClick={handleCreateEndpoint}
                    className="w-full h-12 text-base font-medium"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Creating Endpoint...</span>
                      </div>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Endpoint
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="users" className="space-y-6 mt-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">User Management System</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Configure user authentication and registration settings
                      </p>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Info className="w-4 h-4 mr-2" />
                          Learn More
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh]">
                        <DialogHeader>
                          <DialogTitle>User Management API Documentation</DialogTitle>
                          <DialogDescription>Learn how to use the user authentication endpoints</DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="h-[60vh] pr-4">
                          <UserManagementDocs />
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="space-y-4">
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">User Login</h4>
                          <p className="text-sm text-gray-600">
                            Enable user authentication via /api/user/login endpoint
                          </p>
                        </div>
                        <Switch
                          checked={userSettings.loginEnabled}
                          onCheckedChange={(checked) => setUserSettings((prev) => ({ ...prev, loginEnabled: checked }))}
                        />
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">User Registration</h4>
                          <p className="text-sm text-gray-600">
                            Allow new users to register via /api/user/register endpoint
                          </p>
                        </div>
                        <Switch
                          checked={userSettings.registerEnabled}
                          onCheckedChange={(checked) =>
                            setUserSettings((prev) => ({ ...prev, registerEnabled: checked }))
                          }
                        />
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">User Logout</h4>
                          <p className="text-sm text-gray-600">
                            Enable token invalidation via /api/user/logout endpoint
                          </p>
                        </div>
                        <Switch
                          checked={userSettings.logoutEnabled}
                          onCheckedChange={(checked) =>
                            setUserSettings((prev) => ({ ...prev, logoutEnabled: checked }))
                          }
                        />
                      </div>
                    </Card>
                  </div>

                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      User management features require proper Firebase configuration. Make sure your environment
                      variables are set correctly.
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
                        <span>Saving Settings...</span>
                      </div>
                    ) : (
                      <>
                        <Settings className="w-4 h-4 mr-2" />
                        Save Configuration
                      </>
                    )}
                  </Button>
                </div>
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