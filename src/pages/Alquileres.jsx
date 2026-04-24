import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "sonner";

import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import { isAuthenticated } from "../utils/authUtils"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export default function Alquileres() {
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated()) navigate("/")
  }, [navigate])

  const token = localStorage.getItem("token")

  const [inquilinos, setInquilinos] = useState([])
  const [habitaciones, setHabitaciones] = useState([])

  const [dni, setDni] = useState("")
  const [numeroHabitacion, setNumeroHabitacion] = useState("")
  const [fechaEntrada, setFechaEntrada] = useState(null) // ahora Date

  // Cargar inquilinos y habitaciones
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resInquilinos, resHabitaciones] = await Promise.all([
          axios.get("http://localhost:8080/api/inquilinos", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:8080/api/habitaciones", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        setInquilinos(resInquilinos.data)
        setHabitaciones(
          resHabitaciones.data.filter((h) => h.estado === "Disponible")
        )
      } catch (error) {
        toast.error("Error al cargar datos", {
          description: "Hubo un problema al cargar inquilinos u habitaciones.",
        });
      }
    }

    fetchData()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!dni || !numeroHabitacion || !fechaEntrada) {
      toast.error("Error", {
        description: "Completa todos los campos",
      });
      return
    }

    try {
      await axios.post(
        "http://localhost:8080/api/alquileres/crear",
        {
          dni,
          numeroHabitacion,
          fechaEntrada: format(fechaEntrada, "yyyy-MM-dd"),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      toast.success("Alquiler registrado", {
        description: "El alquiler fue registrado correctamente",
      })

      setDni("")
      setNumeroHabitacion("")
      setFechaEntrada(null)
    } catch (error) {
      toast.error("Error al registrar alquiler", {
        description: error.response?.data || "No se pudo registrar el alquiler",
      });
    }
  }

  return (
    <div className="p-8 text-white">
      <h2 className="text-3xl font-bold mb-2">Alquileres</h2>
      <p className="text-zinc-400 mb-6">
        Registro de alquiler de habitaciones.
      </p>

      <Card className="max-w-xl bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle>Registrar alquiler</CardTitle>
          <CardDescription>
            Selecciona un inquilino y una habitación disponible.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Inquilino */}
            <div className="space-y-2">
              <Label>Inquilino</Label>
              <Select value={dni} onValueChange={setDni}>
                <SelectTrigger className="bg-zinc-950 border-zinc-800">
                  <SelectValue placeholder="Selecciona un inquilino" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800">
                  {inquilinos.map((i) => (
                    <SelectItem
                      className="text-white hover:bg-zinc-600"
                      key={i.id}
                      value={i.dni}>
                      {i.dni} - {i.nombre} {i.apellido}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Habitación */}
            <div className="space-y-2">
              <Label>Habitación disponible</Label>
              <Select
                value={numeroHabitacion}
                onValueChange={setNumeroHabitacion}>
                <SelectTrigger className="bg-zinc-950 text-white border-zinc-800">
                  <SelectValue placeholder="Selecciona habitación" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800">
                  {habitaciones.map((h) => (
                    <SelectItem
                      className="text-white hover:bg-zinc-600"
                      key={h.id}
                      value={h.numero}>
                      Habitación {h.numero} - Piso {h.piso}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fecha con calendario PRO */}
            <div className="space-y-2">
              <Label>Fecha de entrada</Label>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-[260px] justify-start text-left font-normal bg-zinc-950 border-zinc-800">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fechaEntrada
                      ? format(fechaEntrada, "dd/MM/yyyy")
                      : "Selecciona una fecha"}
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0 text-white bg-zinc-950 border-zinc-800">
                  <Calendar
                    mode="single"
                    selected={fechaEntrada}
                    onSelect={setFechaEntrada}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    locale={es}
                    classNames={{
                      day: "hover:bg-zinc-700 hover:text-white transition-colors rounded-md",
                      day_selected: "bg-white text-black hover:bg-white",
                      day_today: "border border-zinc-500",
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button className="w-full bg-white text-black hover:bg-zinc-200 font-semibold">
              Registrar alquiler
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

