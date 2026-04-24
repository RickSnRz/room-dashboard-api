import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

import { isAuthenticated } from "../utils/authUtils";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Users, UserCheck, Loader2 } from "lucide-react";

export default function Inquilinos() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) navigate("/");
  }, [navigate]);

  const token = localStorage.getItem("token");

  const [dni, setDni] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const [total, setTotal] = useState(0);

  const [pdfFile, setPdfFile] = useState(null);
  const [pdfPreview, setPdfPreview] = useState(null);

  const [loading, setLoading] = useState(false);

  const validarEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const fetchInquilinos = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/inquilinos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTotal(res.data.length);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchInquilinos();
  }, []);

  const handlePdfChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      Swal.fire("Error", "Solo se permiten archivos PDF", "error");
      return;
    }

    setPdfFile(file);
    setPdfPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!dni || !nombre || !apellido || !telefono || !email) {
      setError("Completa todos los campos");
      return;
    }

    if (!validarEmail(email)) {
      setError("El formato del correo no es válido");
      return;
    }

    if (!pdfFile) {
      setError("Debes seleccionar el DNI en PDF");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        "http://localhost:8080/api/inquilinos",
        { dni, nombre, apellido, telefono, email },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const formData = new FormData();
      formData.append("file", pdfFile);

      await axios.post(
        `http://localhost:8080/api/inquilinos/${dni}/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      toast.success("Inquilino registrado", {
        description: "El inquilino y su DNI fueron guardados correctamente",
      });

      setDni("");
      setNombre("");
      setApellido("");
      setTelefono("");
      setEmail("");
      setPdfFile(null);
      setPdfPreview(null);
      setError("");

      fetchInquilinos();
    } catch (error) {
      console.error(error);
      toast.error("Error al registrar", {
        description: "Verifica los datos o intenta nuevamente",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 text-white">
      <h2 className="text-3xl font-bold mb-2">Inquilinos</h2>
      <p className="text-zinc-400 mb-6">Gestión y registro de inquilinos.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* FORM (NO TOCADO) */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>Registrar inquilino</CardTitle>
            <CardDescription>
              Completa los datos del nuevo inquilino.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {["DNI", "Nombre", "Apellido", "Teléfono", "Email"].map(
                (label, idx) => {
                  const values = [dni, nombre, apellido, telefono, email];
                  const setters = [
                    setDni,
                    setNombre,
                    setApellido,
                    setTelefono,
                    setEmail,
                  ];

                  return (
                    <div key={idx} className="space-y-2">
                      <Label>{label}</Label>
                      <Input
                        value={values[idx]}
                        onChange={(e) => setters[idx](e.target.value)}
                        placeholder={`Ej: ${label}`}
                        className="bg-zinc-950 border-zinc-800 w-full md:w-[80%]"
                        type={label === "Email" ? "email" : "text"}
                      />
                    </div>
                  );
                },
              )}

              <div className="mt-8 space-y-4">
                <Label>DNI en PDF</Label>
                <Input
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfChange}
                  className="bg-zinc-950 border-zinc-800 w-full md:w-[80%]"
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <Button
                disabled={loading}
                className="w-full bg-white text-black hover:bg-zinc-200 font-semibold">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin w-4 h-4" />
                    Registrando...
                  </span>
                ) : (
                  "Registrar inquilino"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 🔥 CARDS MODERNAS */}
        <div className="space-y-4">
          {/* TOTAL */}
          <Card className="bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-zinc-400">
                Total de inquilinos
              </CardTitle>
              <Users className="w-5 h-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{total}</p>
            </CardContent>
          </Card>

          {/* ACTIVOS */}
          <Card className="bg-zinc-900 border border-zinc-800 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-zinc-400">
                Inquilinos activos
              </CardTitle>
              <UserCheck className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{total}</p>
            </CardContent>
          </Card>

          {/* PREVIEW (ligeramente mejorado visual) */}
          {pdfPreview && (
            <Card className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-all">
              <CardHeader>
                <CardTitle className="text-white text-base">
                  Vista previa del DNI (PDF)
                </CardTitle>
                <CardDescription>
                  Documento seleccionado antes de subirlo.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <iframe
                  src={pdfPreview}
                  className="w-full h-[320px] rounded-md bg-black border border-zinc-800"
                  title="Vista previa PDF"
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
