import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { Leaf, User, Lock, ArrowRight } from 'lucide-react';
import { supabase } from '../services/supabase';

// Si es teléfono, lo convierte a correo interno
const resolveEmail = (input: string): string => {
  const isPhone = /^[0-9\s\-\+]+$/.test(input.trim());
  if (isPhone) {
    const cleaned = input.replace(/\s+/g, '').replace(/[^0-9]/g, '');
    return `${cleaned}@agroconnect.app`;
  }
  return input.trim();
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState(''); // correo o teléfono
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const email = resolveEmail(identifier);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError('Correo/celular o contraseña incorrectos. Intenta de nuevo.');
    } else {
      navigate('/dashboard');
    }

    setLoading(false);
  };

  const isPhone = /^[0-9\s\-\+]+$/.test(identifier.trim()) && identifier.trim().length > 0;

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-icon">
            <Leaf size={40} color="#2e7d32" />
          </div>
          <h1>AgroConnect</h1>
          <p>Conectando el campo con el futuro</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="identifier">Correo o Número de Celular</label>
            <div className="input-wrapper">
              <User className="input-icon" size={20} />
              <input
                type="text"
                id="identifier"
                placeholder="correo@ejemplo.com o 310 123 4567"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
            {isPhone && (
              <small style={{ color: '#2e7d32', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                📱 Ingresando con número de celular
              </small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                type="password"
                id="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
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

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Ingresando...' : <> Iniciar Sesión <ArrowRight size={20} /></>}
          </button>
        </form>

        <div className="login-footer">
          <button className="text-button" onClick={() => navigate('/forgot-password')}>
            ¿Olvidaste tu contraseña?
          </button>
          <div className="register-prompt">
            <span>¿No tienes cuenta?</span>
            <button className="register-button" onClick={() => navigate('/register')}>
              Regístrate aquí
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;