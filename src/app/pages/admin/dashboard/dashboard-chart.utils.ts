import { ReservaPorMes } from "../../../models/dashboard.interface";

export interface PaletaColores {
  primary: string;
  secondary: string;
  error: string;
  surface: string;
}

export function completarMeses(data: ReservaPorMes[]): number[] {
  const mapa = new Map<number, number>();
  data.forEach((item) => mapa.set(Number(item.mes), Number(item.cantidad)));
  return Array.from({ length: 12 }, (_, i) => mapa.get(i + 1) ?? 0);
}

export function obtenerPaletaDesdeCSS(defaults: PaletaColores): PaletaColores {
  const styles = getComputedStyle(document.documentElement);

  const primary = styles.getPropertyValue('--color-primary').trim();
  const secondary = styles.getPropertyValue('--color-secondary').trim();
  const error = styles.getPropertyValue('--color-error').trim();
  const surface = styles.getPropertyValue('--color-surface').trim();

  return {
    primary: primary || defaults.primary,
    secondary: secondary || defaults.secondary,
    error: error || defaults.error,
    surface: surface || defaults.surface,
  };
}
