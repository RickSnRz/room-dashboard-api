import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { login } from "../service/authService"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

import { Loader2 } from "lucide-react"

const LoginForm = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Completa todos los campos")
      return
    }

    try {
      setLoading(true)

      const user = await login(email, password)

      if (user) {
        navigate("/mainpage/home")
      }
    } catch (err) {
      setError(err.message || "Credenciales incorrectas")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950 px-4">

      <Card className="w-full max-w-md bg-zinc-900 border border-zinc-800 shadow-xl">

        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold text-white">
            Inicia Sesion
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* EMAIL */}
            <div className="space-y-2">
              <Label className="text-zinc-300">Correo electrónico</Label>
              <Input
                type="email"
                placeholder="tucorreo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500 focus:ring-1 focus:ring-white"
              />
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <Label className="text-zinc-300">Contraseña</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500 focus:ring-1 focus:ring-white"
              />
            </div>

            {/* ERROR */}
            {error && (
              <p className="text-sm text-red-500 text-center">
                {error}
              </p>
            )}

            {/* BUTTON */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black hover:bg-zinc-200 font-semibold"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin w-4 h-4" />
                  Iniciando...
                </span>
              ) : (
                "Iniciar sesión"
              )}
            </Button>

          </form>
        </CardContent>

      </Card>
    </div>
  )
}

export default LoginForm;
