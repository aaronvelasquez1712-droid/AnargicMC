"use client";
import { useState, useEffect } from "react";
import { Star, Crown, Package, Sword, Zap, Check } from "lucide-react";
import { supabase } from "@/utils/supabase";
import CheckoutModal from "@/components/CheckoutModal";
import "./tienda-movil.css";

export default function MovilTiendaPage() {
  const [activeTab, setActiveTab] = useState("rangos");
  const [items, setItems] = useState([]);
  const [cosmetics, setCosmetics] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Checkout Modal State
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      // Intentar cargar de store_items
      const { data, error } = await supabase
        .from("store_items")
        .select(`*, store_categories(name)`)
        .eq("is_active", true);

      if (data && data.length > 0) {
        setItems(data);
      } else {
        // Fallback for demonstration while DB is empty
        setItems([
          { id: '1', name: 'MVP', category_name: 'rangos', price: 9.99, currency: 'USD', period: '/mes', color: '#8b5cf6', is_popular: true, features: ['Prefijo MVP', 'Volar en Lobby'] },
          { id: '2', name: 'Kit Diamante', category_name: 'kits', price: 5.00, currency: 'USD', color: '#2dd4bf', is_popular: false, features: ['Armadura Full Diamante'] },
          { id: '3', name: 'Marco Fuego', category_name: 'cosmeticos', price: 2.00, currency: 'USD', color: '#ef4444', is_popular: false, features: ['Efecto en el perfil'] }
        ]);
      }

      // Cargar cosméticos de la tabla original cosmetics
      const { data: cosmData } = await supabase
        .from("cosmetics")
        .select("*")
        .eq("source", "TIENDA");

      if (cosmData && cosmData.length > 0) {
        setCosmetics(cosmData);
      } else {
        setCosmetics([
          { id: '3', name: 'Marco Fuego', type: 'FRAME', price_usd: 2.00, color: '#ef4444' }
        ]);
      }

      setLoading(false);
    };
    fetchItems();
  }, []);

  const handleBuy = (item) => {
    setSelectedItem(item);
  };

  const getFilteredItems = (categoryName) => {
    // Handling fallback objects vs supabase objects
    return items.filter(item => {
      const cat = item.store_categories?.name || item.category_name;
      return cat === categoryName;
    });
  };

  const rangos = getFilteredItems("rangos");
  const kits = getFilteredItems("kits");

  return (
    <div className="movil-tienda-container animate-fade-in">
      <div className="m-tienda-header">
        <h1>Tienda Oficial</h1>
        <p>Potencia tu aventura en AnargicMC</p>
      </div>

      <div className="m-category-pills">
        <button className={`m-pill ${activeTab === "rangos" ? "active" : ""}`} onClick={() => setActiveTab("rangos")}>
          <Crown size={16} /> Rangos
        </button>
        <button className={`m-pill ${activeTab === "kits" ? "active" : ""}`} onClick={() => setActiveTab("kits")}>
          <Package size={16} /> Kits
        </button>
        <button className={`m-pill ${activeTab === "cosmeticos" ? "active" : ""}`} onClick={() => setActiveTab("cosmeticos")}>
          <Star size={16} /> Cosméticos
        </button>
      </div>

      <div className="m-tienda-content">
        {loading ? (
          <div className="m-loading">Cargando artículos...</div>
        ) : (
          <>
            {activeTab === "rangos" && (
              <div className="m-items-list">
                {rangos.length === 0 && <div className="m-empty-state">No hay rangos disponibles.</div>}
                {rangos.map(plan => (
                  <div key={plan.id} className="m-plan-card" style={{ '--plan-color': plan.color || '#3b82f6' }}>
                    {plan.is_popular && <div className="m-popular-badge"><Star size={12}/> Popular</div>}
                    
                    <div className="m-plan-header">
                      <h2>{plan.name}</h2>
                      <div className="m-plan-price">
                        <span className="price">{plan.price}</span>
                        <span className="period">{plan.period || ' USD'}</span>
                      </div>
                    </div>
                    
                    <div className="m-plan-features">
                      {plan.features && plan.features.map((feature, i) => (
                        <div key={i} className="m-feature-row">
                          <Check size={16} className="m-check" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <button className="m-buy-btn" style={{ background: plan.color || '#3b82f6' }} onClick={() => handleBuy(plan)}>
                      Comprar {plan.name}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "kits" && (
              <div className="m-items-list">
                {kits.length === 0 && <div className="m-empty-state">No hay kits disponibles.</div>}
                {kits.map(kitItem => (
                  <div key={kitItem.id} className="m-key-card" style={{ '--key-color': kitItem.color || '#10b981' }}>
                    {kitItem.is_popular && <div className="m-popular-badge"><Star size={12}/> Más vendido</div>}
                    <div className="m-key-left">
                      <div className="m-key-icon-wrapper">
                        <Package size={24} color={kitItem.color || '#10b981'} />
                      </div>
                      <div className="m-key-info">
                        <h3>{kitItem.name}</h3>
                        <span className="m-key-price">{kitItem.price} {kitItem.currency || 'USD'}</span>
                      </div>
                    </div>
                    <button className="m-add-btn" onClick={() => handleBuy(kitItem)}>
                      Comprar
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "cosmeticos" && (
              <div className="m-items-list">
                {cosmetics.length === 0 && <div className="m-empty-state">No hay cosméticos en la tienda.</div>}
                {cosmetics.map(cosItem => (
                  <div key={cosItem.id} className="m-key-card" style={{ '--key-color': cosItem.color || '#eab308' }}>
                    <div className="m-key-left">
                      <div className="m-key-icon-wrapper">
                        {cosItem.image_url ? (
                          <img src={cosItem.image_url} alt={cosItem.name} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                        ) : (
                          <Star size={24} color={cosItem.color || '#eab308'} />
                        )}
                      </div>
                      <div className="m-key-info">
                        <h3>{cosItem.name}</h3>
                        <span className="m-key-price">{cosItem.price_usd} USD</span>
                      </div>
                    </div>
                    <button className="m-add-btn" onClick={() => handleBuy({ ...cosItem, price: cosItem.price_usd, currency: 'USD' })}>
                      Comprar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {selectedItem && (
        <CheckoutModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
}
