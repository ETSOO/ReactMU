import {
    GridDataGet,
    GridLoadDataProps,
    ScrollerListForwardRef,
    useCombinedRefs
} from '@etsoo/react';
import { DataTypes, IdDefaultType } from '@etsoo/shared';
import { Box, Stack } from '@mui/material';
import React from 'react';
import { MUGlobal } from '../MUGlobal';
import { ScrollerListEx } from '../ScrollerListEx';
import { SearchBar } from '../SearchBar';
import { CommonPage, CommonPageScrollContainer } from './CommonPage';
import { ListPageProps } from './ListPageProps';

/**
 * List page
 * @param props Props
 * @returns Component
 */
export function ListPage<
    T extends object,
    F extends DataTypes.BasicTemplate = DataTypes.BasicTemplate,
    D extends DataTypes.Keys<T> = IdDefaultType<T>
>(props: ListPageProps<T, F, D>) {
    // Destruct
    const {
        fields,
        fieldTemplate,
        loadData,
        mRef,
        pageProps = {},
        ...rest
    } = props;

    pageProps.paddings ??= MUGlobal.pagePaddings;

    // States
    const [states] = React.useState<{
        data?: FormData;
        ref?: ScrollerListForwardRef<T>;
    }>({});

    const refs = useCombinedRefs(mRef, (ref: ScrollerListForwardRef<T>) => {
        if (ref == null) return;

        const first = states.ref == null;

        states.ref = ref;

        if (first) reset();
    });

    const reset = () => {
        if (states.data == null || states.ref == null) return;
        states.ref.reset({ data: states.data });
    };

    // On submit callback
    const onSubmit = (data: FormData, _reset: boolean) => {
        states.data = data;
        reset();
    };

    const localLoadData = (props: GridLoadDataProps) => {
        const data = GridDataGet(props, fieldTemplate);
        return loadData(data);
    };

    // Layout
    return (
        <CommonPage {...pageProps} scrollContainer={CommonPageScrollContainer}>
            <Stack>
                <Box
                    sx={{
                        paddingBottom: pageProps.paddings
                    }}
                >
                    <SearchBar fields={fields} onSubmit={onSubmit} />
                </Box>
                <ScrollerListEx<T, D>
                    autoLoad={false}
                    loadData={localLoadData}
                    mRef={refs}
                    {...rest}
                />
            </Stack>
        </CommonPage>
    );
}
