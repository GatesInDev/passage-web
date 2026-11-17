import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

export type ToastTone = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  tone: ToastTone;
  message: string;
}

/** Tempo na tela, em milissegundos. Erros ficam mais para dar tempo de ler. */
const DURATION: Record<ToastTone, number> = {
  success: 4000,
  info: 5000,
  warning: 7000,
  error: 8000
};

/**
 * Avisos rápidos no canto da tela — o retorno de uma ação que acabou de
 * acontecer ("Rota cadastrada.", "Já existe uma rota com o código...").
 *
 * Precisa de um `<app-toast-outlet />` na raiz da aplicação.
 *
 * Uso:
 *   private readonly toast = inject(ToastService);
 *
 *   this.toast.success('Rota cadastrada.');
 *   this.toast.error(apiErrorMessage(error));
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly _toasts = signal<readonly Toast[]>([]);

  readonly toasts = this._toasts.asReadonly();

  private nextId = 0;

  success(message: string): number {
    return this.show('success', message);
  }

  error(message: string): number {
    return this.show('error', message);
  }

  warning(message: string): number {
    return this.show('warning', message);
  }

  info(message: string): number {
    return this.show('info', message);
  }

  /**
   * Mostra um aviso e devolve o `id`, para fechá-lo antes da hora com
   * `dismiss`. Com `duration` zero, ele fica até o usuário fechar.
   */
  show(tone: ToastTone, message: string, duration = DURATION[tone]): number {
    const id = this.nextId++;

    this._toasts.update(toasts => [...toasts, { id, tone, message }]);

    // No servidor não há quem veja o aviso sumir; o timer só seguraria a renderização.
    if (this.isBrowser && duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }

    return id;
  }

  dismiss(id: number): void {
    this._toasts.update(toasts => toasts.filter(toast => toast.id !== id));
  }
}
