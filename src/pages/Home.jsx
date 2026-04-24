import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../utils/authUtils";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Users, BedDouble, Home, Receipt } from "lucide-react";

import { AreaChart, Area, XAxis, CartesianGrid } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export default function HomeDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [inquilinos, setInquilinos] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [recibos, setRecibos] = useState([]);

  // 🔐 auth
  useEffect(() => {
    if (!isAuthenticated()) navigate("/");
  }, []);

  // 🔥 fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [inq, hab, rec] = await Promise.all([
          axios.get("http://localhost:8080/api/inquilinos", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:8080/api/habitaciones", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:8080/api/recibos", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setInquilinos(inq.data || []);
        setHabitaciones(hab.data || []);
        setRecibos(rec.data || []);
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };

    fetchData();
  }, []);

  // 📊 INGRESOS POR MES
  const ingresosPorMes = () => {
    const mesesOrden = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];

    const meses = {};

    const currentYear = new Date().getFullYear();

    recibos.forEach((r) => {
      if (!r.fechaEmision) return;

      const fecha = new Date(r.fechaEmision);

      // 🔥 FILTRAR SOLO AÑO ACTUAL
      if (fecha.getFullYear() !== currentYear) return;

      const mesIndex = fecha.getMonth(); // 0-11
      const mesNombre = mesesOrden[mesIndex];

      if (!meses[mesNombre]) meses[mesNombre] = 0;

      meses[mesNombre] += Number(r.monto || 0);
    });

    // 🔥 ORDENAR CORRECTAMENTE
    return mesesOrden
      .filter((mes) => meses[mes]) // opcional: solo meses con data
      .map((mes) => ({
        mes,
        ingresos: meses[mes],
      }));
  };

  const dataChart = ingresosPorMes();

  // 🔧 config chart
  const chartConfig = {
    ingresos: {
      label: "Ingresos",
      color: "#22c55e",
    },
  };

  return (
    <div className="p-8 text-white space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-zinc-400">Análisis en tiempo real del negocio</p>
      </div>

      {/* CARDS KPI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-zinc-900 border-zinc-800 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 hover:-translate-y-1">
          <CardHeader className="flex justify-between flex-row items-center">
            <CardTitle className="text-zinc-400 text-sm">Inquilinos</CardTitle>
            <Users className="text-green-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{inquilinos.length}</p>
            <p className="text-xs text-zinc-500 mt-1">Total registrados</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1">
          <CardHeader className="flex justify-between flex-row items-center">
            <CardTitle className="text-zinc-400 text-sm">
              Habitaciones
            </CardTitle>
            <BedDouble className="text-blue-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{habitaciones.length}</p>
            <p className="text-xs text-zinc-500 mt-1">Total creadas</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10 hover:-translate-y-1">
          <CardHeader className="flex justify-between flex-row items-center">
            <CardTitle className="text-zinc-400 text-sm">Ocupados</CardTitle>
            <Home className="text-red-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {habitaciones.filter((h) => h.estado === "Ocupado").length}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Habitaciones ocupadas</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/10 hover:-translate-y-1">
          <CardHeader className="flex justify-between flex-row items-center">
            <CardTitle className="text-zinc-400 text-sm">Recibos</CardTitle>
            <Receipt className="text-yellow-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{recibos.length}</p>
            <p className="text-xs text-zinc-500 mt-1">Generados</p>
          </CardContent>
        </Card>
      </div>

      {/* 📈 CHART PRO */}
      <div className="grid grid-cols-1">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>Ingresos por mes</CardTitle>
            <CardDescription>Total generado por alquileres</CardDescription>
          </CardHeader>

          <CardContent className="h-[400px]">
            {dataChart.length === 0 ? (
              <p className="text-center text-zinc-400">
                No hay datos disponibles
              </p>
            ) : (
              <ChartContainer
                config={chartConfig || {}}
                className="h-full w-full">
                <AreaChart data={dataChart || []}>
                  <defs>
                    <linearGradient
                      id="fillIngresos"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#22c55e"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid vertical={false} stroke="#27272a" />

                  <XAxis
                    dataKey="mes"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    stroke="#a1a1aa"
                    interval={0}
                    padding={{ left: 3, right: 3 }}
                  />

                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />

                  <Area
                    dataKey="ingresos"
                    type="natural"
                    fill="url(#fillIngresos)"
                    stroke="#22c55e"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
