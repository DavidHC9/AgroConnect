import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import './FieldBook.css';
import { BookOpen, Plus, Search, Calendar, Filter, MoreHorizontal, Edit2, Trash2, Sprout, Droplets, Zap, TrendingUp, X, Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extender la interfaz para que jsPDF reconozca autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface Record {
  id: string;
  date: string;
  activity: 'Siembra' | 'Riego' | 'Fertilización' | 'Cosecha';
  crop: string;
  inputs: string;
  laborCount: number;
  notes: string;
}

const FieldBook: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [records, setRecords] = useState<Record[]>([
    {
      id: '1',
      date: '2024-05-15',
      activity: 'Siembra',
      crop: 'Papa Sabanera',
      inputs: 'Semilla certificada R1',
      laborCount: 4,
      notes: 'Lote Norte - Suelo preparado con compost.'
    },
    {
      id: '2',
      date: '2024-05-20',
      activity: 'Riego',
      crop: 'Papa Sabanera',
      inputs: 'N/A',
      laborCount: 1,
      notes: 'Riego por aspersión - 2 horas.'
    },
    {
      id: '3',
      date: '2024-05-25',
      activity: 'Fertilización',
      crop: 'Papa Sabanera',
      inputs: 'Fertilizante NPK 15-15-15',
      laborCount: 2,
      notes: 'Aplicación foliar preventiva.'
    }
  ]);

  const [formData, setFormData] = useState<Omit<Record, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    activity: 'Siembra',
    crop: '',
    inputs: '',
    laborCount: 1,
    notes: ''
  });

  const handleOpenModal = (record?: Record) => {
    if (record) {
      setEditingId(record.id);
      setFormData({
        date: record.date,
        activity: record.activity,
        crop: record.crop,
        inputs: record.inputs,
        laborCount: record.laborCount,
        notes: record.notes
      });
    } else {
      setEditingId(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        activity: 'Siembra',
        crop: '',
        inputs: '',
        laborCount: 1,
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este registro?')) {
      setRecords(records.filter(r => r.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setRecords(records.map(r => r.id === editingId ? { ...formData, id: editingId } : r));
    } else {
      const newRecord: Record = {
        ...formData,
        id: Date.now().toString()
      };
      setRecords([newRecord, ...records]);
    }
    setIsModalOpen(false);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Cuaderno de Campo Digital - AgroConnect', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Fecha de exportación: ${new Date().toLocaleDateString()}`, 14, 30);
    
    const tableColumn = ["Fecha", "Actividad", "Cultivo", "Insumos", "Personal", "Notas"];
    const tableRows = records.map(record => [
      record.date,
      record.activity,
      record.crop,
      record.inputs,
      record.laborCount,
      record.notes
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [46, 125, 50] }
    });

    doc.save('cuaderno-de-campo-agroconnect.pdf');
  };

  const getActivityClass = (activity: string) => {
    switch (activity) {
      case 'Siembra': return 'tag-siembra';
      case 'Riego': return 'tag-riego';
      case 'Fertilización': return 'tag-fertilizacion';
      case 'Cosecha': return 'tag-cosecha';
      default: return '';
    }
  };

  return (
    <div className="fieldbook-wrapper">
      <Navbar />
      
      <main className="fieldbook-content">
        <header className="fieldbook-header">
          <h1><BookOpen size={32} color="#2e7d32" /> Cuaderno de Campo</h1>
          <div className="header-actions">
            <button className="export-btn" onClick={exportToPDF}>
              <FileText size={20} /> Exportar PDF
            </button>
            <button className="add-record-btn" onClick={() => handleOpenModal()}>
              <Plus size={20} /> Nuevo Registro
            </button>
          </div>
        </header>

        <section className="field-stats-summary">
          <div className="stat-mini-card green">
            <div className="icon-box"><Sprout size={24} /></div>
            <div className="stat-info">
              <span>Cultivos Activos</span>
              <strong>{new Set(records.map(r => r.crop)).size} Variedades</strong>
            </div>
          </div>
          <div className="stat-mini-card blue">
            <div className="icon-box"><Droplets size={24} /></div>
            <div className="stat-info">
              <span>Registros Totales</span>
              <strong>{records.length} Entradas</strong>
            </div>
          </div>
          <div className="stat-mini-card orange">
            <div className="icon-box"><Zap size={24} /></div>
            <div className="stat-info">
              <span>Jornales Mes</span>
              <strong>{records.reduce((acc, curr) => acc + curr.laborCount, 0)} Registrados</strong>
            </div>
          </div>
        </section>

        <div className="records-container">
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Actividad</th>
                  <th>Cultivo</th>
                  <th>Insumos</th>
                  <th>Personal</th>
                  <th>Notas</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {records.length > 0 ? records.map(record => (
                  <tr key={record.id}>
                    <td>{record.date}</td>
                    <td>
                      <span className={`activity-tag ${getActivityClass(record.activity)}`}>
                        {record.activity}
                      </span>
                    </td>
                    <td><strong>{record.crop}</strong></td>
                    <td>{record.inputs}</td>
                    <td>{record.laborCount} pers.</td>
                    <td className="notes-cell" title={record.notes}>{record.notes}</td>
                    <td className="action-btns">
                      <button className="btn-icon" onClick={() => handleOpenModal(record)}><Edit2 size={16} /></button>
                      <button className="btn-icon delete" onClick={() => handleDelete(record.id)}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                      No hay registros aún. ¡Comienza agregando uno!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Interno para Nuevo/Editar Registro */}
        {isModalOpen && (
          <div className="record-modal-overlay">
            <div className="record-modal">
              <div className="modal-header-fb">
                <h3>{editingId ? 'Editar Registro' : 'Nuevo Registro de Campo'}</h3>
                <button className="close-fb" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="fb-form">
                <div className="form-row-fb">
                  <div className="fb-group">
                    <label>Fecha</label>
                    <input 
                      type="date" 
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="fb-group">
                    <label>Actividad</label>
                    <select 
                      value={formData.activity}
                      onChange={(e) => setFormData({...formData, activity: e.target.value as any})}
                    >
                      <option value="Siembra">Siembra</option>
                      <option value="Riego">Riego</option>
                      <option value="Fertilización">Fertilización</option>
                      <option value="Cosecha">Cosecha</option>
                    </select>
                  </div>
                </div>
                <div className="fb-group">
                  <label>Cultivo</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Papa Sabanera" 
                    value={formData.crop}
                    onChange={(e) => setFormData({...formData, crop: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-row-fb">
                  <div className="fb-group">
                    <label>Insumos Utilizados</label>
                    <input 
                      type="text" 
                      placeholder="Ej: NPK, Semillas..." 
                      value={formData.inputs}
                      onChange={(e) => setFormData({...formData, inputs: e.target.value})}
                    />
                  </div>
                  <div className="fb-group">
                    <label>N° Jornales</label>
                    <input 
                      type="number" 
                      value={formData.laborCount}
                      onChange={(e) => setFormData({...formData, laborCount: parseInt(e.target.value) || 0})}
                      min="0"
                    />
                  </div>
                </div>
                <div className="fb-group">
                  <label>Notas / Observaciones</label>
                  <textarea 
                    rows={3} 
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Detalles adicionales..."
                  ></textarea>
                </div>
                <button type="submit" className="save-fb-btn">
                  {editingId ? 'Guardar Cambios' : 'Registrar Actividad'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default FieldBook;
