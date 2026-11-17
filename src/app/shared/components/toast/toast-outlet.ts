import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { Icon } from '../icon/icon';
import { IconName } from '../icon/icons';
import { ToastService, ToastTone } from './toast.service';

const TONES: Record<ToastTone, { icon: IconName; accent: string; iconColor: string }> = {
  success: { icon: 'check-circle', accent: 'border-l-brand-500', iconColor: 'text-brand-600' },
  error: { icon: 'alert-circle', accent: 'border-l-critical-600', iconColor: 'text-critical-600' },
  warning: {
    icon: 'alert-triangle',
    accent: 'border-l-warning-500',
    iconColor: 'text-warning-700'
  },
  info: { icon: 'info', accent: 'border-l-info-500', iconColor: 'text-info-700' }
};

/**
 * Onde os avisos do `ToastService` aparecem. Coloque uma vez, na raiz:
 *
 *   <router-outlet />
 *   <app-toast-outlet />
 */
@Component({
  selector: 'app-toast-outlet',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:left-auto sm:w-88'
  },
  template: `
    @for (toast of toasts(); track toast.id) {
      <div
        class="pointer-events-auto flex w-full items-start gap-2.5 rounded-sm border border-l-[3px]
               border-zinc-300 bg-white py-2.5 pl-3 pr-2 text-[13px] leading-5 text-carbon-900 shadow-lg"
        [class]="tones[toast.tone].accent"
        [attr.role]="toast.tone === 'error' || toast.tone === 'warning' ? 'alert' : 'status'"
      >
        <span class="mt-0.5 flex" [class]="tones[toast.tone].iconColor">
          <app-icon [name]="tones[toast.tone].icon" [size]="16" />
        </span>

        <p class="min-w-0 flex-1 break-words">{{ toast.message }}</p>

        <button
          type="button"
          class="flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-sm text-zinc-500
                 transition-colors hover:bg-zinc-100 hover:text-carbon-900 focus-visible:outline-2
                 focus-visible:outline-brand-500"
          aria-label="Fechar aviso"
          (click)="service.dismiss(toast.id)"
        >
          <app-icon name="x" [size]="13" />
        </button>
      </div>
    }
  `
})
export class ToastOutlet {
  protected readonly service = inject(ToastService);

  protected readonly toasts = this.service.toasts;

  protected readonly tones = TONES;
}
