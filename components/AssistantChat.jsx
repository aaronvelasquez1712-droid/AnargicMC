"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { X, Send, ChevronRight, Sparkles } from "lucide-react";
import "./AssistantChat.css";

const quickQuestions = [
  {
    id: 1,
    label: "¿Cómo inicio sesión?",
    answer: `Para iniciar sesión en AnargicMC:\n\n1️⃣ Haz clic en el botón **INGRESAR** en la barra superior.\n2️⃣ Selecciona la pestaña **Nick** o **Email** según prefieras.\n3️⃣ Ingresa tu nombre de usuario de Minecraft y tu contraseña.\n4️⃣ Presiona **Iniciar Sesión**.\n\n💡 *Recuerda que el nick distingue mayúsculas y minúsculas.*`
  },
  {
    id: 2,
    label: "¿Cómo vinculo mi Discord?",
    answer: `Para vincular tu cuenta de Discord con AnargicMC:\n\n1️⃣ Inicia sesión con tu cuenta normal (Nick o Email).\n2️⃣ Ve a tu **Perfil** desde el menú superior.\n3️⃣ Busca la sección **Cuentas Vinculadas**.\n4️⃣ Haz clic en **Conectar Discord**.\n5️⃣ Se abrirá una ventana de autorización de Discord. ¡Acéptala!\n\n✅ Luego podrás usar el botón **"Iniciar sesión con Discord"** directamente.`
  },
  {
    id: 3,
    label: "¿Cómo cambio mi foto de perfil?",
    answer: `Para cambiar tu foto de perfil en AnargicMC:\n\n1️⃣ Ve a tu **Perfil** desde el menú superior.\n2️⃣ En la sección de **Cosméticos**, selecciona la pestaña **Fotos de Perfil**.\n3️⃣ Elige una foto disponible en tu inventario y haz clic en **Equipar**.\n\n🎁 Puedes obtener más fotos de perfil en la **Tienda** o completando misiones dentro del servidor.`
  },
  {
    id: 4,
    label: "¿Cómo desbloqueo cosméticos?",
    answer: `Existen varias formas de desbloquear cosméticos:\n\n🛒 **Tienda**: Compra banners, marcos y fotos de perfil con dinero real o monedas del servidor.\n🎯 **Misiones**: Completa misiones dentro del servidor de Minecraft para ganar cosméticos gratis.\n🎰 **Sorteos y Ruleta**: Participa en eventos para ganar cosméticos exclusivos.\n⭐ **Cosméticos Gratis**: Algunos ya están disponibles por defecto. ¡Revisa tu perfil!`
  },
  {
    id: 5,
    label: "¿Cuál es la IP del servidor?",
    answer: `La IP del servidor AnargicMC es:\n\n🌐 **anargicmc.play.hosting**\n📦 **Versión**: Minecraft Java Edition 1.21.5\n\n1️⃣ Abre Minecraft y ve a **Multijugador**.\n2️⃣ Haz clic en **Añadir servidor**.\n3️⃣ Escribe la IP y conéctate.\n\n¡Te esperamos dentro! ⚔️`
  },
  {
    id: 6,
    label: "¿Cómo registro mi cuenta?",
    answer: `Puedes registrarte de dos formas:\n\n🌐 **Desde la web**: Haz clic en **¿No tienes cuenta?** en la página de inicio de sesión y completa el formulario.\n\n🎮 **Desde Minecraft**: Entra al servidor con la IP **anargicmc.play.hosting** y escribe el comando:\n\n\`/register TuContraseña\`\n\n✅ Tu cuenta quedará registrada automáticamente y podrás acceder a la web con las mismas credenciales.`
  },
];

const BOT_NAME = "Anargic IA";

function formatMessage(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br/>");
}

function matchQuestion(input) {
  const lower = input.toLowerCase();
  const keywords = {
    1: ["sesión", "sesion", "inicio", "ingresar", "login", "entrar", "acceder"],
    2: ["discord", "vincular", "vinculo", "vincular cuenta"],
    3: ["foto", "perfil", "cambiar foto", "avatar", "imagen"],
    4: ["cosmético", "cosmetico", "cosmetic", "banner", "marco", "desbloquear", "desbloqueo"],
    5: ["ip", "servidor", "dirección", "direccion", "conectar"],
    6: ["registrar", "registro", "crear cuenta", "nueva cuenta"],
  };

  for (const [id, kws] of Object.entries(keywords)) {
    if (kws.some(kw => lower.includes(kw))) {
      return quickQuestions.find(q => q.id === parseInt(id));
    }
  }
  return null;
}

export default function AssistantChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 0,
      type: "bot",
      text: "¡Hola! Soy el asistente de **AnargicMC** 👋\n\nPuedo ayudarte con preguntas frecuentes. Selecciona una opción o escribe tu pregunta.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const pathname = usePathname();

  if (pathname && pathname.startsWith("/movilpage")) {
    return null;
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const addBotMessage = (text) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { id: Date.now(), type: "bot", text }]);
    }, 900);
  };

  const handleQuickQuestion = (q) => {
    setMessages(prev => [...prev, { id: Date.now(), type: "user", text: q.label }]);
    addBotMessage(q.answer);
  };

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    setMessages(prev => [...prev, { id: Date.now(), type: "user", text: trimmed }]);
    setInputValue("");

    const matched = matchQuestion(trimmed);
    if (matched) {
      addBotMessage(matched.answer);
    } else {
      addBotMessage("Lo siento, no fui programado para responder esa pregunta. 🤖\n\nPor favor selecciona una de las opciones disponibles o contacta a nuestro equipo en Discord.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <>
      {/* Chat Panel */}
      {isOpen && (
        <div className="chat-panel animate-fade-in">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar">
                <Sparkles size={16} />
              </div>
              <div>
                <p className="chat-bot-name">{BOT_NAME}</p>
                <span className="chat-status">
                  <span className="status-dot"></span> En línea
                </span>
              </div>
            </div>
            <button className="chat-close-btn" onClick={() => setIsOpen(false)}>
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.type}`}>
                {msg.type === "bot" && (
                  <div className="bot-avatar-small">
                    <Sparkles size={12} />
                  </div>
                )}
                <div
                  className="message-bubble"
                  dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
                />
              </div>
            ))}

            {isTyping && (
              <div className="message bot">
                <div className="bot-avatar-small"><Sparkles size={12} /></div>
                <div className="message-bubble typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          <div className="quick-questions">
            <p className="quick-label">Preguntas rápidas:</p>
            <div className="quick-list">
              {quickQuestions.map((q) => (
                <button
                  key={q.id}
                  className="quick-btn"
                  onClick={() => handleQuickQuestion(q)}
                >
                  <ChevronRight size={13} />
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="chat-input-row">
            <input
              type="text"
              className="chat-input"
              placeholder="Escribe tu pregunta..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="chat-send-btn" onClick={handleSend}>
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        className={`assistant-fab ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Asistente de Anargic"
      >
        {!isOpen && <div className="fab-pulse"></div>}
        <div className="fab-icon">
          {isOpen ? (
            <X size={24} />
          ) : (
            <Sparkles size={24} />
          )}
        </div>
        {!isOpen && <span className="fab-label">IA</span>}
      </button>
    </>
  );
}
