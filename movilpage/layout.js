"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Gift, User, Menu } from "lucide-react";
import "./movil.css";

export default function MovilLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="mobile-app-layout">
      <div className="mobile-app-content">
        {children}
      </div>

      <nav className="bottom-nav">
        <Link 
          href="/movilpage" 
          className={`nav-item-btn ${pathname === "/movilpage" ? "active" : ""}`}
        >
          <Home className="nav-icon" />
          <span>Inicio</span>
        </Link>

        <Link 
          href="/movilpage/tienda" 
          className={`nav-item-btn ${pathname === "/movilpage/tienda" ? "active" : ""}`}
        >
          <ShoppingBag className="nav-icon" />
          <span>Tienda</span>
        </Link>

        <Link 
          href="/movilpage/eventos" 
          className={`nav-item-btn ${pathname === "/movilpage/eventos" ? "active" : ""}`}
        >
          <Gift className="nav-icon" />
          <span>Eventos</span>
        </Link>

        <Link 
          href="/movilpage/perfil" 
          className={`nav-item-btn ${pathname === "/movilpage/perfil" ? "active" : ""}`}
        >
          <User className="nav-icon" />
          <span>Perfil</span>
        </Link>

        <Link 
          href="/movilpage/mas" 
          className={`nav-item-btn ${pathname === "/movilpage/mas" ? "active" : ""}`}
        >
          <Menu className="nav-icon" />
          <span>Más</span>
        </Link>
      </nav>
    </div>
  );
}
