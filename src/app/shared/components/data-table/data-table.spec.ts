import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { DataTable, TableColumn } from './data-table';
import { TableCell } from './table-cell';

interface Row {
  id: string;
  code: string;
  name: string | null;
  isActive: boolean;
}

@Component({
  imports: [DataTable, TableCell],
  template: `
    <app-data-table
      label="Rotas"
      selectable
      emptyMessage="Nenhuma rota encontrada."
      [columns]="columns"
      [rows]="rows()"
      [loading]="loading()"
      [(selection)]="selection"
    >
      <span table-summary>{{ rows().length }} rotas</span>

      <ng-template appCell="status" [appCellOf]="rows()" let-row>
        <b class="status">{{ row.isActive ? 'Ativa' : 'Inativa' }}</b>
      </ng-template>
    </app-data-table>
  `
})
class Host {
  readonly columns: TableColumn<Row>[] = [
    { key: 'code', header: 'Código', style: 'code' },
    { key: 'name', header: 'Nome' },
    { key: 'lower', header: 'Minúsculo', value: row => row.code.toLowerCase() },
    { key: 'status', header: 'Status' }
  ];

  readonly rows = signal<Row[]>([
    { id: 'a', code: 'XAP-FLN-001', name: 'Chapecó - Florianópolis', isActive: true },
    { id: 'b', code: 'FLN-SAO-002', name: null, isActive: false }
  ]);

  readonly loading = signal(false);
  readonly selection = signal<readonly string[]>([]);
}

describe('DataTable', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    const cells = () =>
      Array.from(element.querySelectorAll('tbody tr')).map(row =>
        Array.from(row.querySelectorAll('td')).map(cell => cell.textContent?.trim())
      );
    const checkboxes = () =>
      Array.from(element.querySelectorAll<HTMLInputElement>('input[type=checkbox]'));

    return { fixture, element, cells, checkboxes };
  }

  it('monta cabeçalho e linhas: campo, função value, template e travessão para vazio', async () => {
    const { element, cells } = await setup();

    const headers = Array.from(element.querySelectorAll('th')).map(th => th.textContent?.trim());
    expect(headers).toEqual(['', 'Código', 'Nome', 'Minúsculo', 'Status']);

    expect(cells()).toEqual([
      ['', 'XAP-FLN-001', 'Chapecó - Florianópolis', 'xap-fln-001', 'Ativa'],
      ['', 'FLN-SAO-002', '—', 'fln-sao-002', 'Inativa']
    ]);
    expect(element.querySelector('table')?.getAttribute('aria-label')).toBe('Rotas');
    expect(element.textContent).toContain('2 rotas');
  });

  it('seleciona uma linha e reflete o estado parcial no cabeçalho', async () => {
    const { fixture, checkboxes } = await setup();

    checkboxes()[1].click();
    await fixture.whenStable();

    expect(fixture.componentInstance.selection()).toEqual(['a']);
    expect(checkboxes()[0].indeterminate).toBe(true);
    expect(checkboxes()[0].checked).toBe(false);
  });

  it('o cabeçalho marca e desmarca todas as linhas visíveis, preservando as de outras páginas', async () => {
    const { fixture, checkboxes } = await setup();
    fixture.componentInstance.selection.set(['outra-pagina']);
    await fixture.whenStable();

    checkboxes()[0].click();
    await fixture.whenStable();
    expect(fixture.componentInstance.selection()).toEqual(['outra-pagina', 'a', 'b']);

    checkboxes()[0].click();
    await fixture.whenStable();
    expect(fixture.componentInstance.selection()).toEqual(['outra-pagina']);
  });

  it('mostra o estado vazio e o de carregando', async () => {
    const { fixture, element } = await setup();

    fixture.componentInstance.rows.set([]);
    await fixture.whenStable();
    expect(element.querySelector('tbody')?.textContent).toContain('Nenhuma rota encontrada.');

    fixture.componentInstance.loading.set(true);
    await fixture.whenStable();
    expect(element.querySelector('tbody')?.textContent).toContain('Carregando...');
    expect(element.querySelector('table')?.getAttribute('aria-busy')).toBe('true');
  });
});
