import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import './JobMatching.css';
import { Search, MapPin, Briefcase, Filter, User, CheckCircle, Zap, Plus, X, Trash2, Loader } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

interface JobItem {
  id: string;
  user_id: string;
  title: string;
  name: string;
  location: string;
  skills: string[];
  type: string;
  urgent: boolean;
  category: 'job' | 'worker';
  applied?: boolean;
}

const JobMatching: React.FC = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<'seeker' | 'employer'>('seeker');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [items, setItems] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    name: '',
    location: '',
    skills: '',
    type: 'Tiempo Completo',
    urgent: false,
  });

  const fetchListings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('job_listings')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setItems(data as JobItem[]);
    setLoading(false);
  };

  useEffect(() => { fetchListings(); }, []);

  const filteredItems = items.filter(item => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = role === 'seeker' ? item.category === 'job' : item.category === 'worker';
    return matchesSearch && matchesRole;
  });

  const handleApply = (id: string) => {
    setItems(items.map(item => item.id === id ? { ...item, applied: true } : item));
    setToastMsg('¡Postulación enviada con éxito!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar esta publicación?')) return;

    const { error } = await supabase.from('job_listings').delete().eq('id', id);
    if (!error) {
      setItems(items.filter(item => item.id !== id));
      setToastMsg('Publicación eliminada.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setPublishing(true);
    setError('');

    const { error } = await supabase.from('job_listings').insert({
      user_id: user.id,
      title: formData.title,
      name: formData.name,
      location: formData.location,
      skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
      type: formData.type,
      urgent: formData.urgent,
      category: role === 'seeker' ? 'worker' : 'job',
    });

    setPublishing(false);

    if (error) {
      console.error(error);
      setError(`Error: ${error.message || JSON.stringify(error)}`);
    } else {
      setIsModalOpen(false);
      setFormData({ title: '', name: '', location: '', skills: '', type: 'Tiempo Completo', urgent: false });
      fetchListings();
      setToastMsg(role === 'seeker' ? '¡Perfil publicado!' : '¡Vacante publicada!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <div className="jobs-wrapper">
      <Navbar />
      <main className="jobs-content">

        {showToast && (
          <div className="job-toast">
            <CheckCircle size={20} />
            <span>{toastMsg}</span>
          </div>
        )}

        <header className="jobs-header">
          <div className="header-info">
            <h1>Emparejamiento Laboral Rural</h1>
            <p>Conectamos talento local con las necesidades del campo.</p>
          </div>
          <div className="header-actions-jobs">
            <div className="role-selector">
              <button className={role === 'seeker' ? 'active' : ''} onClick={() => setRole('seeker')}>
                Busco Trabajo
              </button>
              <button className={role === 'employer' ? 'active' : ''} onClick={() => setRole('employer')}>
                Busco Talento
              </button>
            </div>
            <button className="publish-job-btn" onClick={() => setIsModalOpen(true)}>
              <Plus size={20} /> {role === 'seeker' ? 'Publicar mi Perfil' : 'Publicar Vacante'}
            </button>
          </div>
        </header>

        <section className="search-section">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder={role === 'seeker' ? 'Busca empleos o habilidades...' : 'Busca trabajadores o técnicos...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="filter-btn"><Filter size={18} /> Filtros</button>
        </section>

        <section className="jobs-list">
          <div className="list-info">
            <h2>{role === 'seeker' ? 'Oportunidades para ti' : 'Talento disponible cerca'}</h2>
            <span>Basado en tu ubicación y habilidades</span>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', flexDirection: 'column', gap: '16px' }}>
              <Loader size={40} color="#2e7d32" style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ color: '#666' }}>Cargando publicaciones...</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : filteredItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
              <Briefcase size={60} style={{ opacity: 0.3, marginBottom: '16px' }} />
              <h3 style={{ marginBottom: '8px' }}>No hay publicaciones aún</h3>
              <p>¡Sé el primero en publicar {role === 'seeker' ? 'una vacante' : 'tu perfil'}!</p>
            </div>
          ) : (
            <div className="cards-grid">
              {filteredItems.map(item => (
                <div key={item.id} className={`job-card ${item.urgent ? 'urgent' : ''} ${item.applied ? 'applied-card' : ''}`}>

                  <div className="card-header">
                    <div className="match-badge">
                      <Zap size={14} />
                      <span>Disponible</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {item.urgent && <span className="urgent-tag">Urgente</span>}
                      {/* Botón eliminar solo si es tuya */}
                      {user && item.user_id === user.id && (
                        <button
                          onClick={() => handleDelete(item.id)}
                          title="Eliminar publicación"
                          style={{
                            background: '#ffebee', border: 'none', borderRadius: '6px',
                            padding: '4px 8px', cursor: 'pointer', color: '#c62828',
                            display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px'
                          }}
                        >
                          <Trash2 size={14} /> Eliminar
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="card-body">
                    <h3>{item.title}</h3>
                    <div className="entity-name">
                      {item.category === 'job' ? <Briefcase size={16} /> : <User size={16} />}
                      <span>{item.name}</span>
                    </div>
                    <div className="location">
                      <MapPin size={16} />
                      <span>{item.location}</span>
                    </div>
                    <div className="skills-tags">
                      {item.skills.map(skill => (
                        <span key={skill} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>

                  <div className="card-footer">
                    <span className="job-type">{item.type}</span>
                    {user && item.user_id !== user.id && (
                      <button
                        className={`apply-button ${item.applied ? 'applied' : ''}`}
                        onClick={() => item.category === 'job' && handleApply(item.id)}
                        disabled={item.applied}
                      >
                        {role === 'seeker'
                          ? (item.applied ? 'Postulado ✓' : 'Postularme')
                          : 'Ver Perfil'}
                        <CheckCircle size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Modal de Publicación */}
        {isModalOpen && (
          <div className="jobs-modal-overlay">
            <div className="jobs-modal">
              <div className="modal-header-jobs">
                <h3>{role === 'seeker' ? 'Publicar mi Perfil Laboral' : 'Publicar Nueva Vacante'}</h3>
                <button className="close-jobs-modal" onClick={() => setIsModalOpen(false)}>
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="jobs-form">
                <div className="form-group-jobs">
                  <label>{role === 'seeker' ? 'Título de tu Especialidad' : 'Título de la Vacante'}</label>
                  <input
                    type="text"
                    placeholder={role === 'seeker' ? 'Ej: Recolector experto, Operador...' : 'Ej: Mayordomo, Veterinario...'}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group-jobs">
                  <label>{role === 'seeker' ? 'Tu Nombre Completo' : 'Nombre de la Finca / Empresa'}</label>
                  <input
                    type="text"
                    placeholder="Ej: Hacienda Los Olivos"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-row-jobs">
                  <div className="form-group-jobs">
                    <label>Ubicación</label>
                    <input
                      type="text"
                      placeholder="Ej: Suesca, Cundinamarca"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group-jobs">
                    <label>Tipo de Contrato</label>
                    <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                      <option value="Tiempo Completo">Tiempo Completo</option>
                      <option value="Por Labor / Jornal">Por Labor / Jornal</option>
                      <option value="Temporada">Temporada</option>
                    </select>
                  </div>
                </div>
                <div className="form-group-jobs">
                  <label>Habilidades (separadas por coma)</label>
                  <input
                    type="text"
                    placeholder="Ej: Riego, Manejo de animales, Cosecha"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group-jobs checkbox-group">
                  <input
                    type="checkbox"
                    id="urgent"
                    checked={formData.urgent}
                    onChange={(e) => setFormData({ ...formData, urgent: e.target.checked })}
                  />
                  <label htmlFor="urgent">Marcar como urgente</label>
                </div>

                {error && (
                  <div style={{ background: '#ffebee', color: '#c62828', padding: '10px 14px', borderRadius: '8px', fontSize: '14px' }}>
                    {error}
                  </div>
                )}

                <button type="submit" className="submit-jobs-btn" disabled={publishing}>
                  {publishing ? 'Publicando...' : (role === 'seeker' ? 'Publicar mi Perfil' : 'Publicar Vacante Ahora')}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default JobMatching;