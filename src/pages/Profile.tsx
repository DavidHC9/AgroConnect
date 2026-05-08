import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import './Profile.css';
import {
  User as UserIcon, Mail, Phone, MapPin, Award, Calendar, Edit2, Save,
  Camera, Briefcase, Star, CheckCircle, GraduationCap,
  Image as ImageIcon, Globe, Clock, ShieldCheck, ChevronRight,
  Users, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userData, setUserData] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    location: '',
    profileImage: '', // Default sin foto
    bio: '',
    skills: ['Agricultura'],
    experience: '1 año',
    completedJobs: 0,
    languages: ['Español (Nativo)'],
    availability: 'Disponible',
    certifications: [
      { id: 1, name: 'Técnico Agrícola', institution: 'SENA', year: '2023' }
    ],
    gallery: [] as string[],
    reviews: [] as { id: number; user: string; rating: number; date: string; comment: string; }[]
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data && !error) {
          setUserData(prev => ({
            ...prev,
            name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Sin Nombre',
            role: data.role === 'farmer' ? 'Agricultor / Productor' : data.role === 'buyer' ? 'Comprador' : 'Trabajador del Campo',
            email: user.email || '',
            phone: data.phone || '',
            // If you have more fields in supabase later, map them here:
            // location: data.location || prev.location
          }));
        } else if (user) {
          // Si no hay perfil pero hay usuario
          setUserData(prev => ({
            ...prev,
            email: user.email || ''
          }));
        }
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    setIsEditing(false);
    if (!user) return;

    // Split name back to first_name and last_name roughly
    const nameParts = userData.name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    await supabase.from('profiles').update({
      first_name: firstName,
      last_name: lastName,
      phone: userData.phone,
      // You could map additional fields here if added to schema
    }).eq('id', user.id);

    alert('Perfil actualizado guardado exitosamente.');
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData({ ...userData, profileImage: reader.result as string });
        // TODO: In a real app, upload file to Supabase Storage here and update profile
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return <div className="profile-wrapper"><Navbar /><main className="profile-content"><p>Cargando perfil...</p></main></div>;
  }

  return (
    <div className="profile-wrapper">
      <Navbar />
      <main className="profile-content">
        <header className="profile-header">
          <div className="profile-banner"></div>
          <div className="profile-info-main">
            <div className="profile-image-container">
              {userData.profileImage ? (
                <img src={userData.profileImage} alt="Profile" />
              ) : (
                <div className="default-avatar-placeholder">
                  <UserIcon size={80} />
                </div>
              )}
              <button className="change-photo-btn" onClick={handleImageClick}>
                <Camera size={18} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                style={{ display: 'none' }}
                accept="image/*"
              />
            </div>
            <div className="profile-title-section">
              <div className="name-edit-row">
                <h1>{userData.name}</h1>
                <button
                  className="edit-btn"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 size={18} /> Editar Perfil
                </button>
              </div>
              <p className="profile-role">{userData.role}</p>
              <div className="profile-stats">
                <div className="stat-item">
                  <Star size={16} />
                  <span>4.9 (28 reseñas)</span>
                </div>
                <div className="stat-item">
                  <Briefcase size={16} />
                  <span>{userData.completedJobs} labores completadas</span>
                </div>
                <div className="stat-item">
                  <ShieldCheck size={16} className="verified-icon" />
                  <span>Identidad Verificada</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="profile-grid">
          <section className="profile-sidebar">
            <div className="profile-card contact-info">
              <h3>Información de Contacto</h3>
              <div className="info-list">
                <div className="info-item">
                  <Mail size={18} />
                  <div>
                    <label>Correo</label>
                    <span>{userData.email}</span>
                  </div>
                </div>
                <div className="info-item">
                  <Phone size={18} />
                  <div>
                    <label>Teléfono</label>
                    <span>{userData.phone}</span>
                  </div>
                </div>
                <div className="info-item">
                  <MapPin size={18} />
                  <div>
                    <label>Ubicación</label>
                    <span>{userData.location || 'No especificada'}</span>
                  </div>
                </div>
                <div className="info-item">
                  <Clock size={18} />
                  <div>
                    <label>Disponibilidad</label>
                    <span>{userData.availability}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-card extra-info">
              <h3>Idiomas</h3>
              <div className="languages-list">
                {userData.languages.map(lang => (
                  <div key={lang} className="lang-item">
                    <Globe size={16} />
                    <span>{lang}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="profile-card badges-section">
              <h3>Logros y Badges</h3>
              <div className="badges-grid">
                <div className="badge-item" title="Experto en Cosecha">
                  <Award size={32} className="gold" />
                  <span>Oro</span>
                </div>
                <div className="badge-item" title="Colaborador Destacado">
                  <Users size={32} className="silver" />
                  <span>Plata</span>
                </div>
                <div className="badge-item" title="Sabio Local">
                  <GraduationCap size={32} className="bronze" />
                  <span>Bronce</span>
                </div>
              </div>
            </div>
          </section>

          <section className="profile-main">
            <div className="profile-card bio-section">
              <h3>Sobre mí</h3>
              <p>{userData.bio || 'Cuéntanos un poco sobre ti...'}</p>
            </div>

            <div className="profile-card skills-section">
              <h3>Habilidades Especializadas</h3>
              <div className="skills-container">
                {userData.skills.map((skill, index) => (
                  <span key={index} className="profile-skill-tag">{skill}</span>
                ))}
              </div>
            </div>

            <div className="profile-card certifications-section">
              <h3>Certificaciones y Formación</h3>
              <div className="cert-list">
                {userData.certifications.map(cert => (
                  <div key={cert.id} className="cert-item">
                    <div className="cert-icon">
                      <ShieldCheck size={24} />
                    </div>
                    <div className="cert-info">
                      <h4>{cert.name}</h4>
                      <p>{cert.institution} • {cert.year}</p>
                    </div>
                    <ChevronRight size={20} className="cert-arrow" />
                  </div>
                ))}
              </div>
            </div>

            <div className="profile-card gallery-section">
              <h3>Galería de Trabajo</h3>
              <div className="profile-gallery-grid">
                {userData.gallery.map((img, index) => (
                  <div key={index} className="gallery-img-wrapper">
                    <img src={img} alt={`Trabajo ${index + 1}`} />
                  </div>
                ))}
              </div>
            </div>

            <div className="profile-card reviews-section">
              <h3>Reseñas de Empleadores</h3>
              <div className="reviews-list">
                {userData.reviews.map(review => (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <div className="review-user-info">
                        <strong>{review.user}</strong>
                        <div className="review-rating">
                          {[...Array(review.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                        </div>
                      </div>
                      <span className="review-date">{review.date}</span>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {isEditing && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Editar Perfil</h2>
                <button className="modal-close-btn" onClick={() => setIsEditing(false)}>
                  <X size={24} />
                </button>
              </div>
              <div className="modal-body">
                <div>
                  <label>Nombre Completo</label>
                  <input type="text" value={userData.name} onChange={(e) => setUserData({ ...userData, name: e.target.value })} />
                </div>
                <div>
                  <label>Teléfono</label>
                  <input type="text" value={userData.phone} onChange={(e) => setUserData({ ...userData, phone: e.target.value })} />
                </div>
                <div>
                  <label>Ubicación</label>
                  <input type="text" value={userData.location} placeholder="Ej. Suesca, Cundinamarca" onChange={(e) => setUserData({ ...userData, location: e.target.value })} />
                </div>
                <div>
                  <label>Sobre mí</label>
                  <textarea value={userData.bio} placeholder="Cuéntanos un poco sobre ti..." onChange={(e) => setUserData({ ...userData, bio: e.target.value })} rows={4} />
                </div>
              </div>
              <div className="modal-footer">
                <button className="modal-cancel-btn" onClick={() => setIsEditing(false)}>Cancelar</button>
                <button className="modal-save-btn" onClick={handleSave}>Guardar Cambios</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;
