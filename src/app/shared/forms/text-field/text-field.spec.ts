import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { PassageValidators } from '../validators';
import { TextField } from './text-field';

@Component({
  imports: [ReactiveFormsModule, TextField],
  template: `
    <form [formGroup]="form">
      <app-text-field label="Razão Social" hint="Como no cartão CNPJ." formControlName="corporateName" />
      <app-text-field label="CNPJ" format="cnpj" formControlName="documentId" />
      <app-text-field label="Distância" type="number" formControlName="distanceKm" />
    </form>
  `
})
class Host {
  readonly form = new FormGroup({
    corporateName: new FormControl('', [Validators.required, Validators.minLength(3)]),
    documentId: new FormControl('12345678000195', PassageValidators.cnpj),
    distanceKm: new FormControl<number | null>(null)
  });
}

describe('TextField', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    const inputs = Array.from(element.querySelectorAll('input'));
    const type = async (input: HTMLInputElement, text: string) => {
      input.value = text;
      input.dispatchEvent(new Event('input'));
      await fixture.whenStable();
    };

    return { fixture, element, inputs, type, form: fixture.componentInstance.form };
  }

  it('liga o rótulo ao campo e marca o obrigatório a partir do Validators.required', async () => {
    const { element, inputs } = await setup();
    const labels = Array.from(element.querySelectorAll('label'));

    expect(labels[0].getAttribute('for')).toBe(inputs[0].id);
    expect(labels[0].textContent).toContain('*');
    expect(labels[1].textContent).not.toContain('*');
    expect(inputs[0].getAttribute('aria-required')).toBe('true');
  });

  it('mostra o valor inicial do formulário com a máscara', async () => {
    const { inputs } = await setup();

    expect(inputs[1].value).toBe('12.345.678/0001-95');
  });

  it('entrega ao formulário o valor sem máscara', async () => {
    const { inputs, type, form } = await setup();

    await type(inputs[1], '12.abc.345/01de-35');

    expect(form.controls.documentId.value).toBe('12ABC34501DE35');
    expect(inputs[1].value).toBe('12.ABC.345/01DE-35');
    expect(form.controls.documentId.valid).toBe(true);
  });

  it('entrega número em type="number" e null quando vazio', async () => {
    const { inputs, type, form } = await setup();

    await type(inputs[2], '705.4');
    expect(form.controls.distanceKm.value).toBe(705.4);

    await type(inputs[2], '');
    expect(form.controls.distanceKm.value).toBeNull();
  });

  it('só mostra o erro depois de markAllAsTouched, no lugar do texto de apoio', async () => {
    const { fixture, element, inputs, form } = await setup();

    expect(element.querySelector('[role=alert]')).toBeNull();
    expect(element.textContent).toContain('Como no cartão CNPJ.');

    form.markAllAsTouched();
    await fixture.whenStable();

    const alert = element.querySelector('[role=alert]');
    expect(alert?.textContent?.trim()).toBe('Campo obrigatório.');
    expect(inputs[0].getAttribute('aria-invalid')).toBe('true');
    expect(inputs[0].getAttribute('aria-describedby')).toBe(alert?.id);
    expect(element.textContent).not.toContain('Como no cartão CNPJ.');
  });

  it('acompanha reset e desabilitação feitos pelo formulário', async () => {
    const { fixture, inputs, form } = await setup();

    form.reset();
    form.controls.documentId.disable();
    await fixture.whenStable();

    expect(inputs[1].value).toBe('');
    expect(inputs[1].disabled).toBe(true);
  });
});
