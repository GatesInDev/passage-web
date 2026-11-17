import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

import { cleanCnpj, onlyDigits } from './masks';

/**
 * Validações que espelham as da Passage API, para o usuário saber do
 * erro antes de enviar. A API continua sendo quem decide: estas regras
 * só evitam uma ida e volta desnecessária.
 *
 * Todas tratam campo vazio como válido — obrigatoriedade é assunto do
 * `Validators.required`.
 */

function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || value === '';
}

/** Dígito verificador pelo módulo 11, como em CPF e CNPJ. */
function checkDigit(values: number[], weights: number[]): number {
  const sum = values.reduce((total, value, index) => total + value * weights[index], 0);
  const rest = sum % 11;
  return rest < 2 ? 0 : 11 - rest;
}

/** CPF com 11 dígitos e dígitos verificadores corretos (`@CPF` na API). */
export function isValidCpf(value: string): boolean {
  const digits = onlyDigits(value);

  // Sequências como 111.111.111-11 passam na conta, mas não existem.
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) {
    return false;
  }

  const numbers = [...digits].map(Number);
  const first = checkDigit(numbers.slice(0, 9), [10, 9, 8, 7, 6, 5, 4, 3, 2]);
  const second = checkDigit(numbers.slice(0, 10), [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);

  return numbers[9] === first && numbers[10] === second;
}

/**
 * CNPJ com 14 caracteres, numérico ou alfanumérico
 * (`@CNPJ(format = ALPHANUMERIC)` na API).
 *
 * No formato alfanumérico as 12 primeiras posições aceitam letras e os
 * dois dígitos verificadores continuam numéricos. O cálculo é o mesmo
 * módulo 11, usando o código do caractere menos 48 como valor — o que,
 * para os dígitos, dá o próprio número.
 */
export function isValidCnpj(value: string): boolean {
  const text = cleanCnpj(value);

  if (!/^[A-Z0-9]{12}\d{2}$/.test(text) || /^(.)\1{13}$/.test(text)) {
    return false;
  }

  const values = [...text].map(char => char.charCodeAt(0) - 48);
  const first = checkDigit(values.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const second = checkDigit(values.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);

  return values[12] === first && values[13] === second;
}

/** As 27 unidades federativas, para montar seletores de UF. */
// prettier-ignore
export const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
] as const;

function validator(key: string, isValid: (value: unknown) => boolean): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null =>
    isEmpty(control.value) || isValid(control.value) ? null : { [key]: true };
}

export const PassageValidators = {
  /** CPF do passageiro (`passengerDocument`). */
  cpf: validator('cpf', value => isValidCpf(String(value))),

  /** CNPJ da empresa (`documentId`). */
  cnpj: validator('cnpj', value => isValidCnpj(String(value))),

  /**
   * Sigla de estado: exatamente duas letras maiúsculas, a mesma regra
   * (`[A-Z]{2}`) de `originState` e `destinationState` nas rotas.
   */
  uf: validator('uf', value => /^[A-Z]{2}$/.test(String(value))),

  /** Inscrição Estadual: de 2 a 14 dígitos, ou a palavra ISENTO. */
  stateRegistration: validator('stateRegistration', value =>
    /^(?:\d{2,14}|ISENTO)$/i.test(String(value))
  ),

  /** Número maior que zero (`@Positive`): distância, duração, valor da passagem. */
  positive: validator('positive', value => Number(value) > 0),

  /** Data e hora no futuro (`@Future`): partida da passagem. */
  future: validator('future', value => {
    const time = new Date(value as string | number | Date).getTime();
    return !Number.isNaN(time) && time > Date.now();
  })
} as const;
