import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup } from '@angular/forms';

import { apiErrorMessage, apiFieldErrors, applyApiFieldErrors } from './problem-detail';

const validation = new HttpErrorResponse({
  status: 400,
  error: {
    title: 'Erro de Validação',
    detail: 'Dados de entrada inválidos.',
    invalidFields: [
      'code: O código da rota é obrigatório.',
      'name: O nome da rota deve ter entre 3 e 128 caracteres.',
      'name: O nome da rota é obrigatório.'
    ]
  }
});

describe('apiErrorMessage', () => {
  it('repassa o detail da API em regras de negócio (409)', () => {
    const error = new HttpErrorResponse({
      status: 409,
      error: { detail: 'Já existe uma rota cadastrada com o código XAP-FLN-001' }
    });

    expect(apiErrorMessage(error)).toBe('Já existe uma rota cadastrada com o código XAP-FLN-001');
  });

  it('explica falha de conexão, falta de permissão e erro do servidor', () => {
    expect(apiErrorMessage(new HttpErrorResponse({ status: 0 }))).toContain('conexão');
    expect(apiErrorMessage(new HttpErrorResponse({ status: 403 }))).toContain('permissão');
    expect(apiErrorMessage(new HttpErrorResponse({ status: 500 }))).toContain('servidor');
  });

  it('usa a mensagem padrão quando não há nada melhor', () => {
    expect(apiErrorMessage(new Error('x'), 'Falhou.')).toBe('Falhou.');
    expect(apiErrorMessage(new HttpErrorResponse({ status: 409, error: null }), 'Falhou.')).toBe(
      'Falhou.'
    );
  });
});

describe('apiFieldErrors', () => {
  it('separa campo e mensagem, ficando com a primeira de cada campo', () => {
    expect(apiFieldErrors(validation)).toEqual({
      code: 'O código da rota é obrigatório.',
      name: 'O nome da rota deve ter entre 3 e 128 caracteres.'
    });
  });

  it('devolve vazio para erros sem invalidFields', () => {
    expect(apiFieldErrors(new HttpErrorResponse({ status: 409, error: { detail: 'x' } }))).toEqual(
      {}
    );
  });
});

describe('applyApiFieldErrors', () => {
  it('marca os controles com o erro do servidor e ignora campos desconhecidos', () => {
    const form = new FormGroup({ code: new FormControl('') });

    expect(applyApiFieldErrors(form, validation)).toBe(true);
    expect(form.controls.code.errors).toEqual({ server: 'O código da rota é obrigatório.' });
    expect(form.controls.code.touched).toBe(true);
  });

  it('informa quando nenhum campo foi marcado', () => {
    const form = new FormGroup({ other: new FormControl('') });

    expect(applyApiFieldErrors(form, validation)).toBe(false);
  });

  it('o erro do servidor some quando o usuário altera o campo', () => {
    const form = new FormGroup({ code: new FormControl('') });
    applyApiFieldErrors(form, validation);

    form.controls.code.setValue('XAP-FLN-001');

    expect(form.controls.code.errors).toBeNull();
  });
});
