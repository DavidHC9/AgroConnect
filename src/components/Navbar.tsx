import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { Leaf, Users, User, Store, LogOut, Menu, X, ChevronDown, BookOpen, BarChart3, Settings, GraduationCap, PlayCircle } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMercadoDropdown, setShowMercadoDropdown] = useState(false);
  const [showGestionDropdown, setShowGestionDropdown] = useState(false);
  const [showAcademiaDropdown, setShowAcademiaDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-logo" onClick={() => setIsOpen(false)}>
          <Leaf size={28} />
          <span>AgroConnect</span>
        </Link>

        <div className="mobile-menu-icon" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </div>

        <ul className={isOpen ? "nav-menu active" : "nav-menu"}>
          <li className="nav-item dropdown" 
              onMouseEnter={() => setShowMercadoDropdown(true)}
              onMouseLeave={() => setShowMercadoDropdown(false)}>
            <div className="dropdown-trigger">
              Mercado <ChevronDown size={16} />
            </div>
            
            <ul className={showMercadoDropdown ? "dropdown-menu show" : "dropdown-menu"}>
              <li className="dropdown-item">
                <Link to="/jobs" onClick={() => setIsOpen(false)}>
                  <Users size={18} />
                  <div>
                    <strong>Emparejamiento Laboral</strong>
                    <span>Talento y empleo rural</span>
                  </div>
                </Link>
              </li>
              <li className="dropdown-item">
                <Link to="/marketplace" onClick={() => setIsOpen(false)}>
                  <Store size={18} />
                  <div>
                    <strong>Venta Directa</strong>
                    <span>Del campo a la industria</span>
                  </div>
                </Link>
              </li>
            </ul>
          </li>

          <li className="nav-item dropdown" 
              onMouseEnter={() => setShowGestionDropdown(true)}
              onMouseLeave={() => setShowGestionDropdown(false)}>
            <div className="dropdown-trigger">
              Gestión <ChevronDown size={16} />
            </div>
            
            <ul className={showGestionDropdown ? "dropdown-menu show" : "dropdown-menu"}>
              <li className="dropdown-item">
                <Link to="/field-book" onClick={() => setIsOpen(false)}>
                  <BookOpen size={18} />
                  <div>
                    <strong>Cuaderno de Campo</strong>
                    <span>Registra tus actividades</span>
                  </div>
                </Link>
              </li>
              <li className="dropdown-item">
                <Link to="/analytics" onClick={() => setIsOpen(false)}>
                  <BarChart3 size={18} />
                  <div>
                    <strong>Analítica</strong>
                    <span>Rentabilidad con IA</span>
                  </div>
                </Link>
              </li>
            </ul>
          </li>

          <li className="nav-item dropdown" 
              onMouseEnter={() => setShowAcademiaDropdown(true)}
              onMouseLeave={() => setShowAcademiaDropdown(false)}>
            <div className="dropdown-trigger">
              Academia <ChevronDown size={16} />
            </div>
            
            <ul className={showAcademiaDropdown ? "dropdown-menu show" : "dropdown-menu"}>
              <li className="dropdown-item">
                <Link to="/academy" onClick={() => setIsOpen(false)}>
                  <GraduationCap size={18} />
                  <div>
                    <strong>Biblioteca de Saberes</strong>
                    <span>Tutoriales y guías locales</span>
                  </div>
                </Link>
              </li>
            </ul>
          </li>

          <li className="nav-item">
            <Link to="/profile" className="profile-nav-link" onClick={() => setIsOpen(false)}>
              <User size={20} /> Mi Perfil
            </Link>
          </li>

          <li className="nav-item">
            <button className="logout-button" onClick={handleLogout}>
              <LogOut size={20} /> Salir
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
