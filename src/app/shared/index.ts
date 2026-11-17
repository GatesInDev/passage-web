/*
 * Ponto único de importação do que é compartilhado entre as telas:
 *
 *   import { Button, DataTable, TextField } from '../../shared';
 *
 * Veja o README desta pasta para a lista e os exemplos de uso.
 */

// Componentes
export * from './components/avatar/avatar';
export * from './components/badge/badge';
export * from './components/badge/status-badge';
export * from './components/breadcrumb/breadcrumb';
export * from './components/button/button';
export * from './components/data-table/data-table';
export * from './components/data-table/table-cell';
export * from './components/filter-panel/filter-panel';
export * from './components/form-section/form-section';
export * from './components/icon/icon';
export * from './components/icon/icons';
export * from './components/icon-button/icon-button';
export * from './components/modal/confirm-dialog';
export * from './components/modal/modal';
export * from './components/page-header/page-header';
export * from './components/pagination/pagination';
export * from './components/spinner/spinner';
export * from './components/tabs/tabs';
export * from './components/toast/toast-outlet';
export * from './components/toast/toast.service';
export * from './components/topbar/topbar';

// Formulários
export * from './forms/checkbox/checkbox';
export * from './forms/field-control';
export * from './forms/field-errors';
export * from './forms/field-shell/field-shell';
export * from './forms/masks';
export * from './forms/problem-detail';
export * from './forms/select-field/select-field';
export * from './forms/text-field/text-field';
export * from './forms/validators';

// Pipes e diretivas
export * from './directives/has-role';
export * from './pipes/document-pipes';
export * from './pipes/measure-pipes';

// Regras e vocabulário da Passage API
export * from './domain/enums';
export * from './domain/permissions';
