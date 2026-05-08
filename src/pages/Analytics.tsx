import React from 'react';
import Navbar from '../components/Navbar';
import './Analytics.css';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Package, Calendar, Lightbulb, ArrowUpRight, FileText, Download } from 'lucide-react';
import jsPDF from 'jspdf';

const Analytics: React.FC = () => {
  const chartData = [
    { month: 'Ene', value: 65, secondary: 40 },
    { month: 'Feb', value: 75, secondary: 45 },
    { month: 'Mar', value: 85, secondary: 50 },
    { month: 'Abr', value: 70, secondary: 42 },
    { month: 'May', value: 90, secondary: 55 },
    { month: 'Jun', value: 95, secondary: 60 },
  ];

  const exportReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(46, 125, 50);
    doc.text('Reporte de Inteligencia de Campo', 14, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 30);

    doc.setFontSize(14);
    doc.text('Resumen Financiero:', 14, 45);
    doc.setFontSize(11);
    doc.text('- Ingresos Totales (Mes): $4,250,000', 20, 55);
    doc.text('- Gastos Operativos: $1,840,000', 20, 62);
    doc.text('- Rentabilidad Neta: 56.7%', 20, 69);

    doc.setFontSize(14);
    doc.text('Recomendaciones de la IA:', 14, 85);
    doc.setFontSize(11);
    doc.text('1. Optimizacion de Riego: Reducir 15% por lluvias esperadas.', 20, 95);
    doc.text('2. Alerta de Mercado: El precio de la Papa subira 8% en 10 dias.', 20, 102);

    doc.save('reporte-analitica-agroconnect.pdf');
  };

  const handleRecommendationClick = (type: string) => {
    alert(`Abriendo detalles de la recomendación: ${type}\n\nAquí el productor vería gráficos detallados del clima o tendencias históricas de precios.`);
  };

  return (
    <div className="analytics-wrapper">
      <Navbar />
      
      <main className="analytics-content">
        <header className="analytics-header">
          <div className="header-info-an">
            <h1><BarChart3 size={32} color="#2e7d32" /> Inteligencia de Campo</h1>
            <p>Análisis de rentabilidad y proyecciones basadas en tus registros.</p>
          </div>
          <button className="export-report-btn" onClick={exportReport}>
            <Download size={20} /> Descargar Reporte Completo
          </button>
        </header>

        <section className="kpi-row">
          <div className="kpi-card">
            <div className="kpi-data">
              <h4>Ingresos Totales (Mes)</h4>
              <div className="kpi-value">$4,250,000</div>
              <div className="kpi-trend trend-up">
                <TrendingUp size={14} /> +12.5% vs mes anterior
              </div>
            </div>
            <div className="kpi-icon bg-light-green">
              <DollarSign size={24} />
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-data">
              <h4>Gastos Operativos</h4>
              <div className="kpi-value">$1,840,000</div>
              <div className="kpi-trend trend-down">
                <TrendingDown size={14} /> -3.2% en insumos
              </div>
            </div>
            <div className="kpi-icon bg-light-blue">
              <Package size={24} />
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-data">
              <h4>Rentabilidad Neta</h4>
              <div className="kpi-value">56.7%</div>
              <div className="kpi-trend trend-up">
                <TrendingUp size={14} /> Margen optimizado
              </div>
            </div>
            <div className="kpi-icon bg-light-purple">
              <TrendingUp size={24} />
            </div>
          </div>
        </section>

        <div className="analytics-grid">
          <div className="analytics-card col-8">
            <div className="chart-header">
              <h3>Producción vs Proyección (Toneladas)</h3>
              <div className="chart-legend">
                <span className="dot real"></span> Real
                <span className="dot target"></span> Meta
              </div>
            </div>
            <div className="bar-chart-container">
              {chartData.map((item, index) => (
                <div key={index} className="chart-bar-group">
                  <div className="bar-pair">
                    <div className="bar secondary" style={{ height: `${item.secondary}%` }}></div>
                    <div className="bar" style={{ height: `${item.value}%` }}></div>
                  </div>
                  <span className="bar-label">{item.month}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="analytics-card col-4">
            <div className="chart-header">
              <h3>Recomendaciones IA</h3>
            </div>
            <div className="ai-insight-box clickable" onClick={() => handleRecommendationClick('Optimización de Riego')}>
              <div className="icon-box-ai"><Lightbulb size={24} color="#166534" /></div>
              <div className="insight-text">
                <h5>Optimización de Riego <ArrowUpRight size={14} /></h5>
                <p>Basado en el clima de Suesca, reduce el riego un 15% esta semana.</p>
              </div>
            </div>
            <div className="ai-insight-box clickable" onClick={() => handleRecommendationClick('Alerta de Mercado')}>
              <div className="icon-box-ai"><TrendingUp size={24} color="#166534" /></div>
              <div className="insight-text">
                <h5>Alerta de Mercado <ArrowUpRight size={14} /></h5>
                <p>El precio de la Papa Sabanera subirá un 8% en 10 días.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
