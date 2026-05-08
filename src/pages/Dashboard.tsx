import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Dashboard.css';
import { 
  Users, Store, ArrowRight, TrendingUp, BookOpen, GraduationCap, CloudSun, Bell, 
  CheckCircle2, Clock, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userName, setUserName] = useState('Usuario');
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [weatherData, setWeatherData] = useState({
    temp: 0,
    description: '',
    city: '',
    humidity: 0,
    rainProb: 0,
    loading: true,
  });

  const [marketPrices, setMarketPrices] = useState<any[]>([]);
  const [loadingMarket, setLoadingMarket] = useState(true);

  const getWeatherDesc = (code: number) => {
    if (code === 0) return 'Despejado';
    if (code === 1 || code === 2 || code === 3) return 'Poco nublado';
    if (code === 45 || code === 48) return 'Niebla';
    if (code >= 51 && code <= 55) return 'Llovizna';
    if (code >= 61 && code <= 65) return 'Lluvia';
    if (code >= 80 && code <= 82) return 'Chubascos';
    if (code >= 95) return 'Tormenta';
    return 'Nublado';
  };

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('¡Buenos días!');
    else if (hour < 18) setGreeting('¡Buenas tardes!');
    else setGreeting('¡Buenas noches!');

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Fetch User Name
    const fetchUserName = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('id', user.id)
          .single();
        if (data && !error && data.first_name) {
          setUserName(data.first_name);
        }
      }
    };
    fetchUserName();

    // Fetch Market Prices
    const fetchMarketPrices = async () => {
      setLoadingMarket(true);
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, unit')
        .order('created_at', { ascending: false })
        .limit(3);
        
      if (data && !error) {
        setMarketPrices(data);
      }
      setLoadingMarket(false);
    };
    fetchMarketPrices();
    
    // Fetch Real Weather
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=es`);
        const geoData = await geoRes.json();
        const city = geoData.locality || geoData.city || 'Tu ubicación';

        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&hourly=precipitation_probability&timezone=auto`);
        const weatherJson = await weatherRes.json();
        
        const current = weatherJson.current;
        setWeatherData({
          temp: Math.round(current.temperature_2m),
          description: getWeatherDesc(current.weather_code),
          city: city,
          humidity: current.relative_humidity_2m,
          rainProb: weatherJson.hourly.precipitation_probability[new Date().getHours()] || 0,
          loading: false,
        });
      } catch (error) {
        setWeatherData(prev => ({ ...prev, loading: false }));
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(5.02, -73.80) // Default to approx Suesca on error
      );
    } else {
      fetchWeather(5.02, -73.80);
    }

    return () => {
      clearInterval(timer);
    };
  }, []);

  const formattedDate = currentTime.toLocaleDateString('es-ES', { 
    weekday: 'long', day: 'numeric', month: 'long' 
  });

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <main className="dashboard-content">
        
        {/* Top bar con Info Contextual */}
        <section className="dashboard-top-bar">
          <div className="welcome-section">
            <span className="current-date">{formattedDate}</span>
            <h1>{greeting}, {userName}</h1>
            <p>Este es el estado actual de tu actividad en el campo.</p>
          </div>
          <div className="weather-widget">
            <div className="weather-info">
              <CloudSun size={32} />
              <div>
                <strong>{weatherData.loading ? '--' : weatherData.temp}°C</strong>
                <span>{weatherData.loading ? 'Cargando...' : `${weatherData.city}, ${weatherData.description}`}</span>
              </div>
            </div>
            <div className="weather-extra">
              <span>Humedad: {weatherData.loading ? '--' : weatherData.humidity}%</span>
              <span>Lluvia: {weatherData.loading ? '--' : weatherData.rainProb}%</span>
            </div>
          </div>
        </section>

        <div className="dashboard-main-grid">
          
          {/* Columna Principal - Acciones */}
          <div className="main-actions-column">
            <div className="section-title">
              <Zap size={20} />
              <h2>Accesos Rápidos</h2>
            </div>
            
            <div className="actions-grid-modern">
              <div className="action-card" onClick={() => navigate('/jobs')}>
                <div className="action-card-image">
                  <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=400" alt="Empleo" />
                  <div className="action-icon-float"><Users size={20} /></div>
                </div>
                <div className="action-card-body">
                  <h3>Emparejamiento Laboral</h3>
                  <p>Encuentra las mejores vacantes en el campo.</p>
                  <div className="action-card-footer">
                    <span className="action-badge jobs">Oportunidades</span>
                    <ArrowRight size={18} className="arrow-icon" />
                  </div>
                </div>
              </div>

              <div className="action-card" onClick={() => navigate('/marketplace')}>
                <div className="action-card-image">
                  <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400" alt="Venta Directa" />
                  <div className="action-icon-float"><Store size={20} /></div>
                </div>
                <div className="action-card-body">
                  <h3>Venta Directa</h3>
                  <p>Vende tus productos sin intermediarios.</p>
                  <div className="action-card-footer">
                    <span className="action-badge market">Comercio</span>
                    <ArrowRight size={18} className="arrow-icon" />
                  </div>
                </div>
              </div>

              <div className="action-card" onClick={() => navigate('/field-book')}>
                <div className="action-card-image">
                  <img src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=400" alt="Gestión" />
                  <div className="action-icon-float"><BookOpen size={20} /></div>
                </div>
                <div className="action-card-body">
                  <h3>Gestión de Finca</h3>
                  <p>Lleva el control total de tus cultivos.</p>
                  <div className="action-card-footer">
                    <span className="action-badge field">Gestión</span>
                    <ArrowRight size={18} className="arrow-icon" />
                  </div>
                </div>
              </div>

              <div className="action-card" onClick={() => navigate('/academy')}>
                <div className="action-card-image">
                  <img src="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=400" alt="Academia" />
                  <div className="action-icon-float"><GraduationCap size={20} /></div>
                </div>
                <div className="action-card-body">
                  <h3>Academia Agro</h3>
                  <p>Capacítate con expertos del sector.</p>
                  <div className="action-card-footer">
                    <span className="action-badge academy">Formación</span>
                    <ArrowRight size={18} className="arrow-icon" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Lateral - Notificaciones y Mercado */}
          <aside className="dashboard-sidebar">
            <div className="sidebar-section">
              <div className="section-header">
                <h3>Actividad Reciente</h3>
                <Bell size={18} />
              </div>
              <div className="notifications-list">
                <div className="notification-item">
                  <div className="n-icon blue"><CheckCircle2 size={16} /></div>
                  <div className="n-text">
                    <strong>Postulación Aceptada</strong>
                    <span>Hacienda La Esperanza</span>
                    <small>hace 2 horas</small>
                  </div>
                </div>
                <div className="notification-item">
                  <div className="n-icon green"><Zap size={16} /></div>
                  <div className="n-text">
                    <strong>Precio en Alza</strong>
                    <span>El Café subió un 5% hoy</span>
                    <small>hace 5 horas</small>
                  </div>
                </div>
                <div className="notification-item">
                  <div className="n-icon orange"><Clock size={16} /></div>
                  <div className="n-text">
                    <strong>Recordatorio</strong>
                    <span>Fertilización de lote 3</span>
                    <small>Mañana, 7:00 AM</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="sidebar-section market-monitor">
              <div className="section-header">
                <h3>Monitor de Mercado</h3>
                <TrendingUp size={18} />
              </div>
              <div className="market-prices">
                {loadingMarket ? (
                  <div style={{ textAlign: 'center', padding: '10px 0', color: '#666' }}>Cargando datos...</div>
                ) : marketPrices.length > 0 ? (
                  marketPrices.map(item => (
                    <div className="price-row" key={item.id}>
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }} title={item.name}>{item.name}</span>
                      <strong>${Number(item.price).toLocaleString()} / {item.unit}</strong>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '15px 0', color: '#888', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span>Aún no hay productos publicados.</span>
                    <button 
                      onClick={() => navigate('/marketplace')}
                      style={{ 
                        background: 'transparent', 
                        border: '1px solid #2e7d32', 
                        color: '#2e7d32', 
                        padding: '4px 8px', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                      Publicar ahora
                    </button>
                  </div>
                )}
              </div>
              <button className="full-market-btn" onClick={() => navigate('/marketplace')}>
                Ver todos los precios
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
