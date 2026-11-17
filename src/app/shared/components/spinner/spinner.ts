import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Indicador de carregamento, na cor do texto ao redor.
 *
 * Uso: `<app-spinner [size]="14" />`
 */
@Component({
  selector: 'app-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-block shrink-0 align-middle',
    '[style.width.px]': 'size()',
    '[style.height.px]': 'size()'
  },
  template: `
    <svg
      class="block animate-spin motion-reduce:animate-none"
      width="100%"
      height="100%"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle class="opacity-25" cx="12" cy="12" r="9.5" stroke="currentColor" stroke-width="3" />
      <path d="M12 2.5a9.5 9.5 0 0 1 9.5 9.5" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
    </svg>
  `
})
export class Spinner {
  /** Lado do indicador, em pixels. */
  readonly size = input(16);
}
