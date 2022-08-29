import { GridColumnRenderProps, GridDataType } from '@etsoo/react';
import { DataTypes, Utils } from '@etsoo/shared';
import {
    Grid,
    GridProps,
    LinearProgress,
    Stack,
    Typography
} from '@mui/material';
import React from 'react';
import { Labels } from '../app/Labels';
import { globalApp } from '../app/ReactApp';
import { GridDataFormat } from '../GridDataFormat';
import { MUGlobal } from '../MUGlobal';
import { PullToRefreshUI } from '../PullToRefreshUI';
import { CommonPage } from './CommonPage';
import { CommonPageProps } from './CommonPageProps';

/**
 * View page display field
 */
export interface ViewPageField<T extends object> extends GridProps {
    /**
     * Data field
     */
    data: (string & keyof T) | ((item: T) => React.ReactNode);

    /**
     * Data type
     */
    dataType?: GridDataType;

    /**
     * Label field
     */
    label?: string | (() => React.ReactNode);

    /**
     * Display as single row
     */
    singleRow?: boolean;

    /**
     * Render props
     */
    renderProps?: GridColumnRenderProps;
}

type ViewPageFieldType<T extends object> =
    | (string & keyof T)
    | [string & keyof T, GridDataType, GridColumnRenderProps?]
    | ViewPageField<T>;

/**
 * View page props
 */
export interface ViewPageProps<T extends DataTypes.StringRecord>
    extends Omit<CommonPageProps, 'children'> {
    /**
     * Actions
     */
    actions?:
        | React.ReactNode
        | ((data: T, refresh: () => PromiseLike<void>) => React.ReactNode);

    /**
     * Children
     */
    children?:
        | React.ReactNode
        | ((data: T, refresh: () => PromiseLike<void>) => React.ReactNode);

    /**
     * Fields to display
     */
    fields: ViewPageFieldType<T>[];

    /**
     * Load data
     */
    loadData: () => PromiseLike<T | undefined>;

    /**
     * Pull to refresh data
     */
    pullToRefresh?: boolean;

    /**
     * Support refresh
     */
    supportRefresh?: boolean;
}

function formatItemData(fieldData: unknown): string | undefined {
    if (fieldData == null) return undefined;
    if (typeof fieldData === 'string') return fieldData;
    if (fieldData instanceof Date) return globalApp.formatDate(fieldData, 'd');
    return `${fieldData}`;
}

function getItemField<T extends object>(
    field: ViewPageFieldType<T>,
    data: T
): [React.ReactNode, React.ReactNode, GridProps] {
    // Item data and label
    let itemData: React.ReactNode,
        itemLabel: React.ReactNode,
        gridProps: GridProps = {};

    let xs = 6;

    if (Array.isArray(field)) {
        const [fieldData, fieldType, renderProps] = field;
        itemData = GridDataFormat(data[fieldData], fieldType, renderProps);
        itemLabel = globalApp.get<string>(fieldData) ?? fieldData;
    } else if (typeof field === 'object') {
        // Destruct
        const {
            data: fieldData,
            dataType,
            label: fieldLabel,
            renderProps,
            singleRow,
            ...rest
        } = field;

        gridProps = {
            ...rest,
            ...(singleRow && { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 })
        };

        if (singleRow === false) xs = 12;

        // Field data
        if (typeof fieldData === 'function') itemData = fieldData(data);
        else if (dataType == null) itemData = formatItemData(data[fieldData]);
        else itemData = GridDataFormat(data[fieldData], dataType, renderProps);

        // Field label
        itemLabel =
            typeof fieldLabel === 'function'
                ? fieldLabel()
                : globalApp.get<string>(
                      fieldLabel ??
                          (typeof fieldData === 'string' ? fieldData : 'noData')
                  ) ?? fieldLabel;
    } else {
        itemData = formatItemData(data[field]);
        itemLabel = globalApp.get<string>(field) ?? field;
    }

    return [
        itemData,
        itemLabel,
        { xs, sm: 6, md: 6, lg: 4, xl: 3, ...gridProps }
    ];
}

/**
 * View page
 * @param props Props
 */
export function ViewPage<T extends DataTypes.StringRecord>(
    props: ViewPageProps<T>
) {
    // Destruct
    const {
        actions,
        children,
        fields,
        loadData,
        paddings = MUGlobal.pagePaddings,
        supportRefresh = true,
        fabColumnDirection = true,
        supportBack = true,
        pullToRefresh = true,
        ...rest
    } = props;

    // Data
    const [data, setData] = React.useState<T>();

    // Labels
    const labels = Labels.CommonPage;

    // Container
    const pullContainer = '#page-container';

    // Load data
    const refresh = async () => {
        const result = await loadData();
        if (result == null) return;
        setData(result);
    };

    return (
        <CommonPage
            paddings={paddings}
            onRefresh={supportRefresh ? refresh : undefined}
            onUpdate={supportRefresh ? undefined : refresh}
            {...rest}
            scrollContainer={globalThis}
            fabColumnDirection={fabColumnDirection}
            supportBack={supportBack}
        >
            {data == null ? (
                <LinearProgress />
            ) : (
                <React.Fragment>
                    <Grid
                        container
                        justifyContent="left"
                        spacing={paddings}
                        className="ET-ViewPage"
                        sx={{
                            '.MuiTypography-subtitle2': {
                                fontWeight: 'bold'
                            }
                        }}
                    >
                        {fields.map((field, index) => {
                            // Get data
                            const [itemData, itemLabel, gridProps] =
                                getItemField(field, data);

                            // Some callback function may return '' instead of undefined
                            if (itemData == null || itemData === '')
                                return undefined;

                            // Layout
                            return (
                                <Grid item {...gridProps} key={index}>
                                    <Typography
                                        variant="caption"
                                        component="div"
                                    >
                                        {itemLabel}:
                                    </Typography>
                                    <Typography variant="subtitle2">
                                        {itemData}
                                    </Typography>
                                </Grid>
                            );
                        })}
                    </Grid>
                    {actions != null && (
                        <Stack
                            className="ET-ViewPage-Actions"
                            direction="row"
                            width="100%"
                            flexWrap="wrap"
                            justifyContent="flex-end"
                            paddingTop={paddings}
                            paddingBottom={paddings}
                            gap={paddings}
                        >
                            {Utils.getResult(actions, data, refresh)}
                        </Stack>
                    )}
                    {Utils.getResult(children, data, refresh)}
                    {pullToRefresh && (
                        <PullToRefreshUI
                            mainElement={pullContainer}
                            triggerElement={pullContainer}
                            instructionsPullToRefresh={labels.pullToRefresh}
                            instructionsReleaseToRefresh={
                                labels.releaseToRefresh
                            }
                            instructionsRefreshing={labels.refreshing}
                            onRefresh={refresh}
                            shouldPullToRefresh={() => {
                                const container =
                                    document.querySelector(pullContainer);
                                return !container?.scrollTop;
                            }}
                        />
                    )}
                </React.Fragment>
            )}
        </CommonPage>
    );
}
