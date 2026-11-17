import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TextField } from '../text-field/text-field';
import { Checkbox } from './checkbox';

@Component({
  imports: [ReactiveFormsModule, FormsModule, Checkbox, TextField],
  template: `
    <app-checkbox [formControl]="accessible">Veículo acessível</app-checkbox>
    <app-checkbox [(checked)]="onlyActive">Somente ativos</app-checkbox>
    <app-text-field label="Busca" [(ngModel)]="search" />
  `
})
class Host {
  readonly accessible = new FormControl(true, { nonNullable: true });
  readonly onlyActive = signal(false);
  readonly search = signal('chapecó');
}

describe('Checkbox', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    const boxes = Array.from(element.querySelectorAll<HTMLInputElement>('input[type=checkbox]'));

    return { fixture, element, boxes, host: fixture.componentInstance };
  }

  it('reflete e altera o valor de um controle de formulário', async () => {
    const { fixture, boxes, host } = await setup();
    expect(boxes[0].checked).toBe(true);

    boxes[0].click();
    await fixture.whenStable();
    expect(host.accessible.value).toBe(false);

    host.accessible.disable();
    await fixture.whenStable();
    expect(boxes[0].disabled).toBe(true);
  });

  it('funciona fora de formulário, com [(checked)]', async () => {
    const { fixture, boxes, host } = await setup();

    boxes[1].click();
    await fixture.whenStable();
    expect(host.onlyActive()).toBe(true);

    host.onlyActive.set(false);
    await fixture.whenStable();
    expect(boxes[1].checked).toBe(false);
  });

  it('o texto projetado é o rótulo da caixa', async () => {
    const { boxes } = await setup();

    expect(boxes[0].closest('label')?.textContent?.trim()).toBe('Veículo acessível');
  });
});

describe('TextField com ngModel', () => {
  it('lê e escreve um signal por [(ngModel)]', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();

    const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      'input:not([type=checkbox])'
    )!;
    expect(input.value).toBe('chapecó');

    input.value = 'xanxerê';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(fixture.componentInstance.search()).toBe('xanxerê');
  });
});
