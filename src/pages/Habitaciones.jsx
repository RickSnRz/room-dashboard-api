import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../utils/authUtils";
import { CheckCircle, DoorOpen, Home } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Habitaciones = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) navigate("/");
  }, [navigate]);

  const [numero, setNumero] = useState("");
  const [piso, setPiso] = useState("");
  const [precio, setPrecio] = useState("");
  const [estado, setEstado] = useState("Disponible");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!numero || !piso || !precio || !estado) {
      setError("Por favor, complete todos los campos.");
      return;
    }

    setError("");

    const nuevaHabitacion = {
      numero,
      piso,
      precio: parseFloat(precio),
      estado,
    };

    try {
      await axios.post(
        "http://localhost:8080/api/habitaciones",
        nuevaHabitacion,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Habitacion registrado", {
  description: "La habitacion fue guardada correctamente",
      });

      fetchHabitaciones();

      setNumero("");
      setPiso("");
      setPrecio("");
      setEstado("Disponible");
    } catch (error) {
      toast.error("Error al registrar", {
  description: "Verifica los datos o intenta nuevamente",
      });
    }
  };

  const handlePisoChange = (e) => {
    const value = e.target.value;
    if (/^[A-Za-z\s]*$/.test(value)) setPiso(value);
  };

  const handleNumeroChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) setNumero(value);
  };

  const handleChangeEstado = (value) => {
    setEstado(value);
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const [habitacionesDisponibles, setHabitacionesDisponibles] = useState(0);
  const [habitacionesOcupadas, setHabitacionesOcupadas] = useState(0);
  const [habitacionesTotales, setHabitacionesTotales] = useState(0);

  const fetchHabitaciones = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/habitaciones",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = response.data;

      setHabitacionesDisponibles(
        data.filter((h) => h.estado === "Disponible").length
      );
      setHabitacionesOcupadas(
        data.filter((h) => h.estado === "Ocupado").length
      );
      setHabitacionesTotales(data.length);
    } catch (error) {
      toast.error("Error al cargar habitaciones", {
        description: "Hubo un problema al cargar las habitaciones.",
      });
    }
  };

  useEffect(() => {
    fetchHabitaciones();
  }, []);

  return (
    <div className="p-8 text-white">
      <h2 className="text-3xl font-bold mb-2">Habitaciones</h2>
      <p className="text-zinc-400 mb-6">
        Zona administrativa de las habitaciones.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 🔥 FORM ORIGINAL (NO TOCADO) */}
        <Card className="bg-zinc-900 border border-zinc-700">
          <CardHeader>
            <CardTitle className="text-white">
              Agregar nuevas habitaciones
            </CardTitle>
            <CardDescription>Ingrese los datos requeridos.</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="space-y-2">
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  value={numero}
                  onChange={handleNumeroChange}
                  className="bg-zinc-950 text-white border-zinc-600 w-full md:w-[40%]"
                  placeholder="Número de habitación"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="piso">Piso</Label>
                <Input
                  id="piso"
                  value={piso}
                  className="bg-zinc-950 text-white border-zinc-600 w-full md:w-[40%]"
                  onChange={handlePisoChange}
                  placeholder="Piso"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="precio">Precio</Label>
                <Input
                  id="precio"
                  type="number"
                  value={precio}
                  className="bg-zinc-950 text-white border-zinc-600 w-full md:w-[40%]"
                  onChange={(e) => setPrecio(e.target.value)}
                  placeholder="Precio de la habitación"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select onValueChange={handleChangeEstado} value={estado}>
                  <SelectTrigger
                    id="estado"
                    className="bg-zinc-950 text-white border-zinc-600"
                  >
                    <SelectValue placeholder="Selecciona estado" />
                  </SelectTrigger>

                  <SelectContent className="bg-zinc-950 text-white border-zinc-600">
                    <SelectItem value="Disponible">Disponible</SelectItem>
                    <SelectItem value="Ocupado">Ocupado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && <p className="text-red-500">{error}</p>}

              <Button
                type="submit"
                className="bg-white text-black hover:bg-zinc-200 transition-all w-full font-semibold"
              >
                Registrar Habitacion
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 🔥 CARDS PRO (MEJORADAS) */}
        <div className="space-y-4">

          {/* DISPONIBLES */}
          <Card className="bg-zinc-900 border border-zinc-800 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-zinc-400">
                Habitaciones Disponibles
              </CardTitle>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">
                {habitacionesDisponibles}
              </p>
            </CardContent>
          </Card>

          {/* OCUPADAS */}
          <Card className="bg-zinc-900 border border-zinc-800 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-zinc-400">
                Habitaciones Ocupadas
              </CardTitle>
              <DoorOpen className="w-5 h-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">
                {habitacionesOcupadas}
              </p>
            </CardContent>
          </Card>

          {/* TOTALES */}
          <Card className="bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-zinc-400">
                Habitaciones Totales
              </CardTitle>
              <Home className="w-5 h-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">
                {habitacionesTotales}
              </p>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default Habitaciones;