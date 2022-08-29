import { GridMethodRef } from '@etsoo/react';
import { DataTypes, IdDefaultType } from '@etsoo/shared';
import { ListChildComponentProps } from 'react-window';
import {
    ScrollerListExInnerItemRendererProps,
    ScrollerListExItemSize
} from '../ScrollerListEx';
import { DataGridPageProps } from './DataGridPageProps';

/**
 * Response page props
 */
export type ResponsePageProps<
    T extends object,
    F extends DataTypes.BasicTemplate,
    D extends DataTypes.Keys<T> = IdDefaultType<T>
> = Omit<
    DataGridPageProps<T, F, D>,
    'mRef' | 'itemKey' | 'onScroll' | 'onItemsRendered'
> & {
    /**
     * Min width to show Datagrid
     */
    dataGridMinWidth?: number;

    /**
     * Inner item renderer
     */
    innerItemRenderer: (
        props: ScrollerListExInnerItemRendererProps<T>
    ) => React.ReactNode;

    /**
     * Item renderer
     */
    itemRenderer?: (props: ListChildComponentProps<T>) => React.ReactElement;

    /**
     * Item size, a function indicates its a variable size list
     */
    itemSize: ScrollerListExItemSize;

    /**
     * Methods
     */
    mRef?: React.MutableRefObject<GridMethodRef<T> | undefined>;

    /**
     * Pull to refresh data
     */
    pullToRefresh?: boolean;

    /**
     * Quick action for double click or click under mobile
     */
    quickAction?: (data: T) => void;
};
