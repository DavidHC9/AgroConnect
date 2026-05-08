import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';
import { Leaf, User, Phone, Mail, Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '../services/supabase';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'farmer' as 'farmer' | 'buyer' | 'worker',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    // Determinar el email a usar según el método elegido
    let email = '';
    if (method === 'email') {
      if (!formData.email) { setError('Ingresa un correo válido.'); return; }
      email = formData.email.trim();
    } else {
      const phoneClean = formData.phone.replace(/\s+/g, '').replace(/[^0-9]/g, '');
      if (phoneClean.length < 10) { setError('Ingresa un número de celular válido (10 dígitos).'); return; }
      email = `${phoneClean}@agroconnect.app`;
    }

    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password: formData.password,
    });

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        setError(method === 'email'
          ? 'Este correo ya está registrado.'
          : 'Este número de celular ya está registrado.');
      } else {
        setError('Error al registrar. Intenta de nuevo más tarde.');
      }
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from('profiles').update({
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        role: formData.role,
      }).eq('id', data.user.id);
    }

    setLoading(false);
    alert(`¡Bienvenido a AgroConnect, ${formData.firstName}! Ya puedes iniciar sesión.`);
    navigate('/login');
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <button className="back-button" onClick={() => navigate('/login')}>
          <ArrowLeft size={20} /> Volver
        </button>

        <div className="register-header">
          <div className="logo-icon">
            <Leaf size={32} color="#2e7d32" />
          </div>
          <h1>Únete a AgroConnect</h1>
          <p>Crea tu cuenta y empieza a conectar con el mercado</p>
        </div>

        {/* Selector de método */}
        <div style={{
          display: 'flex', gap: '10px', marginBottom: '20px',
          background: '#f5f5f5', borderRadius: '10px', padding: '4px'
        }}>
          <button
            type="button"
            onClick={() => setMethod('phone')}
            style={{
              flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
              cursor: 'pointer', fontWeight: 600, fontSize: '14px',
              background: method === 'phone' ? '#2e7d32' : 'transparent',
              color: method === 'phone' ? 'white' : '#666',
              transition: 'all 0.2s'
            }}
          >
            📱 Con Celular
          </button>
          <button
            type="button"
            onClick={() => setMethod('email')}
            style={{
              flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
              cursor: 'pointer', fontWeight: 600, fontSize: '14px',
              background: method === 'email' ? '#2e7d32' : 'transparent',
              color: method === 'email' ? 'white' : '#666',
              transition: 'all 0.2s'
            }}
          >
            ✉️ Con Correo
          </button>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">Nombres</label>
              <div className="input-wrapper">
                <User className="input-icon" size={18} />
                <input type="text" id="firstName" placeholder="Tus nombres"
                  value={formData.firstName} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Apellidos</label>
              <div className="input-wrapper">
                <User className="input-icon" size={18} />
                <input type="text" id="lastName" placeholder="Tus apellidos"
                  value={formData.lastName} onChange={handleChange} required />
              </div>
            </div>
          </div>

          {/* Campo dinámico según método */}
          {method === 'phone' ? (
            <div className="form-group">
              <label htmlFor="phone">Número de Celular</label>
              <div className="input-wrapper">
                <Phone className="input-icon" size={18} />
                <input type="tel" id="phone" placeholder="Ej: 310 123 4567"
                  value={formData.phone} onChange={handleChange} required />
              </div>
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input type="email" id="email" placeholder="ejemplo@correo.com"
                  value={formData.email} onChange={handleChange} required />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="role">Tipo de Usuario</label>
            <select id="role" value={formData.role} onChange={handleChange}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1.5px solid #e0e0e0', fontSize: '15px', color: '#333' }}>
              <option value="farmer">🌱 Agricultor / Productor</option>
              <option value="buyer">🛒 Comprador</option>
              <option value="worker">👷 Trabajador del Campo</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input type="password" id="password" placeholder="Mínimo 6 caracteres"
                value={formData.password} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input type="password" id="confirmPassword" placeholder="Repite tu contraseña"
                value={formData.confirmPassword} onChange={handleChange} required />
            </div>
          </div>

          {error && (
            <div style={{
              background: '#ffebee', color: '#c62828',
              padding: '10px 14px', borderRadius: '8px',
              fontSize: '14px', marginBottom: '8px'
            }}>
              {error}
            </div>
          )}

          <button type="submit" className="register-submit-button" disabled={loading}>
            {loading ? 'Registrando...' : <> Registrarme <CheckCircle size={20} /></>}
          </button>
        </form>

        <div className="register-footer">
          <span>¿Ya tienes una cuenta?</span>
          <button className="login-link" onClick={() => navigate('/login')}>
            Inicia sesión aquí
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;