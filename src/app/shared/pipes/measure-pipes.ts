import { Pipe, PipeTransform } from '@angular/core';

/*
 * Os formatadores usam `Intl` com a localidade fixa em pt-BR, então não
 * dependem de registrar `LOCALE_ID` na aplicação.
 */

const CURRENCY = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const DISTANCE = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

function isBlank(value: unknown): value is null | undefined {
  return value === null || value === undefined || Number.isNaN(Number(value));
}

/** Minutos em horas e minutos, como no protótipo: 90 → `1h30min`. */
export function formatDuration(minutes: number): string {
  const total = Math.max(0, Math.round(minutes));
  const hours = Math.floor(total / 60);
  const rest = String(total % 60).padStart(2, '0');

  return hours === 0 ? `${total}min` : `${hours}h${rest}min`;
}

/**
 * Duração da rota (`estimatedDurationMinutes`).
 *
 * `{{ route.estimatedDurationMinutes | duration }}` → 12h00min
 */
@Pipe({ name: 'duration' })
export class DurationPipe implements PipeTransform {
  transform(minutes: number | null | undefined): string {
    return isBlank(minutes) ? '' : formatDuration(minutes);
  }
}

/**
 * Valor em reais (`price` da passagem).
 *
 * `{{ ticket.price | brl }}` → R$ 189,90
 */
@Pipe({ name: 'brl' })
export class BrlPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    return isBlank(value) ? '' : CURRENCY.format(Number(value));
  }
}

/**
 * Distância da rota (`distanceKm`), com no máximo uma casa decimal.
 *
 * `{{ route.distanceKm | distance }}` → 705,4 km
 */
@Pipe({ name: 'distance' })
export class DistancePipe implements PipeTransform {
  transform(kilometers: number | string | null | undefined): string {
    return isBlank(kilometers) ? '' : `${DISTANCE.format(Number(kilometers))} km`;
  }
}
