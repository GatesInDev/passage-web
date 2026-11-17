import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { Pagination, pageCountOf, paginate } from './pagination';

describe('paginate', () => {
  const rows = [1, 2, 3, 4, 5, 6, 7];

  it('recorta a página pedida', () => {
    expect(paginate(rows, 1, 3)).toEqual([1, 2, 3]);
    expect(paginate(rows, 3, 3)).toEqual([7]);
  });

  it('volta para a última página quando a pedida não existe mais', () => {
    expect(paginate(rows, 9, 3)).toEqual([7]);
    expect(paginate(rows, 0, 3)).toEqual([1, 2, 3]);
  });

  it('conta ao menos uma página, mesmo sem registros', () => {
    expect(pageCountOf(0, 10)).toBe(1);
    expect(pageCountOf(21, 10)).toBe(3);
  });
});

@Component({
  imports: [Pagination],
  template: `<app-pagination itemLabel="rotas" [pageSize]="5" [total]="total()" [(page)]="page" />`
})
class Host {
  readonly page = signal(1);
  readonly total = signal(12);
}

describe('Pagination', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    const button = (label: string) =>
      element.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!;

    return { fixture, element, button };
  }

  it('mostra o resumo e desabilita voltar na primeira página', async () => {
    const { element, button } = await setup();

    expect(element.querySelector('p')?.textContent?.trim()).toBe('Página 1 de 3 · 12 rotas');
    expect(button('Página anterior').disabled).toBe(true);
    expect(button('Próxima página').disabled).toBe(false);
    expect(button('Página 1').getAttribute('aria-current')).toBe('page');
  });

  it('avança e atualiza a página do componente pai', async () => {
    const { fixture, button } = await setup();

    button('Próxima página').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.page()).toBe(2);

    button('Última página').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.page()).toBe(3);
    expect(button('Próxima página').disabled).toBe(true);
  });

  it('mostra a última página existente quando o total encolhe', async () => {
    const { fixture, element } = await setup();

    fixture.componentInstance.page.set(3);
    fixture.componentInstance.total.set(4);
    await fixture.whenStable();

    expect(element.querySelector('p')?.textContent?.trim()).toBe('Página 1 de 1 · 4 rotas');
  });
});
