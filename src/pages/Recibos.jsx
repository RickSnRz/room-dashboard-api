import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";

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
import { Input } from "@/components/ui/input";

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

export default function Recibos() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) navigate("/");
  }, [navigate]);

  const token = localStorage.getItem("token");

  // DATA
  const [inquilinos, setInquilinos] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);

  // FORM
  const [inquilinoId, setInquilinoId] = useState("");
  const [habitacionId, setHabitacionId] = useState("");
  const [concepto, setConcepto] = useState("");
  const [fecha, setFecha] = useState(null);
  const [monto, setMonto] = useState("");
  const [estado, setEstado] = useState("");

  const [loading, setLoading] = useState(false);

  // 🔥 CARGAR DATA
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
        ]);

        setInquilinos(resInquilinos.data);

        const ocupadas = resHabitaciones.data.filter(
          (h) => h.estado === "Ocupado",
        );
        setHabitaciones(ocupadas);
      } catch (error) {
        toast.error("Error al cargar datos", {
          description: "Hubo un problema al cargar inquilinos u habitaciones.",
        });
      }
    };

    fetchData();
  }, []);

  // 🔥 AUTOCOMPLETAR MONTO
  const handleHabitacionChange = (value) => {
    setHabitacionId(value);

    const habitacion = habitaciones.find((h) => h.id.toString() === value);

    if (habitacion) {
      setMonto(habitacion.precio);
    }
  };

  // 🔥 DESCARGAR PDF
  const generarYSubir = async (id) => {
    const res = await axios.post(
      `http://localhost:8080/api/recibos/${id}/generar`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    
  };

  // 🔥 SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!inquilinoId || !habitacionId || !concepto || !fecha || !estado) {
      toast.error("Error", {
        description: "Completa todos los campos",
      });
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `http://localhost:8080/api/recibos?inquilinoId=${inquilinoId}&habitacionId=${habitacionId}`,
        {
          monto,
          concepto,
          fechaEmision: format(fecha, "yyyy-MM-dd"),
          estado,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // 🔥 DESCARGA AUTOMÁTICA
      await generarYSubir(res.data.id);

      toast.success("Recibo generado", {
        description: "El recibo fue generado y subido correctamente",
      });

      // RESET
      setInquilinoId("");
      setHabitacionId("");
      setConcepto("");
      setFecha(null);
      setMonto("");
      setEstado("");
    } catch (error) {
      toast.error("Error al generar recibo", {
        description: error.response?.data || "No se pudo generar el recibo",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 text-white">
      <h2 className="text-3xl font-bold mb-2">Recibos</h2>
      <p className="text-zinc-400 mb-6">
        Generación de recibos con descarga automática en PDF.
      </p>

      <Card className="max-w-xl bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle>Generar recibo</CardTitle>
          <CardDescription>
            Selecciona un inquilino y una habitación ocupada.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* INQUILINO */}
            <div className="space-y-2">
              <Label>Inquilino</Label>
              <Select value={inquilinoId} onValueChange={setInquilinoId}>
                <SelectTrigger className="bg-zinc-950 border-zinc-800">
                  <SelectValue placeholder="Selecciona inquilino" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800">
                  {inquilinos.map((i) => (
                    <SelectItem
                      key={i.id}
                      value={i.id.toString()}
                      className="text-white hover:bg-zinc-600">
                      {i.nombre} {i.apellido}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* HABITACIÓN */}
            <div className="space-y-2">
              <Label>Habitación (ocupada)</Label>
              <Select
                value={habitacionId}
                onValueChange={handleHabitacionChange}>
                <SelectTrigger className="bg-zinc-950 border-zinc-800">
                  <SelectValue placeholder="Selecciona habitación" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800">
                  {habitaciones.map((h) => (
                    <SelectItem
                      key={h.id}
                      value={h.id.toString()}
                      className="text-white hover:bg-zinc-600">
                      Habitación {h.numero} - Piso {h.piso}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* MONTO */}
            <div className="space-y-2">
              <Label>Monto</Label>
              <Input
                value={monto}
                readOnly
                className="bg-zinc-950 border-zinc-800"
              />
            </div>

            {/* CONCEPTO */}
            <div className="space-y-2">
              <Label>Concepto</Label>
              <Input
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                className="bg-zinc-950 border-zinc-800"
              />
            </div>

            {/* ESTADO */}
            <div className="space-y-2">
              <Label>Estado de pago</Label>
              <Select value={estado} onValueChange={setEstado}>
                <SelectTrigger className="bg-zinc-950 border-zinc-800">
                  <SelectValue placeholder="Selecciona estado" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800">
                  <SelectItem
                    value="PUNTUAL"
                    className="text-white hover:bg-zinc-600">
                    Pago puntual
                  </SelectItem>
                  <SelectItem
                    value="TARDIO"
                    className="text-white hover:bg-zinc-600">
                    Pago con demora
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* FECHA */}
            <div className="space-y-2">
              <Label>Fecha</Label>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-[260px] justify-start text-left font-normal bg-zinc-950 border-zinc-800">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fecha ? format(fecha, "dd/MM/yyyy") : "Selecciona fecha"}
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0 text-white bg-zinc-950 border-zinc-800">
                  <Calendar
                    mode="single"
                    selected={fecha}
                    onSelect={setFecha}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* BOTÓN */}
            <Button
              disabled={loading}
              className="w-full bg-white text-black hover:bg-zinc-200 font-semibold">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin w-4 h-4" />
                  Generando recibo...
                </span>
              ) : (
                "Generar recibo"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
