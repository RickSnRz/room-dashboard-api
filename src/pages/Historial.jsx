import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../utils/authUtils";
import axios from "axios";
import { Download, Pencil } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const Historial = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) navigate("/");
  }, []);

  const [data, setData] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("Inquilino");
  const [isLoading, setIsLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});

  const getToken = () => localStorage.getItem("token");

  const endpoints = {
    Inquilino: "http://localhost:8080/api/inquilinos",
    Habitacion: "http://localhost:8080/api/habitaciones",
    Recibo: "http://localhost:8080/api/recibos",
    Alquiler: "http://localhost:8080/api/alquileres",
  };

  // 🔥 FETCH
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [res, habRes] = await Promise.all([
        axios.get(endpoints[filter], {
          headers: { Authorization: `Bearer ${getToken()}` },
        }),
        axios.get("http://localhost:8080/api/habitaciones", {
          headers: { Authorization: `Bearer ${getToken()}` },
        }),
      ]);

      setData(res.data);
      setHabitaciones(habRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredData = data.filter((item) =>
    Object.values(item)
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // 🔥 GET HAB NUMERO
  const getNumeroHabitacion = (id) => {
    const hab = habitaciones.find((h) => h.id === id);
    return hab ? hab.numero : "-";
  };

  // 🔥 EDIT
  const handleEditClick = (item) => {
    setSelectedItem(item);
    setFormData(item);
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      await axios.put(`${endpoints[filter]}/${selectedItem.id}`, formData, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      setOpen(false);
      fetchData();
      toast.success("Registro actualizado", {
        description: "El registro fue actualizado correctamente",
      });
    } catch (err) {
      console.error(err);
      toast.error("Error al actualizar", {
        description: "No se pudo actualizar el registro",
      });
    }
  };

  // 🔥 DNI
  const handleDownloadDNI = async (dni) => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/inquilinos/${dni}/download`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `DNI_${dni}.pdf`);
      link.click();
      toast.success("DNI descargado", {
        description: "El DNI del inquilino fue descargado correctamente",
      });
    } catch (err) {
      toast.error("Error al descargar DNI", {
        description: "No se pudo descargar el DNI del inquilino",
      });
    }
  };

  // 🔥 BADGE
  const getBadgeColor = (value) => {
    if (!value) return "bg-zinc-500";

    const val = value.toLowerCase();

    if (val === "puntual" || val === "disponible") return "bg-green-500";
    if (val === "tardio" || val === "ocupado") return "bg-red-500";

    return "bg-zinc-500";
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return isNaN(d)
      ? date
      : `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
  };

  // 🔥 EXCEL
  const exportToExcel = () => {
    const cleanData = filteredData.map((item) => {
      const newItem = {};
      Object.entries(item).forEach(([key, value]) => {
        if (key === "id") return;

        if (key === "habitacion_id") {
          newItem["habitacion"] = getNumeroHabitacion(value);
        } else if (typeof value === "object" && value !== null) {
          newItem[key] = value.nombre || value.numero || "-";
        } else {
          newItem[key] = value;
        }
      });

      return newItem;
    });

    const ws = XLSX.utils.json_to_sheet(cleanData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Historial");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer]), `Historial_${filter}.xlsx`);
    toast.success("Excel exportado", {
      description: `El historial de ${filter} fue exportado correctamente`,
    });
  };

  return (
    <div className="p-6 text-white space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Historial</h1>
        <p className="text-zinc-400">Visualiza y gestiona toda la información</p>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Registros</CardTitle>

          <div className="flex gap-3">
            <Input
              placeholder="Buscar..."
              className="bg-zinc-800 border-zinc-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[150px] bg-zinc-800 border-zinc-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 text-white">
                <SelectItem value="Inquilino">Inquilino</SelectItem>
                <SelectItem value="Habitacion">Habitación</SelectItem>
                <SelectItem value="Recibo">Recibo</SelectItem>
                <SelectItem value="Alquiler">Alquiler</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={exportToExcel}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download size={16} />
              Excel
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading && <Skeleton className="h-20 bg-zinc-800" />}

          {!isLoading && filteredData.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-800">
                  {Object.keys(filteredData[0])
                    .filter((k) => k !== "id")
                    .map((key) => (
                      <TableHead key={key} className="capitalize text-center">
                        {key}
                      </TableHead>
                    ))}

                  {(filter === "Inquilino" ||
                    filter === "Habitacion") && (
                    <TableHead className="text-center">
                      Acciones
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>

              <TableBody className="text-center">
                {filteredData.map((item, i) => (
                  <TableRow key={i}>
                    {Object.entries(item)
                      .filter(([k]) => k !== "id")
                      .map(([key, val], idx) => (
                        <TableCell key={idx}>
                          {key.includes("estado") ? (
                            <Badge className={getBadgeColor(val)}>
                              {val}
                            </Badge>
                          ) : key.includes("fecha") ? (
                            formatDate(val)
                          ) : key === "habitacion_id" ? (
                            `Hab. ${getNumeroHabitacion(val)}`
                          ) : typeof val === "object" && val !== null ? (
                            val.nombre ||
                            val.numero ||
                            val.id ||
                            "-"
                          ) : (
                            val
                          )}
                        </TableCell>
                      ))}

                    {(filter === "Inquilino" ||
                      filter === "Habitacion") && (
                      <TableCell className="flex justify-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition hover:scale-105"
                          onClick={() => handleEditClick(item)}
                        >
                          <Pencil size={16} />
                        </Button>

                        {filter === "Inquilino" && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="bg-zinc-800 hover:bg-blue-600/20 border border-zinc-700"
                            onClick={() =>
                              handleDownloadDNI(item.dni)
                            }
                          >
                            <Download size={16} />
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-zinc-900 border border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Editar Registro</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Modifica los datos
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {Object.entries(formData).map(([key, value]) => {
              if (key === "id" || key === "fechaRegistro") return null;

              return (
                <div key={key} className="grid gap-2">
                  <Label className="capitalize">{key}</Label>
                  <Input
                    value={value || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [key]: e.target.value,
                      })
                    }
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              className="bg-white text-black"
              onClick={handleSave}
            >
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Historial;
