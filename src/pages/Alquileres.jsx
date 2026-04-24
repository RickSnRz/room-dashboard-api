import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, CheckCircle2, Activity, FileText } from "lucide-react";

import { isAuthenticated } from "../utils/authUtils";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function Alquileres() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) navigate("/");
  }, [navigate]);

  const token = localStorage.getItem("token");

  const [inquilinos, setInquilinos] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [allHabitaciones, setAllHabitaciones] = useState([]);
  const [alquileres, setAlquileres] = useState([]);


  const [dni, setDni] = useState("");
  const [numeroHabitacion, setNumeroHabitacion] = useState("");
  const [fechaEntrada, setFechaEntrada] = useState(null);

  // 🔥 FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resInquilinos, resHabitaciones, resAlquileres] = await Promise.all([
          axios.get("http://localhost:8080/api/inquilinos", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:8080/api/habitaciones", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:8080/api/alquileres", {
              headers: { Authorization: `Bearer ${token}` },
            }),
        ]);

        setInquilinos(resInquilinos.data);
        setAllHabitaciones(resHabitaciones.data);
        setAlquileres(resAlquileres.data);


        setHabitaciones(
          resHabitaciones.data.filter((h) => h.estado === "Disponible")
        );
      } catch {
        toast.error("Error al cargar datos");
      }
    };

    fetchData();
  }, []);

  // 🔥 STATS
  const activos = alquileres.filter((a) => !a.fechaSalida).length;
  const finalizados = alquileres.filter((a) => a.fechaSalida).length;
  const total = alquileres.length;
  const ocupadas = allHabitaciones.filter((h) => h.estado === "Ocupado").length;
  const disponibles = allHabitaciones.filter(
    (h) => h.estado === "Disponible"
  ).length;
  

  // 🔥 SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!dni || !numeroHabitacion || !fechaEntrada) {
      toast.error("Completa todos los campos");
      return;
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
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Alquiler registrado");

      setDni("");
      setNumeroHabitacion("");
      setFechaEntrada(null);
    } catch {
      toast.error("Error al registrar");
    }
  };

  return (
    <div className="p-8 text-white space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-3xl font-bold">Alquileres</h2>
        <p className="text-zinc-400">
          Registro y control de alquiler de habitaciones
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* IZQUIERDA */}
        <div className="space-y-6">

          {/* FORM */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle>Registrar alquiler</CardTitle>
              <CardDescription>
                Selecciona un inquilino y una habitación
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">

                <div className="space-y-2">
                  <Label>Inquilino</Label>
                  <Select value={dni} onValueChange={setDni}>
                    <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white">
                      <SelectValue placeholder="Selecciona inquilino" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 text-white border-zinc-800">
                      {inquilinos.map((i) => (
                        <SelectItem key={i.id} value={i.dni}>
                          {i.dni} - {i.nombre} {i.apellido}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Habitación</Label>
                  <Select
                    value={numeroHabitacion}
                    onValueChange={setNumeroHabitacion}
                  >
                    <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white">
                      <SelectValue placeholder="Selecciona habitación" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 text-white border-zinc-800">
                      {habitaciones.map((h) => (
                        <SelectItem key={h.id} value={h.numero}>
                          Hab {h.numero} - Piso {h.piso}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Fecha</Label>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        className="w-50 justify-start bg-zinc-950 border-zinc-800 text-white"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {fechaEntrada
                          ? format(fechaEntrada, "dd/MM/yyyy")
                          : "Selecciona fecha"}
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="bg-zinc-950 border-zinc-800 text-white">
                      <Calendar
                        mode="single"
                        selected={fechaEntrada}
                        onSelect={setFechaEntrada}
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <Button className="w-full bg-white text-black hover:bg-zinc-200">
                  Registrar alquiler
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* PREVIEW (NO TOCADO, CON ANIMACIÓN) */}
          <AnimatePresence>
            {(dni || numeroHabitacion || fechaEntrada) && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.98 }}
                transition={{ duration: 0.25 }}
              >
                <Card className="bg-zinc-900 border-zinc-800 shadow-lg">
                  <CardHeader>
                    <CardTitle>Resumen del alquiler</CardTitle>
                    <CardDescription>
                      Vista previa antes de registrar
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3 text-sm">
                    <p>
                      <span className="text-zinc-400">Inquilino:</span>{" "}
                      {inquilinos.find((i) => i.dni === dni)?.nombre +
                        " " +
                        inquilinos.find((i) => i.dni === dni)?.apellido || "-"}
                    </p>

                    <p>
                      <span className="text-zinc-400">DNI:</span> {dni || "-"}
                    </p>

                    <p>
                      <span className="text-zinc-400">Habitación:</span>{" "}
                      {numeroHabitacion || "-"}
                    </p>

                    <p>
                      <span className="text-zinc-400">Monto:</span>{" "}
                      {allHabitaciones.find(
                        (h) => h.numero === numeroHabitacion
                      )?.precio || "-"}
                    </p>

                    <p>
                      <span className="text-zinc-400">Fecha:</span>{" "}
                      {fechaEntrada ? format(fechaEntrada, "dd/MM/yyyy") : "-"}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* DERECHA (CARDS PRO) */}
        <div className="space-y-4">

          <Card className="bg-zinc-900 border border-zinc-800 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-zinc-400">
                Alquileres Activos
              </CardTitle>
              <Activity className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{activos}</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border border-zinc-800 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-zinc-400">
                Alquileres Finalizados
              </CardTitle>
              <CheckCircle2 className="w-5 h-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{finalizados}</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-zinc-400">
                Total Alquilere
              </CardTitle>
              <FileText className="w-5 h-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{total}</p>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}