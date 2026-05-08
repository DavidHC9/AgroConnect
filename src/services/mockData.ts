import type { Product, JobOpportunity } from '../types';

export const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Papa Sabanera',
    price: '85.000',
    unit: 'Bulto',
    location: 'Suesca, Cundinamarca',
    farmer: 'Don Alberto Pérez',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f02bad675?auto=format&fit=crop&q=80&w=400',
    category: 'Tubérculos',
    freshness: 'Cosechado hoy',
    description: 'Papa sabanera de excelente calidad, tamaño grande y libre de plagas.',
    quantity: '50 bultos disponibles'
  },
  {
    id: 2,
    name: 'Café Especial (Grano)',
    price: '28.000',
    unit: 'Libra',
    location: 'Fredonia, Antioquia',
    farmer: 'Familia Restrepo',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=400',
    category: 'Café',
    freshness: 'Procesado',
    description: 'Café de altura, notas achocolatadas, secado al sol.',
    quantity: '200 libras disponibles'
  },
  {
    id: 3,
    name: 'Tomate de Árbol',
    price: '3.800',
    unit: 'Kilo',
    location: 'Tibasosa, Boyacá',
    farmer: 'Marta Lucía Gómez',
    image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&q=80&w=400',
    category: 'Frutas',
    freshness: 'Cosechado ayer',
    description: 'Tomates rojos y maduros, listos para pulpa o consumo directo.',
    quantity: '150 kilos disponibles'
  }
];

export const mockJobs: JobOpportunity[] = [
  {
    id: 1,
    title: 'Operador de Maquinaria Pesada',
    name: 'Hacienda La Esperanza',
    location: 'A 5km de ti (Cerca)',
    skills: ['Tractor', 'Cosechadora', 'Mantenimiento'],
    match: 95,
    type: 'Temporada Cosecha',
    urgent: true
  },
  {
    id: 2,
    title: 'Técnico en Riego por Goteo',
    name: 'Cultivos El Rosal',
    location: 'A 12km de ti',
    skills: ['Sistemas Hidráulicos', 'Fertirriego'],
    match: 82,
    type: 'Tiempo Completo',
    urgent: false
  },
  {
    id: 3,
    title: 'Recolector de Café Especial',
    name: 'Finca El Cafetal',
    location: 'A 3km de ti (Muy Cerca)',
    skills: ['Cosecha selectiva', 'Post-cosecha'],
    match: 88,
    type: 'Por labor',
    urgent: true
  }
];
