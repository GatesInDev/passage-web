import { BadgeTone } from '../components/badge/badge';
import { SelectOption } from '../forms/select-field/select-field';

/*
 * Enums da Passage API com o texto e a cor usados na interface.
 * Os valores são exatamente os que a API envia e espera receber.
 */

/** `RouteScope` — abrangência da linha (`serviceScope` da rota). */
export type RouteScope = 'INTERSTATE' | 'INTRASTATE' | 'INTERNATIONAL' | 'METROPOLITAN';

export const ROUTE_SCOPE_LABEL: Record<RouteScope, string> = {
  INTRASTATE: 'Intermunicipal',
  METROPOLITAN: 'Metropolitana',
  INTERSTATE: 'Interestadual',
  INTERNATIONAL: 'Internacional'
};

/** Cores dos selos de tipo de rota, como no protótipo. */
export const ROUTE_SCOPE_TONE: Record<RouteScope, BadgeTone> = {
  INTRASTATE: 'sky',
  METROPOLITAN: 'teal',
  INTERSTATE: 'violet',
  INTERNATIONAL: 'info'
};

/** `SeatPosition` — posição do assento na fileira. */
export type SeatPosition = 'WINDOW' | 'AISLE' | 'MIDDLE';

export const SEAT_POSITION_LABEL: Record<SeatPosition, string> = {
  WINDOW: 'Janela',
  AISLE: 'Corredor',
  MIDDLE: 'Meio'
};

/** `SeatQuality` — categoria de conforto do assento. */
export type SeatQuality = 'STANDARD' | 'COMFORT' | 'PREMIUM';

export const SEAT_QUALITY_LABEL: Record<SeatQuality, string> = {
  STANDARD: 'Convencional',
  COMFORT: 'Conforto',
  PREMIUM: 'Premium'
};

/**
 * Transforma um mapa de rótulos nas opções de um `app-select-field`.
 *
 *   readonly scopeOptions = optionsOf(ROUTE_SCOPE_LABEL);
 */
export function optionsOf<T extends string>(labels: Record<T, string>): SelectOption<T>[] {
  return (Object.entries(labels) as [T, string][]).map(([value, label]) => ({ value, label }));
}
