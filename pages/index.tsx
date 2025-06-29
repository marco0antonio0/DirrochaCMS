"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Shield, Zap, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import toast from "react-hot-toast"
import { getData } from "@/services/storage";
import axios from "axios";
import Cookies from "js-cookie";

export default function LoginPage() {
  const [isFirstAccess, setIsFirstAccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()
  async function checkAuth() {
    const token = Cookies.get("token");
    if (!token) {
      return false;
    }
  
    try {
      const response = await axios.get("/api/verifyToken", {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      });
  
      return response;
    } catch (error) {
      return false;
    }
  }
  const [credentials, setCredentials] = useState({
    name: "",
    password: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState({
    name: false,
    password: false,
    confirmPassword: false,
    unauthorized: false,
    unauthorized_firebase: false,
  })

  const envText = `NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_ENV=development
SECRET_KEY=your_secret_key`
const r = useRouter()
useEffect(()=>{
  checkAuth().then((isAuthenticated) => {
    if (isAuthenticated) {
      r.push("/home")
    }
  });
}, [])
useEffect(() => {
  getData().then((data) => {
    setIsFirstAccess(!(data != null) ? true : false);
  });
}, []);

  const handleCredentialChange = (field: string, value: string) => {
    setCredentials((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({
      ...prev,
      [field]: value.trim() === "",
      unauthorized: false,
      unauthorized_firebase: false,
    }))
  }

  const validateFields = () => {
    const newErrors = {
      name: credentials.name.trim() === "",
      password: credentials.password.trim() === "",
      confirmPassword: isFirstAccess ? credentials.confirmPassword.trim() === "" : false,
      unauthorized: false,
      unauthorized_firebase: false,
    }

    if (isFirstAccess && credentials.password !== credentials.confirmPassword) {
      newErrors.confirmPassword = true
    }

    if (isFirstAccess && credentials.password.length < 6) {
      newErrors.password = true
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some((error) => error)
  }

  const handleSubmit = async () => {
    if (!validateFields()) return;
  
    setLoading(true);
    try {
      if (isFirstAccess) {
        const responseRegister = await axios.post("/api/register", {
          name: credentials.name,
          password: credentials.password,
        });
        if (responseRegister.status === 200){
          Cookies.set("token", responseRegister.data.token, { expires: 1 });
          localStorage.setItem("cms_configured", "true");
  
          toast.success("Conta criada com sucesso", { duration: 4000 });
          toast.success("Seja bem-vindo(a)", { duration: 4000 });
  
          setTimeout(() => {
            window.location.href = "/home";
          }, 0);
        } else {
          toast.error("Erro ao criar conta");
        }
  
      } else {
        const response = await axios.post("/api/login", {
          name: credentials.name,
          password: credentials.password,
        });
  
        if (response.status === 200 && response.data.token) {
          Cookies.set("token", response.data.token, { expires: 1 });
          toast.success("Login realizado com sucesso!");
          window.location.href = "/home";
        } else {
          toast.error("Falha na autenticação");
        }
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error("Usuário ou senha incorretos");
        setErrors((prev) => ({ ...prev, unauthorized: true }));
      } else {
        toast.error("Erro ao autenticar");
      }
    } finally {
      setLoading(false);
    }
  };
  

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit()
    }
  }

  const copyEnvConfig = () => {
    if (textAreaRef.current) {
      textAreaRef.current.select()
      navigator.clipboard.writeText(envText).then(() => {
        setCopied(true)
        toast.success("Environment configuration copied!")
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lgi:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lgi:flex flex-col justify-center space-y-8 px-8">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">DirrochaCMS</h1>
            </div>

            <p className="text-xl text-gray-600 leading-relaxed">
              Your lightweight solution for content management. Create, manage, and deploy APIs with ease.
            </p>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-gray-700">Lightning fast API creation</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-gray-700">Secure authentication system</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Database className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-gray-700">Flexible data management</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full max-w-md mx-auto lgi:mx-0">
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-4 pb-8">
              <div className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {isFirstAccess ? "Create Account" : "Welcome Back"}
                </CardTitle>
                <CardDescription className="text-gray-600 mt-2">
                  {isFirstAccess ? "Set up your DirrochaCMS instance" : "Sign in to your account to continue"}
                </CardDescription>
              </div>
              {!process.env.NEXT_PUBLIC_ENV && (
                <div className="flex justify-center mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFirstAccess(!isFirstAccess)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {isFirstAccess ? "Already have an account? Sign in" : "First time? Create account"}
                  </Button>
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-6">
              {!process.env.NEXT_PUBLIC_ENV && isFirstAccess ? (
                <div className="space-y-4">
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>Configure your Firebase credentials to get started</AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <Label htmlFor="env-config">Environment Configuration</Label>
                    <Textarea
                      ref={textAreaRef}
                      value={envText}
                      readOnly
                      className="font-mono text-sm h-32"
                      id="env-config"
                    />
                    <Button onClick={copyEnvConfig} className="w-full" disabled={loading}>
                      {copied ? "Copied!" : "Copy Configuration"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@example.com"
                      value={credentials.name}
                      onChange={(e) => handleCredentialChange("name", e.target.value)}
                      onKeyDown={handleKeyDown}
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && <p className="text-sm text-red-600">Email is required</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={credentials.password}
                        onChange={(e) => handleCredentialChange("password", e.target.value)}
                        onKeyDown={handleKeyDown}
                        className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-600">
                        {isFirstAccess ? "Password must be at least 6 characters" : "Password is required"}
                      </p>
                    )}
                  </div>

                  {isFirstAccess && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={credentials.confirmPassword}
                          onChange={(e) => handleCredentialChange("confirmPassword", e.target.value)}
                          onKeyDown={handleKeyDown}
                          className={errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
                        />
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-sm text-red-600">
                          {credentials.confirmPassword.trim() === ""
                            ? "Please confirm your password"
                            : "Passwords must match"}
                        </p>
                      )}
                    </div>
                  )}

                  {(errors.unauthorized || errors.unauthorized_firebase) && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {errors.unauthorized_firebase
                          ? "Firebase access denied. Check your credentials and ensure Firestore is enabled."
                          : "Invalid email or password. Please try again."}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button onClick={handleSubmit} className="w-full h-12 text-base font-medium" disabled={loading}>
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{isFirstAccess ? "Creating Account..." : "Signing In..."}</span>
                      </div>
                    ) : isFirstAccess ? (
                      "Create Account"
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
