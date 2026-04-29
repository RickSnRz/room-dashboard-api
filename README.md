# 🏠 Room Dashboard - Frontend

Aplicación web moderna para la gestión de alquiler de habitaciones, desarrollada con tecnologías actuales y enfocada en una experiencia de usuario fluida, visual y eficiente.

---

## 🚀 Tecnologías utilizadas

* ⚛️ React (Vite)
* 🎨 Tailwind CSS
* 🧩 shadcn/ui (componentes modernos)
* 🔐 Autenticación con JWT (Bearer Token)
* 🌐 Axios (consumo de API REST)
* 📊 Recharts (visualización de datos)
* 🔔 Sonner (notificaciones elegantes)
* 🎬 Framer Motion (animaciones suaves)
* 📅 date-fns (manejo de fechas)
* 📁 xlsx + file-saver (exportación a Excel)

---

## 📦 Módulos del sistema

### 🧑‍💼 Inquilinos

* Registro de nuevos inquilinos
* Subida de DNI en PDF
* Validación de campos
* Vista previa del documento
* Contador de inquilinos registrados

---

### 🛏️ Habitaciones

* Registro de habitaciones
* Estados: Disponible / Ocupado
* Estadísticas en tiempo real:

  * Habitaciones disponibles
  * Habitaciones ocupadas
  * Total de habitaciones
* Cards interactivas con efectos visuales

---

### 📄 Alquileres

* Registro de alquileres
* Selección dinámica de:

  * Inquilino
  * Habitación disponible
* Calendario interactivo para fecha de ingreso
* Vista previa en tiempo real del alquiler:

  * Datos del inquilino
  * Habitación
  * Monto automático
  * Fecha seleccionada
* Estadísticas:

  * Alquileres activos
  * Alquileres finalizados
  * Total de alquileres

---

### 🧾 Recibos

* Generación de recibos de alquiler
* Registro de pagos
* Visualización de historial

---

### 📊 Dashboard

* Vista general del sistema
* Indicadores clave:

  * Total de inquilinos
  * Habitaciones
  * Ocupación
  * Recibos generados
* Gráfico de ingresos por mes
* Análisis en tiempo real

---

## 🎨 Diseño UI/UX

* Tema oscuro profesional (Zinc)
* Interfaces limpias y modernas
* Componentes reutilizables
* Animaciones suaves
* Feedback visual inmediato (toasts)
* Cards con hover interactivo

---

## 🔐 Seguridad

* Protección de rutas mediante autenticación
* Uso de tokens JWT
* Manejo seguro de sesiones

---

## ⚙️ Instalación y ejecución

```bash
# Clonar repositorio
git clone https://github.com/RickSnRz/room-dashboard-api.git

# Instalar dependencias
npm install

# Ejecutar proyecto
npm run dev
```

---

## 🌐 Conexión con Backend

El frontend consume una API REST desarrollada en Spring Boot:

```
http://localhost:8080/api
```

---

## 🌐 Endpoints principales consumidos

- `POST /auth/login`
- `GET /api/inquilinos`
- `POST /api/inquilinos`
- `PUT /api/inquilinos/{id}`
- `POST /api/inquilinos/{dni}/upload`
- `GET /api/inquilinos/{dni}/download`

- `GET /api/habitaciones`
- `POST /api/habitaciones`
- `PUT /api/habitaciones/{id}`

- `GET /api/alquileres`
- `POST /api/alquileres/crear`

- `GET /api/recibos`
- `POST /api/recibos?inquilinoId={id}&habitacionId={id}`
- `POST /api/recibos/{id}/generar`
- `GET /api/recibos/{id}/download`

- `POST /api/whatsapp/enviar-recibo/{id}`

## 🧭 Rutas de la aplicación

- `/` → Login
- `/mainpage/home` → Dashboard
- `/mainpage/inquilinos`
- `/mainpage/habitaciones`
- `/mainpage/alquileres`
- `/mainpage/recibos`
- `/mainpage/historial`

## 📸 Vista general

Sistema diseñado para facilitar la administración de alquileres de habitaciones, permitiendo una gestión clara, rápida y visual de todo el flujo:

* Registro
* Control
* Visualización
* Análisis

---

## 👨‍💻 Autor

Desarrollado por **Rick Samán**

---

## 📄 Licencia

Proyecto de uso personal / educativo.
