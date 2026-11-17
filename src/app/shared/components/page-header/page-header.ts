import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Badge } from '../badge/badge';

/**
 * Cabeçalho da página: título, descrição e ações principais.
 *
 * O conteúdo projetado vai para o canto direito (botões de ação).
 * `code` mostra um selo ao lado do título, como o prefixo do veículo
 * na tela de edição.
 *
 * Uso:
 *   <app-page-header title="Rotas" subtitle="Gestão de linhas e horários de operação">
 *     <button app-button variant="secondary" type="button">Exportar CSV</button>
 *     <button app-button type="button">Nova Rota</button>
 *   </app-page-header>
 */
@Component({
  selector: 'app-page-header',
  imports: [Badge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-zinc-200 bg-white px-4 py-2.5'
  },
  template: `
    <div class="min-w-0">
      <div class="flex items-center gap-2">
        <h1 class="text-sm font-semibold leading-5 text-carbon-900">{{ title() }}</h1>
        @if (code()) {
          <app-badge tone="success" variant="tag" mono>{{ code() }}</app-badge>
        }
      </div>
      @if (subtitle()) {
        <p class="mt-0.5 text-[11px] text-zinc-500">{{ subtitle() }}</p>
      }
    </div>

    <div class="flex shrink-0 flex-wrap items-center gap-2">
      <ng-content />
    </div>
  `
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly subtitle = input('');

  /** Código ou prefixo do registro em edição. */
  readonly code = input('');
}
