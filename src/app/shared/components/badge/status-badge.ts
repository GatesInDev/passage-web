import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input
} from '@angular/core';

import { Badge } from './badge';

/**
 * Situação de um registro da Passage API.
 *
 * Toda entidade da API herda `isActive` de `EntityBase`, e é só isso
 * que o backend expõe hoje: ativo ou inativo. Registros excluídos
 * (`isDeleted`) nem chegam nas listagens.
 *
 * Uso:
 *   <app-status-badge [active]="company.isActive" />
 *   <app-status-badge [active]="route.isActive" feminine />   → Ativa / Inativa
 */
@Component({
  selector: 'app-status-badge',
  imports: [Badge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
  template: `<app-badge [tone]="active() ? 'success' : 'neutral'" dot>{{ label() }}</app-badge>`
})
export class StatusBadge {
  readonly active = input.required<boolean>();

  /** Concorda com substantivos femininos: rota, passagem, empresa. */
  readonly feminine = input(false, { transform: booleanAttribute });

  protected readonly label = computed(() => {
    const ending = this.feminine() ? 'a' : 'o';
    return this.active() ? `Ativ${ending}` : `Inativ${ending}`;
  });
}
