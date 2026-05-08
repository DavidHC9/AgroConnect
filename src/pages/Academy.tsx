import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import './Academy.css';
import { Search, Play, Clock, BarChart, BookOpen, GraduationCap, X } from 'lucide-react';

import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

interface Course {
  id: string;
  title: string;
  category: string;
  duration: string;
  level: string;
  description: string;
  instructor: string;
  thumbnail: string;
  user_id: string;
  content_link?: string;
}

const Academy: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Sostenibilidad',
    duration: '1h 00min',
    level: 'Básico',
    description: '',
    content_link: '',
  });

  const categories = ['Todos', 'Sostenibilidad', 'Técnico', 'Gestión', 'Tecnología'];

  const fetchCourses = async () => {
    setLoading(true);
    let { data, error } = await supabase
      .from('academy_courses')
      .select('*, profiles(first_name, last_name)')
      .order('created_at', { ascending: false });

    // Fallback if the database doesn't have the relationship linked correctly
    if (error) {
      console.warn("Relación con perfiles falló, intentando consulta simple:", error);
      const fallback = await supabase
        .from('academy_courses')
        .select('*')
        .order('created_at', { ascending: false });
      data = fallback.data;
      error = fallback.error;
    }

    if (!error && data) {
      const mapped = data.map((c: any) => ({
        id: c.id,
        user_id: c.user_id,
        title: c.title,
        category: c.category,
        duration: c.duration,
        level: c.level,
        description: c.description,
        content_link: c.content_url,
        instructor: c.profiles ? `${c.profiles.first_name || ''} ${c.profiles.last_name || ''}`.trim() || 'Experto' : 'Experto',
        thumbnail: c.thumbnail || 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=600'
      }));
      setCourses(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setPublishing(true);
    setError('');

    let finalContentUrl = formData.content_link;

    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('academy_files')
        .upload(filePath, file);

      if (uploadError) {
        setPublishing(false);
        setError(`Error al subir archivo (Crea un bucket "academy_files" público en Supabase): ${uploadError.message}`);
        return;
      }
      
      const { data: publicUrlData } = supabase.storage.from('academy_files').getPublicUrl(filePath);
      finalContentUrl = publicUrlData.publicUrl;
    }

    const randomThumbs = [
      'https://images.unsplash.com/photo-1599307767316-776533bb941c?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1454165833767-15d4a09cfac2?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1473415781819-175f5969533a?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c16?auto=format&fit=crop&q=80&w=600'
    ];

    const { error: insertError } = await supabase.from('academy_courses').insert({
      user_id: user.id,
      title: formData.title,
      category: formData.category,
      duration: formData.duration,
      level: formData.level,
      description: formData.description,
      content_url: finalContentUrl,
      thumbnail: randomThumbs[Math.floor(Math.random() * randomThumbs.length)]
    });

    setPublishing(false);

    if (insertError) {
      console.error(insertError);
      setError(`Error al publicar: ${insertError.message}`);
    } else {
      setIsModalOpen(false);
      setFile(null);
      setFormData({ title: '', category: 'Sostenibilidad', duration: '1h 00min', level: 'Básico', description: '', content_link: '' });
      fetchCourses();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar este contenido que publicaste?')) return;
    const { error } = await supabase.from('academy_courses').delete().eq('id', id);
    if (!error) {
      setCourses(courses.filter(c => c.id !== id));
    }
  };



  const filteredCourses = courses.filter(c => 
    (activeCategory === 'Todos' || c.category === activeCategory) &&
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="academy-wrapper">
      <Navbar />
      
      <section className="academy-hero">
        <GraduationCap size={48} style={{ marginBottom: '20px' }} />
        <h1>Academia Agro</h1>
        <p>Aprende las mejores técnicas, herramientas digitales y gestión de campo con expertos locales.</p>
      </section>

      <main className="academy-content">
        <section className="academy-filters">
          <div className="search-academy">
            <Search size={20} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="¿Qué quieres aprender hoy?" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="category-chips-academy">
            {categories.map(cat => (
              <button 
                key={cat}
                className={`course-category-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <button 
            className="publish-button" 
            onClick={() => setIsModalOpen(true)} 
            style={{marginLeft: 'auto', background: '#2e7d32', color: 'white', padding: '10px 20px', borderRadius: '12px', border: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', whiteSpace: 'nowrap'}}
          >
            <GraduationCap size={18} /> Compartir un Saber
          </button>
        </section>

        <section className="courses-grid">
          {loading ? (
             <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#666' }}>Cargando conocimientos...</div>
          ) : filteredCourses.length === 0 ? (
             <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#666' }}>No hay conocimiento compartido aún. ¡Sé el primero!</div>
          ) : (
          filteredCourses.map(course => (
            <div key={course.id} className="course-card">
              <div 
                className="course-thumbnail" 
                style={{ backgroundImage: `url(${course.thumbnail})` }}
              >
                <div className="play-overlay">
                  <Play size={48} color="white" fill="white" />
                </div>
                <span className="duration-tag">
                  <Clock size={14} style={{ marginRight: '4px' }} />
                  {course.duration}
                </span>
              </div>
              
              <div className="course-info">
                <div className="course-header-meta">
                  <span className="course-tag">{course.category}</span>
                  <span className="course-level">
                    <BarChart size={14} />
                    {course.level}
                  </span>
                </div>
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                
                <div className="course-footer">
                  <div className="instructor">
                    <div className="instructor-img"></div>
                    <span>{course.instructor}</span>
                  </div>
                  <button className="start-btn" onClick={() => setSelectedCourse(course)}>Comenzar</button>
                </div>
                {user && user.id === course.user_id && (
                  <button 
                    onClick={() => handleDelete(course.id)}
                    style={{ marginTop: '12px', width: '100%', padding: '8px', border: 'none', borderRadius: '8px', background: '#ffebee', color: '#c62828', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Eliminar mi publicación
                  </button>
                )}
              </div>
            </div>
          )))}
        </section>

        {/* Reproductor de Contenido Modal */}
        {selectedCourse && (
          <div className="modal-overlay" onClick={() => setSelectedCourse(null)} style={{ zIndex: 1000, background: 'rgba(0,0,0,0.85)' }}>
            <div className="modal-content" style={{ maxWidth: '900px', width: '95%', padding: 0, overflow: 'hidden', background: '#0f172a' }} onClick={e => e.stopPropagation()}>
              
              <div style={{ position: 'relative', width: '100%', minHeight: '150px', background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                 {/* Reproductor Dinámico o Documento */}
                 {selectedCourse.content_link && selectedCourse.content_link.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})/) ? (
                   <div style={{ width: '100%', paddingTop: '56.25%', position: 'relative' }}>
                     <iframe 
                       src={`https://www.youtube.com/embed/${selectedCourse.content_link.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})/)![1]}?autoplay=1`} 
                       title="YouTube player" 
                       frameBorder="0" 
                       allowFullScreen 
                       style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                     ></iframe>
                   </div>
                 ) : selectedCourse.content_link && selectedCourse.content_link.match(/\.(mp4|webm|ogg)$/i) ? (
                   <video 
                     src={selectedCourse.content_link} 
                     autoPlay controls 
                     style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                   ></video>
                 ) : selectedCourse.content_link ? (
                   <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                     <p style={{ color: 'white', marginBottom: '20px', fontSize: '1.2rem' }}>Este contenido incluye un documento o recurso externo adjunto.</p>
                     <a href={selectedCourse.content_link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: '#2563eb', color: 'white', padding: '14px 28px', borderRadius: '12px', textDecoration: 'none', fontWeight: 600, fontSize: '1.1rem' }}>
                       Abrir Archivo / Recurso
                     </a>
                   </div>
                 ) : (
                   <div style={{ padding: '80px 20px', textAlign: 'center', color: '#64748b' }}>
                     <BookOpen size={48} style={{ opacity: 0.5, marginBottom: '15px' }} />
                     <p>Este curso es de solo lectura. Revisa la descripción inferior.</p>
                   </div>
                 )}
                 
                <button 
                  onClick={() => setSelectedCourse(null)}
                  style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', borderRadius: '50%', padding: '8px', cursor: 'pointer', zIndex: 10 }}
                >
                  <X size={24} />
                </button>
              </div>

              <div style={{ padding: '30px', color: 'white' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                  <span style={{ background: 'rgba(46, 125, 50, 0.2)', color: '#4ade80', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600 }}>
                    {selectedCourse.category}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#94a3b8', fontSize: '14px' }}>
                    <Clock size={14} /> {selectedCourse.duration}
                  </span>
                </div>
                <h2 style={{ fontSize: '28px', marginBottom: '15px', fontWeight: 800 }}>{selectedCourse.title}</h2>
                <p style={{ color: '#cbd5e1', lineHeight: '1.7', fontSize: '16px', marginBottom: '25px' }}>
                  {selectedCourse.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', background: '#1e293b', borderRadius: '15px' }}>
                   <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#2e7d32', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {selectedCourse.instructor.charAt(0)}
                   </div>
                   <div>
                     <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Presentado por</p>
                     <p style={{ margin: 0, fontWeight: 'bold' }}>{selectedCourse.instructor}</p>
                   </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="publish-modal" style={{ padding: '30px', maxWidth: '500px', width: '90%' }} onClick={e => e.stopPropagation()}>
              <h2 style={{ marginBottom: '20px', color: '#1e293b' }}>Compartir Conocimiento</h2>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>Título *</label>
                  <input required placeholder="Ej: Cómo mejorar el riego..." value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>Categoría</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <option>Sostenibilidad</option><option>Técnico</option><option>Gestión</option><option>Tecnología</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '24px', marginBottom: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>Duración (Lectura/Video)</label>
                    <input value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} placeholder="Ej: 15min" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>Nivel</label>
                    <select value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                      <option>Básico</option><option>Intermedio</option><option>Avanzado</option>
                    </select>
                  </div>
                </div>
                <div>
                   <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Archivo de la Clase (Opcional)</label>
                   <div style={{ padding: '15px', border: '2px dashed #cbd5e1', borderRadius: '8px', background: '#f8fafc', textAlign: 'center', marginBottom: '10px' }}>
                     <input 
                       type="file" 
                       accept="video/mp4,video/webm,application/pdf"
                       onChange={e => setFile(e.target.files?.[0] || null)} 
                       style={{ width: '100%' }} 
                     />
                     <small style={{ display: 'block', color: '#64748b', marginTop: '5px' }}>Si subes un PDF o Video (.mp4), anulará el enlace escrito abajo.</small>
                   </div>
                   <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '14px' }}>O pega un Enlace de YouTube/Externo</label>
                  <input placeholder="Ej: https://youtube.com/watch?v=..." value={formData.content_link} onChange={e => setFormData({...formData, content_link: e.target.value})} disabled={!!file} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: file ? '#e2e8f0' : 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>Descripción / Resumen *</label>
                  <textarea required rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'none' }}></textarea>
                </div>
                {error && <div style={{ color: '#c62828', fontSize: '14px' }}>{error}</div>}
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '12px', background: '#f1f5f9', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
                  <button type="submit" disabled={publishing} style={{ flex: 1, padding: '12px', background: '#2e7d32', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>{publishing ? 'Publicando...' : 'Publicar'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Academy;
