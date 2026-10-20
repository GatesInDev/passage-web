import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Estratégia de renderização por rota.
 *
 * A tela de login é pública e idêntica para todo mundo: pode ser
 * gerada uma vez no build (prerender) e servida como HTML estático.
 *
 * As telas autenticadas dependem da sessão guardada no navegador,
 * que não existe durante a renderização no servidor. Prerenderizá-las
 * produziria uma tela vazia — ou um 404, já que o servidor não
 * consegue enumerá-las no build. Por isso renderizam no cliente.
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: 'login',
    renderMode: RenderMode.Prerender
  },
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
