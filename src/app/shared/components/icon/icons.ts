/**
 * Desenhos dos ícones, em uma grade de 24 × 24 e feitos só de traços.
 *
 * Cada ícone é uma lista de valores para o atributo `d` de `<path>`.
 * Para acrescentar um, inclua a entrada aqui: o nome passa a ser aceito
 * por `<app-icon name="...">` automaticamente.
 */

const CIRCLE = 'M21 12a9 9 0 1 1-18 0a9 9 0 0 1 18 0Z';

export const ICONS = {
  menu: ['M4 6h16', 'M4 12h16', 'M4 18h16'],
  plus: ['M12 5v14', 'M5 12h14'],
  filter: ['M3 6h18', 'M7 12h10', 'M10 18h4'],
  search: ['M17 11a6 6 0 1 1-12 0a6 6 0 0 1 12 0Z', 'M20 20l-4.2-4.2'],
  download: ['M12 4v11', 'M7 11l5 5 5-5', 'M5 20h14'],
  eye: ['M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z', 'M15 12a3 3 0 1 1-6 0a3 3 0 0 1 6 0Z'],
  pencil: ['M16.5 3.5l4 4L8 20l-4.5.5L4 16 16.5 3.5Z', 'M14 6l4 4'],
  'minus-circle': [CIRCLE, 'M8 12h8'],
  trash: ['M4 7h16', 'M9 7V4h6v3', 'M6.5 7l1 13h9l1-13', 'M10 11v5', 'M14 11v5'],
  check: ['M5 12.5l4.5 4.5L19 7.5'],
  x: ['M6 6l12 12', 'M18 6L6 18'],
  clock: [CIRCLE, 'M12 7v5l3 2'],
  info: [CIRCLE, 'M12 11v5', 'M12 8h.01'],
  'alert-circle': [CIRCLE, 'M12 7.5v5', 'M12 16h.01'],
  'alert-triangle': ['M12 3.5 2.5 20h19L12 3.5Z', 'M12 10v4.5', 'M12 17.5h.01'],
  'check-circle': [CIRCLE, 'M8 12.5l2.8 2.8L16 9.5'],
  'chevron-down': ['M6 9l6 6 6-6'],
  'chevron-up': ['M6 15l6-6 6 6'],
  'chevron-left': ['M15 6l-6 6 6 6'],
  'chevron-right': ['M9 6l6 6-6 6'],
  'chevrons-left': ['M11 6l-6 6 6 6', 'M19 6l-6 6 6 6'],
  'chevrons-right': ['M13 6l6 6-6 6', 'M5 6l6 6-6 6'],
  'log-out': [
    'M9 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H9',
    'M15 8l4 4-4 4',
    'M19 12H9'
  ],
  bus: [
    'M5.5 4h13A2.5 2.5 0 0 1 21 6.5v8a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 14.5v-8A2.5 2.5 0 0 1 5.5 4Z',
    'M3 10h18',
    'M9 20a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0Z',
    'M18 20a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0Z'
  ],
  inbox: ['M3 13l3-8h12l3 8v6H3v-6Z', 'M3 13h5l1.5 3h5L16 13h5']
} as const satisfies Record<string, readonly string[]>;

export type IconName = keyof typeof ICONS;
