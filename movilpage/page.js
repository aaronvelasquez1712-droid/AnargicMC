"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Copy, MessageCircle, Server, Users, Shield, ArrowRight, Gamepad2, Info, Check } from "lucide-react";
import { supabase } from "@/utils/supabase";
import { getAvatarSrc, getFrameSrc } from "@/utils/avatar";
import "./home-movil.css";

export default function MovilHomePage() {
  const [latestMembers, setLatestMembers] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      const { data } = await supabase
        .from("users")
        .select("minecraft_username, created_at, equipped_profile_pic_url, equipped_frame_url, custom_face_url")
        .order("created_at", { ascending: false })
        .limit(6);
      
      if (data) setLatestMembers(data);
    };
    fetchMembers();
  }, []);

  const copyIp = () => {
    navigator.clipboard.writeText("play.anargic.net");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="movil-home-container animate-fade-in">
      {/* App-like Hero */}
      <div className="m-hero">
        <div className="m-hero-bg"></div>
        <div className="m-hero-content">
          <h1 className="m-hero-title">
            <span className="text-white">ANARGIC</span><span className="text-blue">MC</span>
          </h1>
          <p className="m-hero-subtitle">La mejor red de supervivencia de la comunidad hispana.</p>
          
          <button className={`m-btn-ip ${copied ? 'copied' : ''}`} onClick={copyIp}>
            {copied ? <Check size={20} /> : <Copy size={20} />}
            <span>{copied ? "¡IP Copiada!" : "play.anargic.net"}</span>
          </button>
          
          <Link href="https://discord.gg/9bBBrqafVd" target="_blank" className="m-btn-discord">
            <MessageCircle size={20} />
            <span>Únete al Discord</span>
          </Link>
        </div>
      </div>

      {/* Swipeable Members Section */}
      <div className="m-section">
        <div className="m-section-header">
          <Users size={20} className="m-icon-primary" />
          <h2>Últimos Jugadores</h2>
        </div>
        
        <div className="m-horizontal-scroll">
          {latestMembers.map((member, i) => (
            <div key={i} className="m-member-card">
              <div className="m-member-avatar-wrapper">
                <img 
                  src={getAvatarSrc(member)} 
                  alt={member.minecraft_username}
                  className="m-member-avatar"
                  onError={(e) => { e.target.src = `https://minotar.net/helm/${member.minecraft_username}/64.png` }}
                />
                {member.equipped_frame_url && (
                  <img src={getFrameSrc(member)} alt="Frame" className="m-member-frame" />
                )}
              </div>
              <span className="m-member-name">{member.minecraft_username}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Info Grid */}
      <div className="m-section">
        <div className="m-section-header">
          <Info size={20} className="m-icon-primary" />
          <h2>Explora</h2>
        </div>
        
        <div className="m-info-grid">
          <div className="m-info-card">
            <Server size={24} className="m-card-icon" />
            <h3>Modalidades</h3>
            <p>Survival, Skyblock, Factions</p>
          </div>
          <div className="m-info-card">
            <Gamepad2 size={24} className="m-card-icon" />
            <h3>Minijuegos</h3>
            <p>Bedwars, Skywars</p>
          </div>
          <div className="m-info-card">
            <Shield size={24} className="m-card-icon" />
            <h3>Protección</h3>
            <p>Anti-DDOS, Anti-Cheat</p>
          </div>
          <div className="m-info-card">
            <ArrowRight size={24} className="m-card-icon" />
            <h3>Soporte</h3>
            <p>24/7 en Discord</p>
          </div>
        </div>
      </div>
    </div>
  );
}
