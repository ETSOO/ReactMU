import {
    GridDataGet,
    GridLoadDataProps,
    ScrollerGridForwardRef,
    useCombinedRefs,
    useDimensions
} from '@etsoo/react';
import { DataTypes, IdDefaultType } from '@etsoo/shared';
import { Box, Stack } from '@mui/material';
import React from 'react';
import { DataGridEx } from '../DataGridEx';
import { MUGlobal } from '../MUGlobal';
import { SearchBar } from '../SearchBar';
import { CommonPage } from './CommonPage';
import { DataGridPageProps } from './DataGridPageProps';

interface LocalStates<T> {
    data?: FormData;
    element?: HTMLElement;
    height?: number;
    ref?: ScrollerGridForwardRef<T>;
}

/**
 * DataGrid page
 * @param props Props
 * @returns Component
 */
export function DataGridPage<
    T extends object,
    F extends DataTypes.BasicTemplate = DataTypes.BasicTemplate,
    D extends DataTypes.Keys<T> = IdDefaultType<T>
>(props: DataGridPageProps<T, F, D>) {
    // Destruct
    const {
        adjustHeight,
        fields,
        fieldTemplate,
        height,
        loadData,
        mRef,
        sizeReadyMiliseconds = 100,
        pageProps = {},
        ...rest
    } = props;

    pageProps.paddings ??= MUGlobal.pagePaddings;

    // States
    const [states, setStates] = React.useReducer(
        (currentState: LocalStates<T>, newState: Partial<LocalStates<T>>) => {
            return { ...currentState, ...newState };
        },
        {
            height
        }
    );

    const refs = useCombinedRefs<ScrollerGridForwardRef<T>>(
        mRef,
        (ref: ScrollerGridForwardRef<T> | null | undefined) => {
            if (ref == null) return;
            states.ref = ref;
            //setStates({ ref });
        }
    );

    // On submit callback
    const onSubmit = (data: FormData, _reset: boolean) => {
        setStates({ data });
    };

    const localLoadData = (props: GridLoadDataProps) => {
        const data = GridDataGet(props, fieldTemplate);
        return loadData(data);
    };

    // Watch container
    const { dimensions } = useDimensions(1, undefined, sizeReadyMiliseconds);
    const rect = dimensions[0][2];

    React.useEffect(() => {
        if (rect != null && rect.height > 50 && height == null) {
            let gridHeight =
                document.documentElement.clientHeight -
                Math.round(rect.top + rect.height + 1);

            const style = window.getComputedStyle(dimensions[0][1]!);
            const paddingBottom = parseFloat(style.paddingBottom);
            if (!isNaN(paddingBottom)) gridHeight -= paddingBottom;

            if (adjustHeight != null) {
                gridHeight -= adjustHeight(gridHeight);
            }

            if (gridHeight !== states.height) setStates({ height: gridHeight });
        }
    }, [rect]);

    const list = React.useMemo(() => {
        const gridHeight = states.height;
        if (gridHeight == null) return;

        return (
            <DataGridEx<T, D>
                autoLoad={false}
                height={gridHeight}
                loadData={localLoadData}
                mRef={refs}
                outerRef={(element?: HTMLDivElement) => {
                    if (element != null) setStates({ element });
                }}
                {...rest}
            />
        );
    }, [states.height]);

    const { ref, data } = states;
    React.useEffect(() => {
        if (ref == null || data == null) return;
        ref.reset({ data });
    }, [ref, data]);

    // Layout
    return (
        <CommonPage {...pageProps} scrollContainer={states.element}>
            <Stack>
                <Box
                    ref={dimensions[0][0]}
                    sx={{
                        paddingBottom: pageProps.paddings
                    }}
                >
                    <SearchBar fields={fields} onSubmit={onSubmit} />
                </Box>
                {list}
            </Stack>
        </CommonPage>
    );
}
