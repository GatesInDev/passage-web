import { ValidationErrors } from '@angular/forms';

/** Texto fixo ou montado a partir dos detalhes do erro. */
type ErrorMessage = string | ((detail: any) => string);

const DEFAULT_MESSAGES: Record<string, ErrorMessage> = {
  required: 'Campo obrigatório.',
  email: 'E-mail inválido.',
  minlength: detail => `Informe ao menos ${detail.requiredLength} caracteres.`,
  maxlength: detail => `Use no máximo ${detail.requiredLength} caracteres.`,
  min: detail => `O valor mínimo é ${detail.min}.`,
  max: detail => `O valor máximo é ${detail.max}.`,
  pattern: 'Formato inválido.',
  cpf: 'CPF inválido.',
  cnpj: 'CNPJ inválido.',
  uf: 'Use a sigla do estado com duas letras maiúsculas.',
  stateRegistration: 'Inscrição Estadual inválida.',
  positive: 'Informe um valor maior que zero.',
  future: 'Informe uma data futura.'
};

/**
 * Mensagem do primeiro erro de um campo, pronta para exibir.
 *
 * A ordem de prioridade é:
 *   1. `server` — o que a API respondeu para aquele campo;
 *   2. `overrides` — mensagens da própria tela (`[messages]` do campo);
 *   3. as mensagens padrão acima;
 *   4. o próprio valor do erro, quando ele já for um texto.
 */
export function describeFieldError(
  errors: ValidationErrors | null,
  overrides: Record<string, string> = {}
): string {
  if (errors === null) {
    return '';
  }

  if (typeof errors['server'] === 'string') {
    return errors['server'];
  }

  const [key, detail] = Object.entries(errors)[0] ?? [];

  if (key === undefined) {
    return '';
  }

  if (key in overrides) {
    return overrides[key];
  }

  const message: ErrorMessage | undefined = DEFAULT_MESSAGES[key];

  if (typeof message === 'function') {
    return message(detail);
  }

  return message ?? (typeof detail === 'string' ? detail : 'Valor inválido.');
}
