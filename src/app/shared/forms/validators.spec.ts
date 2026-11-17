import { FormControl } from '@angular/forms';

import { cleanCnpj, cleanCpf, formatCnpj, formatCpf } from './masks';
import { PassageValidators, isValidCnpj, isValidCpf } from './validators';

describe('isValidCpf', () => {
  it('aceita CPF com dígitos verificadores corretos, com ou sem máscara', () => {
    expect(isValidCpf('12345678909')).toBe(true);
    expect(isValidCpf('529.982.247-25')).toBe(true);
  });

  it('recusa dígito verificador errado, tamanho errado e sequências repetidas', () => {
    expect(isValidCpf('12345678900')).toBe(false);
    expect(isValidCpf('1234567890')).toBe(false);
    expect(isValidCpf('11111111111')).toBe(false);
  });
});

describe('isValidCnpj', () => {
  it('aceita CNPJ numérico', () => {
    expect(isValidCnpj('12345678000195')).toBe(true);
    expect(isValidCnpj('11.222.333/0001-81')).toBe(true);
  });

  it('aceita CNPJ alfanumérico, como a API (CNPJ.Format.ALPHANUMERIC)', () => {
    expect(isValidCnpj('12ABC34501DE35')).toBe(true);
    expect(isValidCnpj('12.abc.345/01de-35')).toBe(true);
  });

  it('recusa dígito verificador errado, letras nos dígitos e sequências repetidas', () => {
    expect(isValidCnpj('12345678000190')).toBe(false);
    expect(isValidCnpj('12ABC34501DE3X')).toBe(false);
    expect(isValidCnpj('00000000000000')).toBe(false);
  });
});

describe('PassageValidators', () => {
  const errorsOf = (
    validator: (typeof PassageValidators)[keyof typeof PassageValidators],
    value: unknown
  ) => validator(new FormControl(value));

  it('trata campo vazio como válido (obrigatoriedade é do Validators.required)', () => {
    expect(errorsOf(PassageValidators.cpf, '')).toBeNull();
    expect(errorsOf(PassageValidators.cnpj, null)).toBeNull();
  });

  it('uf exige exatamente duas letras maiúsculas', () => {
    expect(errorsOf(PassageValidators.uf, 'SC')).toBeNull();
    expect(errorsOf(PassageValidators.uf, 'sc')).toEqual({ uf: true });
    expect(errorsOf(PassageValidators.uf, 'SCA')).toEqual({ uf: true });
  });

  it('stateRegistration aceita de 2 a 14 dígitos ou ISENTO', () => {
    expect(errorsOf(PassageValidators.stateRegistration, '251234567')).toBeNull();
    expect(errorsOf(PassageValidators.stateRegistration, 'isento')).toBeNull();
    expect(errorsOf(PassageValidators.stateRegistration, '1')).toEqual({ stateRegistration: true });
    expect(errorsOf(PassageValidators.stateRegistration, '25.123')).toEqual({
      stateRegistration: true
    });
  });

  it('positive recusa zero e negativos', () => {
    expect(errorsOf(PassageValidators.positive, 0.1)).toBeNull();
    expect(errorsOf(PassageValidators.positive, 0)).toEqual({ positive: true });
    expect(errorsOf(PassageValidators.positive, -5)).toEqual({ positive: true });
  });

  it('future recusa datas passadas e inválidas', () => {
    const tomorrow = new Date(Date.now() + 86_400_000).toISOString();

    expect(errorsOf(PassageValidators.future, tomorrow)).toBeNull();
    expect(errorsOf(PassageValidators.future, '2020-01-01T08:00:00Z')).toEqual({ future: true });
    expect(errorsOf(PassageValidators.future, 'amanhã')).toEqual({ future: true });
  });
});

describe('máscaras', () => {
  it('formata CPF e CNPJ completos', () => {
    expect(formatCpf('12345678909')).toBe('123.456.789-09');
    expect(formatCnpj('12345678000195')).toBe('12.345.678/0001-95');
    expect(formatCnpj('12abc34501de35')).toBe('12.ABC.345/01DE-35');
  });

  it('formata valores parciais sem deixar pontuação sobrando', () => {
    expect(formatCpf('123')).toBe('123');
    expect(formatCpf('1234')).toBe('123.4');
    expect(formatCnpj('123456780')).toBe('12.345.678/0');
    expect(formatCpf(null)).toBe('');
  });

  it('limpa a máscara e corta o excesso', () => {
    expect(cleanCpf('123.456.789-0999')).toBe('12345678909');
    expect(cleanCnpj('12.abc.345/01de-35')).toBe('12ABC34501DE35');
  });
});
