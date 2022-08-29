import { DataTypes } from '@etsoo/shared';
import { ScrollerListExProps } from '../ScrollerListEx';
import { SearchPageProps } from './SearchPageProps';

/**
 * List page props
 */
export type ListPageProps<
    T extends object,
    F extends DataTypes.BasicTemplate,
    D extends DataTypes.Keys<T>
> = SearchPageProps<T, F> & Omit<ScrollerListExProps<T, D>, 'loadData'>;
