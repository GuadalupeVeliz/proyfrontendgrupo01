import { ChartConfiguration, ChartData } from 'chart.js';
import { PaletaColores } from './dashboard-chart.utils';

export const MESES_LABELS = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

export const DEFAULT_COLORS: PaletaColores = {
  primary: '#C1652F',
  secondary: '#2E5339',
  error: '#B3402D',
  surface: '#FFFFFF',
};

export const RESERVAS_POR_MES_OPTIONS: ChartConfiguration['options'] = {
  responsive: true,
  maintainAspectRatio: false,
  scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
};

export const RESERVAS_POR_ESTADO_OPTIONS: ChartConfiguration['options'] = {
  responsive: true,
  maintainAspectRatio: false,
};

export const INGRESOS_EVOLUCION_OPTIONS: ChartConfiguration['options'] = {
  responsive: true,
  maintainAspectRatio: false,
};

export function crearReservasPorMesDataInicial(): ChartData<'bar'> {
  return {
    labels: MESES_LABELS,
    datasets: [{ data: [], label: 'Reservas' }],
  };
}

export function crearReservasPorEstadoDataInicial(): ChartData<'pie'> {
  return {
    labels: [],
    datasets: [{ data: [] }],
  };
}

export function crearIngresosEvolucionDataInicial(): ChartData<'line'> {
  return {
    labels: [],
    datasets: [{ data: [], label: 'Ingresos', fill: false }],
  };
}
