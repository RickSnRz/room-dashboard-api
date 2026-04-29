import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../utils/authUtils";
import axios from "axios";
import { Download, Pencil, MessageCircle } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const Historial = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) navigate("/");
  }, [navigate]);

  const [data, setData] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("Inquilino");
  const [isLoading, setIsLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const getToken = () => localStorage.getItem("token");

  const endpoints = {
    Inquilino: "http://localhost:8080/api/inquilinos",
    Habitacion: "http://localhost:8080/api/habitaciones",
    Recibo: "http://localhost:8080/api/recibos",
    Alquiler: "http://localhost:8080/api/alquileres",
  };

  // FETCH
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

      setData(res.data || []);
      setHabitaciones(habRes.data || []);
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
      .includes(searchTerm.toLowerCase()),
  );

  // Lógica de paginación sobre filteredData
  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  // Resetear a página 1 si cambia búsqueda o filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filter]);

  // GET HAB NUMERO
  const getNumeroHabitacion = (id) => {
    const hab = habitaciones.find((h) => h.id === id);
    return hab ? hab.numero : "-";
  };

  // EDIT
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

  // DNI
  const handleDownloadDNI = async (dni) => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/inquilinos/${dni}/download`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
          responseType: "blob",
        },
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
      console.error(err);
      toast.error("Error al descargar DNI", {
        description: "No se pudo descargar el DNI del inquilino",
      });
    }
  };

  // RECIBO
  const handleDownloadRecibo = async (reciboId) => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/recibos/${reciboId}/download`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `recibo-${reciboId}.pdf`);
      link.click();

      toast.success("Recibo descargado", {
        description: "El recibo fue descargado correctamente",
      });
    } catch (err) {
      console.error(err);
      toast.error("Error al descargar recibo");
    }
  };

  const handleSendWhatsApp = async (reciboId) => {
    try {
      await axios.post(
        `http://localhost:8080/api/whatsapp/enviar-recibo/${reciboId}`,
        {},
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );

      toast.success("Mensaje enviado", {
        description: "El recibo fue enviado por WhatsApp",
      });
    } catch (err) {
      console.error(err);
      toast.error("Error al enviar WhatsApp");
    }
  };

  // BADGE
  const getBadgeColor = (value) => {
    if (!value) return "bg-zinc-500";

    const val = String(value).toLowerCase();
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

  // EXCEL (sigue usando filteredData, o sea resultados buscados)
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
        <p className="text-zinc-400">
          Visualiza y gestiona toda la información
        </p>
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
            <>
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
                      filter === "Habitacion" ||
                      filter === "Recibo") && (
                      <TableHead className="text-center">Acciones</TableHead>
                    )}
                  </TableRow>
                </TableHeader>

                <TableBody className="text-center">
                  {paginatedData.map((item, i) => (
                    <TableRow key={i}>
                      {Object.entries(item)
                        .filter(([k]) => k !== "id")
                        .map(([key, val], idx) => (
                          <TableCell key={idx}>
                            {key.includes("estado") ? (
                              <Badge className={getBadgeColor(val)}>{val}</Badge>
                            ) : key.includes("fecha") ? (
                              formatDate(val)
                            ) : key === "habitacion_id" ? (
                              `Hab. ${getNumeroHabitacion(val)}`
                            ) : typeof val === "object" && val !== null ? (
                              val.nombre || val.numero || val.id || "-"
                            ) : (
                              val
                            )}
                          </TableCell>
                        ))}

                      {(filter === "Inquilino" ||
                        filter === "Habitacion" ||
                        filter === "Recibo") && (
                        <TableCell className="flex justify-center gap-2">
                          {(filter === "Inquilino" ||
                            filter === "Habitacion") && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition hover:scale-105"
                              onClick={() => handleEditClick(item)}
                            >
                              <Pencil size={16} />
                            </Button>
                          )}

                          {filter === "Inquilino" && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="bg-zinc-800 hover:bg-blue-600/20 border border-zinc-700"
                              onClick={() => handleDownloadDNI(item.dni)}
                            >
                              <Download size={16} />
                            </Button>
                          )}

                          {filter === "Recibo" && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="bg-zinc-800 hover:bg-blue-600/20 border border-zinc-700"
                              onClick={() => handleDownloadRecibo(item.id)}
                            >
                              <Download size={16} />
                            </Button>
                          )}

                          {filter === "Recibo" && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="bg-zinc-800 hover:bg-green-600/20 border border-zinc-700"
                                >
                                  <MessageCircle size={16} />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-zinc-900 border border-zinc-800 text-white shadow-xl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Enviar Recibo por WhatsApp
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    ¿Estás seguro de que deseas enviar este
                                    recibo por WhatsApp?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-white">
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleSendWhatsApp(item.id)}
                                    className="bg-green-600 hover:bg-green-700 text-white border-0"
                                  >
                                    Enviar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-zinc-400 whitespace-nowrap">
                  Mostrando {startIndex + 1} -{" "}
                  {Math.min(startIndex + rowsPerPage, filteredData.length)} de{" "}
                  {filteredData.length}
                </p>

                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage((prev) => Math.max(prev - 1, 1));
                        }}
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                      (page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            isActive={currentPage === page}
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(page);
                            }}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ),
                    )}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages),
                          );
                        }}
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          )}

          {!isLoading && filteredData.length === 0 && (
            <p className="text-center text-zinc-400 py-6">No hay datos</p>
          )}
        </CardContent>
      </Card>

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
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-white text-black" onClick={handleSave}>
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Historial;

