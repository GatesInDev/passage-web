import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const TOKEN_KEY = 'passage.access-token';

/**
 * Guarda o token JWT de forma segura para renderização no servidor.
 *
 * Durante o SSR não existe `localStorage`: tocar nele quebraria a
 * renderização. Neste ambiente o serviço apenas devolve `null`,
 * fazendo o servidor tratar todo acesso como anônimo — a sessão real
 * é resolvida assim que a aplicação assume no navegador.
 */
@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  read(): string | null {
    if (!this.isBrowser) {
      return null;
    }

    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      // Navegação privada ou cookies bloqueados.
      return null;
    }
  }

  write(token: string): void {
    if (!this.isBrowser) {
      return;
    }

    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // Sem persistência disponível: a sessão dura só esta aba.
    }
  }

  clear(): void {
    if (!this.isBrowser) {
      return;
    }

    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // Nada a fazer.
    }
  }
}
