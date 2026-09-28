"use client";
import { useState, useEffect } from "react";
import { X, Smartphone, CreditCard, Building, Image as ImageIcon, CheckCircle, Info } from "lucide-react";
import { supabase } from "@/utils/supabase";
import "./CheckoutModal.css";

export default function CheckoutModal({ item, onClose }) {
  const [step, setStep] = useState(1); // 1: Methods, 2: Form, 3: Confirm, 4: Success
  const [methods, setMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Form State
  const [phone, setPhone] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [reference, setReference] = useState("");
  const [proofImage, setProofImage] = useState(null); // File object or data string (for demo we use string)
  
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
      // Check auth
      const stored = localStorage.getItem("anargic_user");
      if (stored) {
        const { nick } = JSON.parse(stored);
        const { data: users } = await supabase.from("users").select("id").eq("minecraft_username", nick).limit(1);
        if (users && users.length > 0) setUser(users[0]);
      }

      // Load Methods
      const { data } = await supabase.from("payment_methods").select("*").eq("is_active", true);
      if (data) {
        setMethods(data.length > 0 ? data : [
          {
            id: "fake-1",
            name: "Pago Móvil (Venezuela)",
            type: "pago_movil",
            instructions: "Realiza el pago a los siguientes datos y sube el comprobante.",
            details: { banco: "Banco de Venezuela (0102)", telefono: "04120000000", cedula: "V-12345678" }
          },
          {
            id: "fake-2",
            name: "Transferencia Bancaria",
            type: "transferencia",
            instructions: "Transfiere al siguiente número de cuenta.",
            details: { banco: "Banesco (0134)", cuenta: "0134-xxxx-xxxx-xxxx-xxxx", titular: "Anargic Network" }
          }
        ]);
      }
      setLoading(false);
    };
    init();
  }, []);

  const handleMethodSelect = (m) => {
    setSelectedMethod(m);
    setStep(2);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!phone || !documentId || !reference) return;
    setStep(3);
  };

  const handleConfirm = async () => {
    if (!user) {
      alert("Debes iniciar sesión para comprar");
      window.location.href = "/login";
      return;
    }
    
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('userId', user.id);
      formData.append('phone', phone);
      formData.append('documentId', documentId);
      formData.append('reference', reference);
      formData.append('platform', selectedMethod.name);
      formData.append('itemName', item.name);
      formData.append('itemPrice', item.price || item.priceUSD || item.price_usd || 0);
      formData.append('itemType', item.type || item.category_name?.toUpperCase() || 'UNKNOWN');
      formData.append('itemToken', item.token || item.id);
      formData.append('proofImage', proofImage);

      const res = await fetch('/api/transactions/submit', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Error al procesar el pago');
      }
      
      setStep(4);
      setTimeout(() => {
        window.location.href = "/";
      }, 5000); 
      
    } catch (err) {
      alert(err.message || "Error al procesar el pago");
    } finally {
      setSubmitting(false);
    }
  };

  if (!item) return null;

  return (
    <div className="co-modal-overlay">
      <div className="co-modal-content animate-scale">
        <button className="co-close-btn" onClick={onClose}><X size={24} /></button>

        {step === 1 && (
          <div className="co-step-1">
            <h2>Selecciona un Método de Pago</h2>
            <div className="co-item-summary">
              Comprando: <strong>{item.name}</strong> por <span>{item.price || item.priceUSD || item.price_usd} {item.currency || 'USD'}</span>
            </div>
            
            {loading ? (
              <div className="co-loading">Cargando métodos...</div>
            ) : (
              <div className="co-methods-list">
                {methods.map(m => (
                  <button key={m.id} className="co-method-card" onClick={() => handleMethodSelect(m)}>
                    <div className="co-method-icon">
                      {m.type === 'pago_movil' ? <Smartphone size={28} /> : 
                       m.type === 'transferencia' ? <Building size={28} /> : 
                       <CreditCard size={28} />}
                    </div>
                    <div className="co-method-info">
                      <h3>{m.name}</h3>
                      <p>{m.type === 'pago_movil' ? 'Pago instantáneo' : 'Aprobación en 24h'}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="co-step-2">
            <h2>Datos del Pago</h2>
            <p className="co-instructions">{selectedMethod.instructions}</p>
            
            <div className="co-bank-details">
              {selectedMethod.details && Object.entries(selectedMethod.details).map(([key, value]) => (
                <div key={key} className="co-detail-row">
                  <span>{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>

            <form onSubmit={handleFormSubmit} className="co-form">
              <div className="co-input-group">
                <label>Teléfono Emisor</label>
                <input type="text" required placeholder="0412xxxxxxx" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div className="co-input-group">
                <label>Cédula del Titular</label>
                <input type="text" required placeholder="V-xxxxxxxx" value={documentId} onChange={e => setDocumentId(e.target.value)} />
              </div>
              <div className="co-input-group">
                <label>Número de Referencia</label>
                <input type="text" required placeholder="Últimos 6 dígitos" value={reference} onChange={e => setReference(e.target.value)} />
              </div>
              
              <div className="co-input-group">
                <label>Comprobante (Captura)</label>
                <div className="co-file-upload">
                  <ImageIcon size={20} />
                  <span>Subir Imagen</span>
                  <input type="file" accept="image/*" onChange={(e) => setProofImage(e.target.files[0])} required />
                </div>
              </div>

              <div className="co-actions">
                <button type="button" className="co-btn-secondary" onClick={() => setStep(1)}>Atrás</button>
                <button type="submit" className="co-btn-primary">Continuar</button>
              </div>
            </form>
          </div>
        )}

        {step === 3 && (
          <div className="co-step-3 text-center">
            <Info size={48} className="co-info-icon" />
            <h2>Confirmar Compra</h2>
            <p className="co-confirm-text">
              Vas a comprar <strong>{item.name}</strong> por <strong>{selectedMethod.name}</strong>. ¿Estás de acuerdo?
            </p>
            
            <div className="co-actions">
              <button type="button" className="co-btn-secondary" onClick={() => setStep(2)}>Cancelar</button>
              <button type="button" className="co-btn-primary" onClick={handleConfirm} disabled={submitting}>
                {submitting ? 'Enviando...' : 'Sí, confirmar'}
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="co-step-4 text-center">
            <CheckCircle size={64} className="co-success-icon" />
            <h2>¡Pago Enviado!</h2>
            <p>Tiempo estimado de revisión: <strong>5 minutos</strong>.</p>
            <p className="co-redirect-text">Redirigiendo a la página principal...</p>
            <div className="co-spinner"></div>
          </div>
        )}

      </div>
    </div>
  );
}
