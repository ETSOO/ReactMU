import { DataTypes } from '@etsoo/shared';
import { TableExProps } from '../TableEx';
import { SearchPageProps } from './SearchPageProps';

/**
 * Table page props
 */
export type TablePageProps<
    T extends object,
    F extends DataTypes.BasicTemplate,
    D extends DataTypes.Keys<T>
> = SearchPageProps<T, F> & Omit<TableExProps<T, D>, 'loadData'>;
