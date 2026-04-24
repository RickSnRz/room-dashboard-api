import React from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { logout } from "../utils/authUtils"

import {
  LayoutDashboard,
  Folder,
  Users,
  Home,
  BedDouble,
  Receipt,
  LogOut,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const NavBar = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const navItems = [
    { path: "/mainpage/home", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/mainpage/historial", icon: Folder, label: "Historial" },
    { path: "/mainpage/alquileres", icon: Home, label: "Alquileres" },
    { path: "/mainpage/inquilinos", icon: Users, label: "Inquilinos" },
    { path: "/mainpage/habitaciones", icon: BedDouble, label: "Habitaciones" },
    { path: "/mainpage/recibos", icon: Receipt, label: "Recibos" },
  ]

  return (
    <aside className="w-64 h-screen bg-zinc-950 border-r border-zinc-800 flex flex-col justify-between p-5">

      {/* HEADER */}
      <div>
        <div className="mb-8 text-center">
          <h2 className="text-xl font-semibold text-white tracking-tight">
            🏠 Room Admin
          </h2>
          <p className="text-xs text-zinc-400">
            Gestión de alquileres
          </p>
        </div>

        {/* NAV */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            const Icon = item.icon

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all
                  ${
                    isActive
                      ? "bg-zinc-800 text-white shadow-inner"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* FOOTER */}
      <div>
        <Separator className="my-4 bg-zinc-800" />

        <Button
          onClick={handleLogout}
          variant="destructive"
          className="w-full flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </Button>
      </div>
    </aside>
  )
}

export default NavBar;