/**
 * Máscaras de documentos.
 *
 * A Passage API guarda CPF e CNPJ **sem pontuação** (`12345678909`,
 * `12345678000195`). As funções daqui só cuidam da apresentação; o valor
 * que vai para a API continua sendo o texto limpo.
 */

/** Preenche o molde com os caracteres informados: `#` é uma posição. */
function applyPattern(raw: string, pattern: string): string {
  let result = '';
  let index = 0;

  for (const slot of pattern) {
    if (index >= raw.length) {
      break;
    }
    result += slot === '#' ? raw[index++] : slot;
  }

  return result;
}

export function onlyDigits(value: string | null | undefined): string {
  return (value ?? '').replace(/\D/g, '');
}

/** CPF limpo: até 11 dígitos. */
export function cleanCpf(value: string | null | undefined): string {
  return onlyDigits(value).slice(0, 11);
}

/**
 * CNPJ limpo: até 14 caracteres, letras maiúsculas e dígitos.
 *
 * A API valida o CNPJ no formato alfanumérico (`CNPJ.Format.ALPHANUMERIC`),
 * então letras são aceitas nas 12 primeiras posições.
 */
export function cleanCnpj(value: string | null | undefined): string {
  return (value ?? '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 14);
}

/** `12345678909` → `123.456.789-09`. Aceita valor parcial, durante a digitação. */
export function formatCpf(value: string | null | undefined): string {
  return applyPattern(cleanCpf(value), '###.###.###-##');
}

/** `12345678000195` → `12.345.678/0001-95`. Aceita valor parcial, durante a digitação. */
export function formatCnpj(value: string | null | undefined): string {
  return applyPattern(cleanCnpj(value), '##.###.###/####-##');
}
