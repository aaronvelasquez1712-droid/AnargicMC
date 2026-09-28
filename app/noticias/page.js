"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { MessageCircle, Link as LinkIcon } from "lucide-react";
import "./page.css";

export default function NoticiasPage() {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNoticias = async () => {
      // Intentamos cargar las noticias de la base de datos
      const { data, error } = await supabase
        .from("noticias")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
        setNoticias(data);
      } else if (error) {
        console.error("Error cargando noticias:", error);
      }
      setLoading(false);
    };

    fetchNoticias();
  }, []);

  return (
    <div className="noticias-container">
      <div className="noticias-header animate-fade-in">
        <h1>Últimas Noticias</h1>
        <p>Entérate de todas las novedades y actualizaciones de AnargicMC</p>
      </div>

      <div className="noticias-grid">
        {loading ? (
          <div className="loading-spinner">Cargando noticias...</div>
        ) : noticias.length === 0 ? (
          <div className="no-noticias animate-fade-in">Aún no hay noticias publicadas. ¡Vuelve pronto!</div>
        ) : (
          noticias.map((noticia, idx) => (
            <div 
              key={noticia.id} 
              className="noticia-card animate-fade-in"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div 
                className="noticia-portada" 
                style={{ 
                  backgroundImage: `url(${noticia.portada || '/mc_community_bg_1789255891090.jpg'})` 
                }}
              >
                <div className="noticia-fecha">
                  {new Date(noticia.created_at).toLocaleDateString("es-ES", { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
              
              <div className="noticia-contenido-wrap">
                <h2 className="noticia-titulo">{noticia.titulo}</h2>
                <div className="noticia-texto">
                  {noticia.contenido}
                </div>
                
                {/* Redes Sociales Footer */}
                {(noticia.ig || noticia.facebook || noticia.tiktok || noticia.discord) && (
                  <div className="noticia-footer">
                    <span className="noticia-social-text">Síguenos en:</span>
                    <div className="noticia-sociales">
                      {noticia.ig && (
                        <a 
                          href={`https://instagram.com/${noticia.ig.replace('@', '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="social-link ig" 
                          title={`Instagram: ${noticia.ig}`}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                        </a>
                      )}
                      {noticia.facebook && (
                        <a 
                          href={`https://facebook.com/${noticia.facebook.replace('@', '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="social-link fb" 
                          title={`Facebook: ${noticia.facebook}`}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                        </a>
                      )}
                      {noticia.tiktok && (
                        <a 
                          href={`https://tiktok.com/${noticia.tiktok.startsWith('@') ? noticia.tiktok : '@' + noticia.tiktok}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="social-link tiktok" 
                          title={`TikTok: ${noticia.tiktok}`}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
                        </a>
                      )}
                      {noticia.discord && (
                        <a 
                          href={noticia.discord.startsWith('http') ? noticia.discord : 'https://discord.gg/9bBBrqafVd'} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="social-link discord" 
                          title="Únete a nuestro Discord"
                        >
                          <MessageCircle size={18} />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
