import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';
import { Leaf, Phone, Mail, Lock, ArrowLeft, ShieldCheck, KeyRound } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Identify, 2: Verify, 3: Reset
  const [identifier, setIdentifier] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [passwords, setPasswords] = useState({ new: '', confirm: '' });

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(step + 1);
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    alert('¡Tu contraseña ha sido actualizada con éxito!');
    navigate('/login');
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        <button className="back-button" onClick={() => step === 1 ? navigate('/login') : setStep(step - 1)}>
          <ArrowLeft size={20} /> {step === 1 ? 'Volver al Login' : 'Atrás'}
        </button>

        <div className="forgot-header">
          <div className="logo-icon">
            <KeyRound size={32} color="#2e7d32" />
          </div>
          <h1>{step === 1 ? 'Recuperar Cuenta' : step === 2 ? 'Verificar Identidad' : 'Nueva Contraseña'}</h1>
          <p>
            {step === 1 && "Ingresa tu teléfono o correo para enviarte un código."}
            {step === 2 && `Enviamos un código de 6 dígitos a: ${identifier}`}
            {step === 3 && "Crea una contraseña segura que puedas recordar."}
          </p>
        </div>

        {step === 1 && (
          <form onSubmit={handleNextStep} className="forgot-form">
            <div className="form-group">
              <label>Teléfono o Correo Electrónico</label>
              <div className="input-wrapper">
                <Phone className="input-icon" size={18} />
                <input
                  type="text"
                  placeholder="Ej: 310 123 4567"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" className="forgot-submit-button">
              Enviar Código
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleNextStep} className="forgot-form">
            <div className="code-inputs">
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  className="digit-input"
                />
              ))}
            </div>
            <button type="submit" className="forgot-submit-button">
              Verificar Código <ShieldCheck size={20} />
            </button>
            <button type="button" className="resend-button" onClick={() => alert('Código re-enviado')}>
              ¿No recibiste el código? Re-enviar
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="forgot-form">
            <div className="form-group">
              <label>Nueva Contraseña</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Confirmar Contraseña</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input
                  type="password"
                  placeholder="Repite tu contraseña"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  required
                />
              </div>
            </div>
            <button type="submit" className="forgot-submit-button">
              Restablecer Contraseña
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
