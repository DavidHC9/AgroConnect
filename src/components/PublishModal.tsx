import React, { useState, useRef } from 'react';
import './PublishModal.css';
import { X, Camera, Plus, CheckCircle2, MapPin, ArrowLeft, Image as ImageIcon, Trash2 } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: () => void; // Solo notifica que se publicó, ya no recibe el producto
}

const PublishModal: React.FC<PublishModalProps> = ({ isOpen, onClose, onPublish }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: 'Tubérculos',
    price: '',
    unit: 'Kilo',
    quantity: '',
    description: '',
    location: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const categories = ['Tubérculos', 'Frutas', 'Café', 'Granos', 'Hortalizas'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { setError('Debes iniciar sesión para publicar.'); return; }

    setLoading(true);
    setError('');

    let imageUrl = 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=400';

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        setError(`Error al subir imagen: ${uploadError.message}. Asegúrate de que el bucket 'product-images' exista y sea público.`);
        setLoading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);
      
      imageUrl = publicUrl;
    }

    const { error: insertError } = await supabase.from('products').insert({
      name: formData.name,
      price: formData.price,
      unit: formData.unit,
      location: formData.location,
      farmer_id: user.id,
      image: imageUrl,
      category: formData.category,
      freshness: 'Recién publicado',
      description: formData.description,
      quantity: `${formData.quantity} ${formData.unit} disponibles`,
    });

    setLoading(false);

    if (insertError) {
      setError('Error al publicar. Intenta de nuevo.');
      console.error(insertError);
    } else {
      resetForm();
      onPublish(); // Notifica al Marketplace para recargar
    }
  };

  const resetForm = () => {
    setStep(1);
    setError('');
    setFormData({
      name: '', category: 'Tubérculos', price: '',
      unit: 'Kilo', quantity: '', description: '', location: '',
    });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="publish-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="publish-modal-sidebar">
          <div className="sidebar-content">
            <div className="sidebar-logo">
              <CheckCircle2 size={32} />
              <span>AgroConnect</span>
            </div>
            <div className="step-indicator">
              <div className={`step-item ${step >= 1 ? 'active' : ''}`}>
                <div className="step-number">1</div>
                <div className="step-label">Información Básica</div>
              </div>
              <div className={`step-item ${step >= 2 ? 'active' : ''}`}>
                <div className="step-number">2</div>
                <div className="step-label">Precio y Logística</div>
              </div>
              <div className={`step-item ${step >= 3 ? 'active' : ''}`}>
                <div className="step-number">3</div>
                <div className="step-label">Confirmación</div>
              </div>
            </div>
          </div>
          <div className="sidebar-footer">
            <p>Tu cosecha llegará a miles de compradores directos.</p>
          </div>
        </div>

        <div className="publish-modal-main">
          <button className="close-publish-modal" onClick={handleClose}>
            <X size={24} />
          </button>

          <form onSubmit={handleSubmit} className="publish-step-form">
            {step === 1 && (
              <div className="form-step animate-in">
                <header>
                  <h2>¿Qué estás cosechando hoy?</h2>
                  <p>Cuéntanos los detalles principales de tu producto.</p>
                </header>

                <div 
                  className={`photo-dropzone ${imagePreview ? 'has-image' : ''}`}
                  onClick={handleFileClick}
                  style={{ cursor: 'pointer' }}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  {imagePreview ? (
                    <div className="preview-container">
                      <img src={imagePreview} alt="Preview" className="image-preview" />
                      <div className="preview-overlay">
                        <ImageIcon size={24} />
                        <span>Cambiar foto</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Camera size={40} />
                      <span>Subir una foto real aumenta tus ventas en un 40%</span>
                    </>
                  )}
                </div>

                <div className="form-group">
                  <label>Nombre del Producto</label>
                  <input
                    type="text"
                    placeholder="Ej: Papa Sabanera Lavada"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Categoría</label>
                  <div className="category-chips">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        className={`chip ${formData.category === cat ? 'selected' : ''}`}
                        onClick={() => setFormData({ ...formData, category: cat })}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="modal-footer-btns">
                  <button type="button" className="btn-next"
                    onClick={() => { if (!formData.name) return; setStep(2); }}>
                    Siguiente paso <Plus size={20} />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="form-step animate-in">
                <header>
                  <h2>Precio y Disponibilidad</h2>
                  <p>Define cuánto quieres recibir por tu trabajo.</p>
                </header>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Precio Unitario ($)</label>
                    <input
                      type="number"
                      placeholder="Ej: 45000"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Unidad</label>
                    <select value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}>
                      <option value="Kilo">Kilo</option>
                      <option value="Bulto">Bulto</option>
                      <option value="Arroba">Arroba</option>
                      <option value="Libra">Libra</option>
                      <option value="Unidad">Unidad</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Cantidad Disponible</label>
                  <input
                    type="text"
                    placeholder="Ej: 25"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Ubicación de Recogida</label>
                  <div className="input-with-icon">
                    <MapPin size={18} />
                    <input
                      type="text"
                      placeholder="Ej: Suesca, Cundinamarca"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer-btns">
                  <button type="button" className="btn-back" onClick={() => setStep(1)}>
                    <ArrowLeft size={20} /> Atrás
                  </button>
                  <button type="button" className="btn-next" onClick={() => setStep(3)}>
                    Continuar
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="form-step animate-in">
                <header>
                  <h2>Casi listo</h2>
                  <p>Añade una descripción final y confirma los datos.</p>
                </header>

                <div className="form-group">
                  <label>Descripción para el Comprador</label>
                  <textarea
                    rows={4}
                    placeholder="Ej: Papa criolla recién cosechada, sin químicos, tamaño uniforme..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div className="publish-summary">
                  <div className="summary-item">
                    <span>Producto:</span>
                    <strong>{formData.name}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Precio:</span>
                    <strong>${formData.price} / {formData.unit}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Cantidad:</span>
                    <strong>{formData.quantity} {formData.unit}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Ubicación:</span>
                    <strong>{formData.location}</strong>
                  </div>
                </div>

                {error && (
                  <div style={{
                    background: '#ffebee', color: '#c62828',
                    padding: '10px 14px', borderRadius: '8px', fontSize: '14px'
                  }}>
                    {error}
                  </div>
                )}

                <div className="modal-footer-btns">
                  <button type="button" className="btn-back" onClick={() => setStep(2)}>
                    Atrás
                  </button>
                  <button type="submit" className="btn-finish" disabled={loading}>
                    {loading ? 'Publicando...' : <> Publicar mi Cosecha <CheckCircle2 size={20} /></>}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default PublishModal;