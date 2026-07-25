"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Shield, Zap, Database } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Alert, AlertDescription } from "@/app/components/ui/alert"
import toast from "react-hot-toast"
import { adminApi, ApiError } from "@/app/services/adminApi"
import { checkAuth } from "@/app/utils/checkAuth"
import { useCurrentUser } from "@/app/hooks/useCurrentUser"
import { AltchaCaptcha } from "@/app/components/altcha-captcha"

export default function LoginPage() {
  const [isFirstAccess, setIsFirstAccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [altchaPayload, setAltchaPayload] = useState("")
  const [altchaResetKey, setAltchaResetKey] = useState(0)
  const r = useRouter()
  const { refresh } = useCurrentUser()

  const [credentials, setCredentials] = useState({
    name: "",
    password: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState({
    name: false,
    password: false,
    confirmPassword: false,
    captcha: false,
    unauthorized: false,
    unauthorized_firebase: false,
  })

  useEffect(() => {
    checkAuth().then((isAuthenticated) => {
      if (isAuthenticated) r.push("/home")
    })
  }, [r])

  // O servidor decide se e o primeiro acesso; antes o browser lia `users/default`
  // direto do Firestore para descobrir isso.
  useEffect(() => {
    adminApi.auth
      .setupState()
      .then((state) => setIsFirstAccess(state.needsSetup))
      .catch(() => setIsFirstAccess(false))
  }, [])

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
      captcha: !altchaPayload,
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
    if (!validateFields()) return

    setLoading(true)
    try {
      if (isFirstAccess) {
        await adminApi.auth.createFirstAdmin({
          name: credentials.name,
          email: credentials.name,
          password: credentials.password,
          altcha: altchaPayload,
        })
        toast.success("Conta criada com sucesso", { duration: 4000 })
      } else {
        const result = await adminApi.auth.login({
          email: credentials.name,
          password: credentials.password,
          altcha: altchaPayload,
        })

        // O acesso legado (senha única compartilhada) acabou de ser convertido numa
        // conta real — vale avisar, porque o e-mail passa a ser o identificador.
        if (result.migratedTo) {
          toast.success(`Seu login agora é ${result.migratedTo} — a senha continua a mesma.`, {
            duration: 8000,
          })
        } else {
          toast.success("Login realizado com sucesso!")
        }
      }

      // O cookie de sessão é definido pelo servidor; só precisamos recarregar a identidade.
      await refresh()
      r.push("/home")
    } catch (error) {
      setAltchaPayload("")
      setAltchaResetKey((key) => key + 1)
      const status = error instanceof ApiError ? error.status : 0

      if (status === 401 || status === 403) {
        toast.error(error instanceof Error ? error.message : "Usuário ou senha incorretos")
        setErrors((prev) => ({ ...prev, unauthorized: true }))
      } else {
        toast.error(error instanceof Error ? error.message : "Erro ao autenticar")
      }
    } finally {
      setLoading(false)
    }
  }


  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-3 smi:p-4">
      <div className="grid w-full max-w-6xl items-center gap-6 lgi:grid-cols-2 lgi:gap-8">
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
        <div className="mx-auto w-full max-w-md lgi:mx-0">
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-4 p-4 pb-5 smi:p-6 smi:pb-8">
              <div className="text-center">
                <CardTitle className="text-xl font-bold text-gray-900 smi:text-2xl">
                  {isFirstAccess ? "Create Account" : "Welcome Back"}
                </CardTitle>
                <CardDescription className="mt-2 text-sm text-gray-600 smi:text-base">
                  {isFirstAccess ? "Set up your DirrochaCMS instance" : "Sign in to your account to continue"}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-5 p-4 pt-0 smi:space-y-6 smi:p-6 smi:pt-0">
              {isFirstAccess && (
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Nenhuma conta existe ainda. A primeira conta criada terá permissão para
                    gerenciar as demais.
                  </AlertDescription>
                </Alert>
              )}

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

                  <div className="space-y-2">
                    <Label>Verificação</Label>
                    <AltchaCaptcha value={altchaPayload} resetKey={altchaResetKey} onChange={(value) => {
                      setAltchaPayload(value)
                      setErrors((prev) => ({ ...prev, captcha: false }))
                    }} />
                    {errors.captcha && (
                      <p className="text-sm text-red-600">Confirme a verificação anti-bot para continuar.</p>
                    )}
                  </div>

                  <Button onClick={handleSubmit} className="h-12 w-full text-base font-medium" disabled={loading}>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
