import {
    GridDataGet,
    GridLoadDataProps,
    ScrollerListForwardRef,
    useCombinedRefs,
    useDimensions
} from '@etsoo/react';
import { DataTypes, IdDefaultType } from '@etsoo/shared';
import { Box, Stack } from '@mui/material';
import React from 'react';
import { MUGlobal } from '../MUGlobal';
import { ScrollerListEx } from '../ScrollerListEx';
import { SearchBar } from '../SearchBar';
import { CommonPage } from './CommonPage';
import { ListPageProps } from './ListPageProps';

/**
 * Fixed height list page
 * @param props Props
 * @returns Component
 */
export function FixedListPage<
    T extends object,
    F extends DataTypes.BasicTemplate = DataTypes.BasicTemplate,
    D extends DataTypes.Keys<T> = IdDefaultType<T>
>(
    props: ListPageProps<T, F, D> & {
        /**
         * Height will be deducted
         * @param height Current calcuated height
         */
        adjustHeight?: (height: number) => number;
    }
) {
    // Destruct
    const {
        adjustHeight,
        fields,
        fieldTemplate,
        loadData,
        mRef,
        sizeReadyMiliseconds = 0,
        pageProps = {},
        ...rest
    } = props;

    pageProps.paddings ??= MUGlobal.pagePaddings;

    // States
    const [states] = React.useState<{
        data?: FormData;
        ref?: ScrollerListForwardRef<T>;
    }>({});

    // Scroll container
    const [scrollContainer, updateScrollContainer] = React.useState<
        HTMLElement | undefined
    >();

    const refs = useCombinedRefs(
        mRef,
        (ref: ScrollerListForwardRef<T> | null | undefined) => {
            if (ref == null) return;

            const first = states.ref == null;

            states.ref = ref;

            if (first) reset();
        }
    );

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

    // Watch container
    const { dimensions } = useDimensions(1, undefined, sizeReadyMiliseconds);
    const rect = dimensions[0][2];
    const list = React.useMemo(() => {
        if (rect != null && rect.height > 50) {
            let height =
                document.documentElement.clientHeight -
                Math.round(rect.top + rect.height + 1);

            if (adjustHeight != null) {
                height -= adjustHeight(height);
            }

            return (
                <Box
                    id="list-container"
                    sx={{
                        height: height + 'px'
                    }}
                >
                    <ScrollerListEx<T, D>
                        autoLoad={false}
                        height={height}
                        loadData={localLoadData}
                        mRef={refs}
                        oRef={(element) => {
                            if (element != null) updateScrollContainer(element);
                        }}
                        {...rest}
                    />
                </Box>
            );
        }
    }, [rect]);

    const { paddings, ...pageRest } = pageProps;

    // Layout
    return (
        <CommonPage
            {...pageRest}
            paddings={{}}
            scrollContainer={scrollContainer}
        >
            <Stack>
                <Box ref={dimensions[0][0]} sx={{ padding: paddings }}>
                    <SearchBar fields={fields} onSubmit={onSubmit} />
                </Box>
                {list}
            </Stack>
        </CommonPage>
    );
}
