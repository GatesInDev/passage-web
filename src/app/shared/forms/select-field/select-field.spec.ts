import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { SelectField, SelectOption } from './select-field';

@Component({
  imports: [ReactiveFormsModule, SelectField],
  template: `
    <app-select-field label="Status" placeholder="Todos" [options]="options()" [formControl]="control" />
  `
})
class Host {
  readonly control = new FormControl<boolean | null>(null, Validators.required);

  readonly options = signal<SelectOption<boolean>[]>([
    { value: true, label: 'Ativo' },
    { value: false, label: 'Inativo' }
  ]);
}

describe('SelectField', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();

    const select = (fixture.nativeElement as HTMLElement).querySelector('select')!;
    const choose = async (index: number) => {
      select.selectedIndex = index;
      select.dispatchEvent(new Event('change'));
      await fixture.whenStable();
    };
    const shown = () => select.selectedOptions[0]?.textContent?.trim();

    return { fixture, select, choose, shown, control: fixture.componentInstance.control };
  }

  it('começa no placeholder quando o valor é null', async () => {
    const { shown } = await setup();

    expect(shown()).toBe('Todos');
  });

  it('entrega o value da opção com o tipo original, não o texto', async () => {
    const { choose, control } = await setup();

    await choose(2);
    expect(control.value).toBe(false);

    await choose(1);
    expect(control.value).toBe(true);
  });

  it('voltar ao placeholder entrega null', async () => {
    const { choose, control } = await setup();

    await choose(1);
    await choose(0);

    expect(control.value).toBeNull();
    expect(control.hasError('required')).toBe(true);
  });

  it('reflete o valor definido pelo formulário', async () => {
    const { fixture, shown, control } = await setup();

    control.setValue(false);
    await fixture.whenStable();

    expect(shown()).toBe('Inativo');
  });

  it('mantém a seleção quando as opções chegam depois do valor', async () => {
    const { fixture, shown, control } = await setup();
    fixture.componentInstance.options.set([]);
    control.setValue(true);
    await fixture.whenStable();

    fixture.componentInstance.options.set([
      { value: false, label: 'Inativo' },
      { value: true, label: 'Ativo' }
    ]);
    await fixture.whenStable();

    expect(shown()).toBe('Ativo');
  });
});
