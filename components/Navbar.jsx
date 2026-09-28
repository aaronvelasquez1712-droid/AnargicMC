"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { ChevronDown, User, Settings, LogOut, Search, Bell, Users, Shield, BookOpen, Gavel, Trophy, Gift, Sword, Package, Check, X, Server, HeadsetIcon, Headset } from "lucide-react";
import { supabase } from "@/utils/supabase";
import "./Navbar.css";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null); // 'comunidad' | 'tienda' | 'juegos'
  const [searchQuery, setSearchQuery] = useState("");
  const [notifCount, setNotifCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const router = useRouter();
  const pathname = usePathname();
  const dropRef = useRef(null);

  if (pathname && pathname.startsWith("/movilpage")) {
    return null;
  }


  useEffect(() => {
    const storedUser = localStorage.getItem("anargic_user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    const loadNotifs = async () => {
      if (!user) return;
      const stored = localStorage.getItem("anargic_user");
      if (!stored) return;
      const { nick } = JSON.parse(stored);
      const { data: u } = await supabase.from("users").select("id").eq("minecraft_username", nick).limit(1);
      if (!u || !u.length) return;
      
      const myId = u[0].id;
      
      // 1. Fetch normal notifications
      const { count } = await supabase.from("notifications").select("*", { count: "exact", head: true }).eq("user_id", myId).eq("is_read", false);
      const { data: notifs } = await supabase.from("notifications")
        .select("*")
        .eq("user_id", myId)
        .order("created_at", { ascending: false })
        .limit(5);
        
      if (notifs) {
        setNotifications(notifs);
      }
      
      // 2. Fetch friend requests
      const { data: requests } = await supabase.from("friends")
        .select("id, created_at, user_id_1, sender:users!friends_user_id_1_fkey(minecraft_username)")
        .eq("user_id_2", myId)
        .eq("status", "PENDING")
        .order("created_at", { ascending: false });
        
      if (requests) {
        setFriendRequests(requests);
      }
      
      setNotifCount((count || 0) + (requests ? requests.length : 0));
    };
    loadNotifs();
  }, [user]);

  const handleAcceptFriend = async (reqId) => {
    await supabase.from("friends").update({ status: 'ACCEPTED' }).eq("id", reqId);
    setFriendRequests(prev => prev.filter(r => r.id !== reqId));
    setNotifCount(prev => Math.max(0, prev - 1));
  };
  
  const handleDeclineFriend = async (reqId) => {
    await supabase.from("friends").delete().eq("id", reqId);
    setFriendRequests(prev => prev.filter(r => r.id !== reqId));
    setNotifCount(prev => Math.max(0, prev - 1));
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setOpenDropdown(null);
        setIsProfileOpen(false);
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("anargic_user");
    setUser(null);
    setIsProfileOpen(false);
    window.location.href = "/";
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsProfileOpen(false);
      router.push(`/buscar?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const toggleDropdown = (name) => setOpenDropdown(prev => prev === name ? null : name);

  return (
    <header className="navbar-container">
      <div className="container navbar" ref={dropRef}>
        <div className="logo">
          <Link href="/" className="logo-link">
            <span className="logo-text">ANARGIC<span className="logo-accent">MC</span></span>
          </Link>
        </div>

        <nav className={`nav-links ${isMenuOpen ? "open" : ""}`}>
          <div className="nav-item">
            <Link href="/" className="nav-link">INICIO</Link>
          </div>
          
          <div className="nav-item">
            <Link href="/noticias" className="nav-link">NOTICIAS</Link>
          </div>

          {/* COMUNIDAD DROPDOWN */}
          <div className="nav-item nav-dropdown-wrap">
            <button className="nav-link nav-dropdown-btn" onClick={() => toggleDropdown("comunidad")}>
              COMUNIDAD <ChevronDown size={14} className={`nav-chevron ${openDropdown === "comunidad" ? "open" : ""}`} />
            </button>
            {openDropdown === "comunidad" && (
              <div className="nav-dropdown">
                <Link href="/staff" className="nav-dropdown-item" onClick={() => setOpenDropdown(null)}><Shield size={15}/> Staff</Link>
                <Link href="/reglas" className="nav-dropdown-item" onClick={() => setOpenDropdown(null)}><BookOpen size={15}/> Reglas</Link>
                <Link href="/baneos" className="nav-dropdown-item" onClick={() => setOpenDropdown(null)}><Gavel size={15}/> Baneos</Link>
                <Link href="/eventos" className="nav-dropdown-item" onClick={() => setOpenDropdown(null)}><Gift size={15}/> Eventos</Link>
                <Link href="/comunidad" className="nav-dropdown-item" onClick={() => setOpenDropdown(null)}><Trophy size={15}/> Top</Link>
                <Link href="/servidores" className="nav-dropdown-item" onClick={() => setOpenDropdown(null)}><Server size={15}/> Servidores</Link>
              </div>
            )}
          </div>

          {/* TIENDA DROPDOWN */}
          <div className="nav-item nav-dropdown-wrap">
            <button className="nav-link nav-dropdown-btn" onClick={() => toggleDropdown("tienda")}>
              TIENDA <ChevronDown size={14} className={`nav-chevron ${openDropdown === "tienda" ? "open" : ""}`} />
            </button>
            {openDropdown === "tienda" && (
              <div className="nav-dropdown">
                <Link href="/tienda?tab=mejoras" className="nav-dropdown-item" onClick={() => setOpenDropdown(null)}><Trophy size={15}/> Mejoras</Link>
                <Link href="/tienda?tab=cosmeticos" className="nav-dropdown-item" onClick={() => setOpenDropdown(null)}><Users size={15}/> Cosméticos</Link>
                <Link href="/tienda?tab=kits" className="nav-dropdown-item" onClick={() => setOpenDropdown(null)}><Sword size={15}/> Kits</Link>
                <Link href="/tienda?tab=roles" className="nav-dropdown-item" onClick={() => setOpenDropdown(null)}><Shield size={15}/> Roles</Link>
              </div>
            )}
          </div>

          {/* SOPORTE */}
          <div className="nav-item">
            <Link href="/soporte" className="nav-link">SOPORTE</Link>
          </div>

        </nav>

        <div className="nav-actions">
          {user ? (
            <>
              {/* Campana de notificaciones */}
              <div className="notif-wrapper">
                <button 
                  className="notif-bell" 
                  title="Notificaciones" 
                  onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); setOpenDropdown(null); }}
                >
                  <Bell size={20} />
                  {notifCount > 0 && <span className="notif-dot">{notifCount > 9 ? "9+" : notifCount}</span>}
                </button>

                {isNotifOpen && (
                  <div className="notif-dropdown">
                    <div className="notif-header">
                      <h4>Notificaciones</h4>
                    </div>
                    <div className="notif-body">
                      {friendRequests.length === 0 && notifications.length === 0 ? (
                        <p className="notif-empty">No tienes notificaciones.</p>
                      ) : (
                        <>
                          {friendRequests.map((req) => (
                            <div key={`fr-${req.id}`} className="notif-item unread friend-request-item">
                              <p className="notif-message"><strong>{req.sender?.minecraft_username}</strong> te envió una solicitud de amistad.</p>
                              <div className="friend-request-actions">
                                <button className="btn-accept-friend" onClick={() => handleAcceptFriend(req.id)}><Check size={14}/> Aceptar</button>
                                <button className="btn-decline-friend" onClick={() => handleDeclineFriend(req.id)}><X size={14}/> Rechazar</button>
                              </div>
                              <span className="notif-time">{new Date(req.created_at).toLocaleDateString()}</span>
                            </div>
                          ))}
                          {notifications.map((n) => {
                            const notifContent = (
                              <div key={n.id} className={`notif-item ${!n.is_read ? "unread" : ""}`}>
                                <p className="notif-message">{n.message}</p>
                                <span className="notif-time">{new Date(n.created_at).toLocaleDateString()}</span>
                              </div>
                            );
                            
                            if (n.type === "EVENT") {
                              return (
                                <Link href="/eventos" key={n.id} onClick={() => setIsNotifOpen(false)} style={{ textDecoration: 'none', color: 'inherit' }}>
                                  {notifContent}
                                </Link>
                              );
                            }
                            return notifContent;
                          })}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="user-profile-menu">
                <button
                  className="user-profile-btn"
                  onClick={() => { setIsProfileOpen(!isProfileOpen); setOpenDropdown(null); }}
                >
                  <img
                    src={`https://minotar.net/helm/${user.nick}/32.png`}
                    alt={user.nick}
                    className="nav-avatar"
                    onError={(e) => { e.target.src = "https://minotar.net/helm/Steve/32.png"; }}
                  />
                  <span className="nav-username">{user.nick}</span>
                  <ChevronDown size={14} className={`profile-chevron ${isProfileOpen ? "open" : ""}`} />
                </button>

                {isProfileOpen && (
                  <div className="profile-dropdown">
                    <div className="dropdown-search">
                      <form onSubmit={handleSearch} style={{ display: "flex", alignItems: "center", width: "100%", gap: "6px" }}>
                        <Search size={14} color="#a1a1aa" />
                        <input
                          type="text"
                          placeholder="Buscar jugador..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          style={{ background: "transparent", border: "none", color: "#fff", outline: "none", fontSize: "0.85rem", width: "100%" }}
                        />
                      </form>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link href="/perfil" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                      <User size={16} /> Mi perfil
                    </Link>
                    <Link href="/inventario" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                      <Package size={16} /> Inventario
                    </Link>
                    <Link href="/configuracion" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                      <Settings size={16} /> Configuración
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item logout-item" onClick={handleLogout}>
                      <LogOut size={16} /> Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link href="/login" className="btn btn-secondary nav-login-btn">
              INGRESAR
            </Link>
          )}

          <button
            className="mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ☰
          </button>
        </div>
      </div>
    </header>
  );
}
