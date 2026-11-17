import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { ICONS, IconName } from './icons';

/**
 * Ícone em SVG, desenhado com a cor do texto ao redor (`currentColor`).
 *
 * Uso: `<app-icon name="pencil" [size]="14" />`
 *
 * É sempre decorativo (`aria-hidden`): o significado deve estar no texto
 * ao lado ou no `aria-label` do botão que o contém.
 */
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-block shrink-0 align-middle',
    '[style.width.px]': 'size()',
    '[style.height.px]': 'size()'
  },
  template: `
    <svg
      class="block"
      width="100%"
      height="100%"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
      [attr.stroke-width]="strokeWidth()"
    >
      @for (path of paths(); track $index) {
        <path [attr.d]="path" />
      }
    </svg>
  `
})
export class Icon {
  readonly name = input.required<IconName>();

  /** Lado do ícone, em pixels. */
  readonly size = input(16);

  readonly strokeWidth = input(2);

  protected readonly paths = computed(() => ICONS[this.name()]);
}
