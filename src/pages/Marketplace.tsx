import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import PublishModal from '../components/PublishModal';
import './Marketplace.css';
import { Search, MapPin, ShoppingBag, Tag, MessageCircle, X, CheckCircle2, Phone, Loader, Trash2 } from 'lucide-react';
import type { Product } from '../types';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

const Marketplace: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [toast, setToast] = useState('');

  const categories = ['Todos', 'Tubérculos', 'Frutas', 'Café', 'Granos', 'Hortalizas'];

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select(`*, profiles (first_name, last_name, phone)`)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const mapped = data.map((p: any) => ({
        id: p.id,
        farmer_id: p.farmer_id,
        name: p.name,
        price: p.price,
        unit: p.unit,
        location: p.location,
        farmer: p.profiles
          ? `${p.profiles.first_name || ''} ${p.profiles.last_name || ''}`.trim() || 'Productor'
          : 'Productor',
        farmerPhone: p.profiles?.phone || '',
        image: p.image || 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=400',
        category: p.category,
        freshness: p.freshness || 'Recién publicado',
        description: p.description,
        quantity: p.quantity,
      }));
      setProducts(mapped);
    }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (productId: number) => {
    if (!confirm('¿Seguro que quieres eliminar este producto?')) return;

    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (!error) {
      setProducts(products.filter(p => p.id !== productId));
      if (selectedProduct?.id === productId) setSelectedProduct(null);
      setToast('Producto eliminado.');
      setTimeout(() => setToast(''), 3000);
    }
  };

  const filteredProducts = products.filter(p =>
    (activeCategory === 'Todos' || p.category === activeCategory) &&
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="marketplace-wrapper">
      <Navbar />
      <main className="marketplace-content">

        {toast && (
          <div className="job-toast" style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', background: '#2e7d32', color: 'white', padding: '12px 24px', borderRadius: '12px', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={20} /> {toast}
          </div>
        )}

        <header className="marketplace-header">
          <div className="header-info">
            <h1>Venta Directa del Campo</h1>
            <p>Compre directamente al productor. Sin intermediarios, mejor precio.</p>
          </div>
          <button className="publish-button" onClick={() => setIsPublishModalOpen(true)}>
            <ShoppingBag size={20} /> Publicar mi Cosecha
          </button>
        </header>

        <section className="search-filters">
          <div className="search-bar">
            <Search size={20} />
            <input
              type="text"
              placeholder="Buscar productos (ej. Papa, Café...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="category-scroll">
            {categories.map(cat => (
              <button
                key={cat}
                className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', flexDirection: 'column', gap: '16px' }}>
            <Loader size={40} color="#2e7d32" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#666' }}>Cargando productos del campo...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
            <ShoppingBag size={60} style={{ opacity: 0.3, marginBottom: '16px' }} />
            <h3 style={{ marginBottom: '8px' }}>No hay productos publicados aún</h3>
            <p>¡Sé el primero en publicar tu cosecha!</p>
          </div>
        ) : (
          <section className="products-grid">
            {filteredProducts.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image" style={{ backgroundImage: `url(${product.image})` }}>
                  <span className="fresh-badge">{product.freshness}</span>
                  <span className="category-tag">{product.category}</span>
                  {/* Botón eliminar solo si es tuyo */}
                  {user && (product as any).farmer_id === user.id && (
                    <button
                      onClick={() => handleDelete(product.id)}
                      title="Eliminar producto"
                      style={{
                        position: 'absolute', top: '8px', right: '8px',
                        background: '#c62828', border: 'none', borderRadius: '8px',
                        padding: '6px 10px', cursor: 'pointer', color: 'white',
                        display: 'flex', alignItems: 'center', gap: '4px',
                        fontSize: '12px', fontWeight: 600
                      }}
                    >
                      <Trash2 size={14} /> Eliminar
                    </button>
                  )}
                </div>

                <div className="product-details">
                  <div className="price-tag">
                    <Tag size={16} />
                    <span>${product.price} / {product.unit}</span>
                  </div>
                  <h3>{product.name}</h3>
                  <div className="farmer-meta">
                    <span className="farmer-name">Producido por: {product.farmer}</span>
                    <div className="location">
                      <MapPin size={14} />
                      <span>{product.location}</span>
                    </div>
                  </div>
                  <div className="product-actions">
                    <a
                      href={`https://wa.me/57${(product as any).farmerPhone?.replace(/\s+/g, '').replace(/[^0-9]/g, '')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="whatsapp-button"
                      style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <MessageCircle size={18} /> WhatsApp
                    </a>
                    <button className="view-more" onClick={() => setSelectedProduct(product)}>Ver Detalle</button>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Modal Detalle */}
        {selectedProduct && (
          <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-modal" onClick={() => setSelectedProduct(null)}>
                <X size={24} />
              </button>
              <div className="modal-grid">
                <div className="modal-image" style={{ backgroundImage: `url(${selectedProduct.image})` }}></div>
                <div className="modal-info">
                  <div className="modal-header">
                    <span className="modal-category">{selectedProduct.category}</span>
                    <h2>{selectedProduct.name}</h2>
                    <div className="modal-price">
                      <Tag size={20} />
                      <span>${selectedProduct.price} / {selectedProduct.unit}</span>
                    </div>
                  </div>
                  <div className="modal-description">
                    <h3>Descripción</h3>
                    <p>{selectedProduct.description}</p>
                    <div className="availability">
                      <CheckCircle2 size={18} color="#2e7d32" />
                      <span>{selectedProduct.quantity}</span>
                    </div>
                  </div>
                  <div className="modal-farmer">
                    <h3>Productor</h3>
                    <p><strong>{selectedProduct.farmer}</strong></p>
                    <p className="modal-location"><MapPin size={16} /> {selectedProduct.location}</p>
                  </div>
                  <div className="modal-actions">
                    <a
                      href={`https://wa.me/57${(selectedProduct as any).farmerPhone?.replace(/\s+/g, '').replace(/[^0-9]/g, '')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="modal-whatsapp"
                      style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <MessageCircle size={20} /> Contactar por WhatsApp
                    </a>
                    <a
                      href={`tel:${(selectedProduct as any).farmerPhone}`}
                      className="modal-call"
                      style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <Phone size={20} /> Llamar ahora
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <PublishModal
          isOpen={isPublishModalOpen}
          onClose={() => setIsPublishModalOpen(false)}
          onPublish={() => { setIsPublishModalOpen(false); fetchProducts(); }}
        />
      </main>
    </div>
  );
};

export default Marketplace;