import {
  GridColumnRenderProps,
  GridDataType,
  ScrollRestoration
} from "@etsoo/react";
import { DataTypes, Utils } from "@etsoo/shared";
import {
  Breakpoint,
  Grid2,
  Grid2Props,
  LinearProgress,
  Stack,
  Typography
} from "@mui/material";
import React from "react";
import { Labels } from "../app/Labels";
import { GridDataFormat } from "../GridDataFormat";
import { MUGlobal } from "../MUGlobal";
import { PullToRefreshUI } from "../PullToRefreshUI";
import { CommonPage, CommonPageProps } from "./CommonPage";
import type { OperationMessageHandlerAll } from "../messages/OperationMessageHandler";
import { MessageUtils } from "../messages/MessageUtils";
import type { RefreshHandler } from "../messages/RefreshHandler";
import { OperationMessageContainer } from "../messages/OperationMessageContainer";
import { ReactAppType, useRequiredAppContext } from "../app/ReactApp";
import { useCurrentBreakpoint } from "../useCurrentBreakpoint";

/**
 * View page item size
 */
export type ViewPageItemSize = Record<Breakpoint, number | undefined>;

const breakpoints: Breakpoint[] = ["xs", "sm", "md", "lg", "xl"];

/**
 * View page grid item size
 */
export namespace ViewPageSize {
  export const large: ViewPageItemSize = {
    xs: 12,
    sm: 12,
    md: 9,
    lg: 6,
    xl: 4
  };
  export const medium: ViewPageItemSize = {
    xs: 12,
    sm: 12,
    md: 6,
    lg: 4,
    xl: 3
  };
  export const line: ViewPageItemSize = {
    xs: 12,
    sm: 12,
    md: 12,
    lg: 12,
    xl: 12
  };
  export const small: ViewPageItemSize = { xs: 6, sm: 6, md: 4, lg: 3, xl: 2 };
  export const smallLine: ViewPageItemSize = {
    xs: 12,
    sm: 6,
    md: 4,
    lg: 3,
    xl: 2
  };
  export function matchSize(size: ViewPageItemSize) {
    return Object.fromEntries(
      Object.entries(size).map(([key, value]) => [
        key,
        value == null ? undefined : value === 12 ? 12 : 12 - value
      ])
    );
  }
}

/**
 * View page grid item properties
 */
export type ViewPageGridItemProps = Grid2Props & {
  data: React.ReactNode;
  label?: React.ReactNode;
  singleRow?: ViewPageRowType;
};

/**
 * View page grid item
 * @param props Props
 * @returns Result
 */
export function ViewPageGridItem(props: ViewPageGridItemProps) {
  // Destruct
  const { data, label, singleRow, ...gridProps } = props;

  // Default options
  let options = {};
  if (gridProps.size == null) {
    options = getResp(singleRow ?? "small");
  } else if (singleRow != null) {
    options = getResp(singleRow ?? "small");
  }

  // Layout
  return (
    <Grid2 {...gridProps} {...options}>
      {label != null && (
        <Typography variant="caption" component="div">
          {label}:
        </Typography>
      )}
      {typeof data === "object" ? (
        data
      ) : (
        <Typography variant="subtitle2">{data}</Typography>
      )}
    </Grid2>
  );
}

/**
 * View page row width type
 */
export type ViewPageRowType =
  | boolean
  | "default"
  | "small"
  | "medium"
  | "large"
  | ViewPageItemSize;

/**
 * View page display field
 */
export interface ViewPageField<T extends object> extends Grid2Props {
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
  label?: string | ((item: T) => React.ReactNode);

  /**
   * Display as single row
   */
  singleRow?: ViewPageRowType;

  /**
   * Render props
   */
  renderProps?: GridColumnRenderProps;
}

type ViewPageFieldTypeNarrow<T extends object> =
  | (string & keyof T)
  | [string & keyof T, GridDataType, GridColumnRenderProps?, ViewPageRowType?]
  | ViewPageField<T>;

/**
 * View page field type
 */
export type ViewPageFieldType<T extends object> =
  | ViewPageFieldTypeNarrow<T>
  | ((
      data: T,
      refresh: () => Promise<void>
    ) => React.ReactNode | [React.ReactNode, ViewPageItemSize]);

/**
 * View page props
 */
export interface ViewPageProps<T extends DataTypes.StringRecord>
  extends Omit<CommonPageProps, "children"> {
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
   * Grid spacing
   */
  spacing?: Record<string, string | number>;

  /**
   * Support refresh
   */
  supportRefresh?: boolean;

  /**
   * Grid container reference
   */
  gridRef?: React.Ref<HTMLDivElement>;

  /**
   * Operation message handler
   */
  operationMessageHandler?:
    | OperationMessageHandlerAll
    | { id: number; types: string[] };

  /**
   * Title bar
   * @param data Data to render
   * @returns
   */
  titleBar?: (data: T) => React.ReactNode;

  /**
   * Left container
   */
  leftContainer?: (data: T) => React.ReactNode;

  /**
   * Left container height in lines
   */
  leftContainerLines?: number;

  /**
   * Left container properties
   */
  leftContainerProps?: Omit<Grid2Props, "size"> & { size?: ViewPageItemSize };
}

function formatItemData(
  app: ReactAppType,
  fieldData: unknown
): string | undefined {
  if (fieldData == null) return undefined;
  if (typeof fieldData === "string") return fieldData;
  if (fieldData instanceof Date) return app.formatDate(fieldData, "d");
  return `${fieldData}`;
}

function getResp(singleRow: ViewPageRowType) {
  const size =
    typeof singleRow === "object"
      ? singleRow
      : singleRow === "medium"
      ? ViewPageSize.medium
      : singleRow === "large"
      ? ViewPageSize.large
      : singleRow === true
      ? ViewPageSize.line
      : singleRow === false
      ? ViewPageSize.smallLine
      : ViewPageSize.small;
  return size;
}

function getItemField<T extends object>(
  app: ReactAppType,
  field: ViewPageFieldTypeNarrow<T>,
  data: T
): [React.ReactNode, React.ReactNode, Grid2Props, ViewPageItemSize] {
  // Item data and label
  let itemData: React.ReactNode,
    itemLabel: React.ReactNode,
    gridProps: Grid2Props = {},
    size: ViewPageItemSize;

  if (Array.isArray(field)) {
    const [fieldData, fieldType, renderProps, singleRow = "small"] = field;
    itemData = GridDataFormat(data[fieldData], fieldType, renderProps);
    itemLabel = app.get<string>(fieldData) ?? fieldData;
    size = getResp(singleRow);
    gridProps = { size };
  } else if (typeof field === "object") {
    // Destruct
    const {
      data: fieldData,
      dataType,
      label: fieldLabel,
      renderProps,
      singleRow = "default",
      ...rest
    } = field;

    // Size
    size = getResp(singleRow);

    gridProps = {
      ...rest,
      size
    };

    // Field data
    if (typeof fieldData === "function") itemData = fieldData(data);
    else if (dataType == null) itemData = formatItemData(app, data[fieldData]);
    else itemData = GridDataFormat(data[fieldData], dataType, renderProps);

    // Field label
    itemLabel =
      fieldLabel === ""
        ? undefined
        : fieldLabel == null && typeof fieldData === "string"
        ? app.get<string>(fieldData) ?? fieldData
        : typeof fieldLabel === "function"
        ? fieldLabel(data)
        : fieldLabel != null
        ? app.get<string>(fieldLabel) ?? fieldLabel
        : undefined;
  } else {
    // Single field format
    itemData = formatItemData(app, data[field]);
    itemLabel = app.get<string>(field) ?? field;
    size = ViewPageSize.small;
    gridProps = { size };
  }

  return [itemData, itemLabel, gridProps, size];
}

function getItemSize(bp: Breakpoint, size: ViewPageItemSize) {
  const v = size[bp];
  if (v != null) return v;

  const index = breakpoints.indexOf(bp);
  for (let i = index; i >= 0; i--) {
    const v = size[breakpoints[i]];
    if (v != null) return v;
  }

  return 12;
}

/**
 * View page
 * @param props Props
 */
export function ViewPage<T extends DataTypes.StringRecord>(
  props: ViewPageProps<T>
) {
  // Global app
  const app = useRequiredAppContext();

  // Destruct
  const {
    actions,
    children,
    fields,
    loadData,
    paddings = MUGlobal.pagePaddings,
    spacing = MUGlobal.half(MUGlobal.pagePaddings),
    supportRefresh = true,
    fabColumnDirection = true,
    fabTop = true,
    supportBack = true,
    pullToRefresh = true,
    gridRef,
    operationMessageHandler,
    titleBar,
    leftContainer,
    leftContainerLines = 3,
    leftContainerProps = {},
    ...rest
  } = props;

  // Current breakpoint
  const bp = useCurrentBreakpoint();

  // Data
  const [data, setData] = React.useState<T>();

  // Labels
  const labels = Labels.CommonPage;

  // Container
  const pullContainer = "#page-container";

  // Left container
  const { size = ViewPageSize.smallLine, ...leftContainerPropsRest } =
    leftContainerProps;

  // Load data
  const refresh = React.useCallback(async () => {
    const result = await loadData();
    // When failed or no data returned, show the loading bar
    setData(result);
  }, [loadData]);

  // Create fields
  const fieldIndexRef = React.useRef(0);
  const createFields = React.useCallback(
    (data: T, maxItems: number = 0) => {
      let validItems = 0;
      const items: React.ReactNode[] = [];
      let i: number = fieldIndexRef.current;
      for (; i < fields.length; i++) {
        const field = fields[i];
        let oneSize: ViewPageItemSize;
        let oneItem: React.ReactNode;
        if (typeof field === "function") {
          // Most flexible way, do whatever you want
          const createdResult = field(data, refresh);
          if (createdResult == null || createdResult === "") continue;
          if (Array.isArray(createdResult)) {
            const [created, size] = createdResult;
            oneSize = size;
            oneItem = created;
          } else {
            oneSize = ViewPageSize.line;
            oneItem = createdResult;
          }
        } else {
          const [itemData, itemLabel, gridProps, size] = getItemField(
            app,
            field,
            data
          );

          // Some callback function may return '' instead of undefined
          if (itemData == null || itemData === "") continue;

          oneSize = size;
          oneItem = (
            <ViewPageGridItem
              {...gridProps}
              key={i}
              data={itemData}
              label={itemLabel}
            />
          );
        }

        // Max lines
        if (maxItems > 0) {
          const itemSize = getItemSize(bp, oneSize);
          if (maxItems < validItems + itemSize) {
            fieldIndexRef.current = i;
            break;
          } else {
            items.push(oneItem);
            validItems += itemSize;
          }
        } else {
          items.push(oneItem);
        }
      }

      if (maxItems === 0) {
        fieldIndexRef.current = 0;
      } else {
        fieldIndexRef.current = i;
      }

      return items;
    },
    [app, refresh, fields, data, bp]
  );

  React.useEffect(() => {
    const refreshHandler: RefreshHandler = async () => {
      await refresh();
    };
    MessageUtils.onRefresh(refreshHandler);

    return () => {
      MessageUtils.offRefresh(refreshHandler);
    };
  }, [refresh]);

  let leftResult: React.ReactNode;

  return (
    <CommonPage
      paddings={paddings}
      onRefresh={supportRefresh ? refresh : undefined}
      onUpdate={supportRefresh ? undefined : refresh}
      sx={{
        ".MuiTypography-subtitle2": {
          fontWeight: "bold"
        }
      }}
      {...rest}
      scrollContainer={globalThis}
      fabColumnDirection={fabColumnDirection}
      fabTop={fabTop}
      supportBack={supportBack}
    >
      {data == null ? (
        <LinearProgress />
      ) : (
        <React.Fragment>
          {operationMessageHandler && (
            <OperationMessageContainer
              handler={
                "id" in operationMessageHandler
                  ? [
                      operationMessageHandler.types,
                      refresh,
                      operationMessageHandler.id
                    ]
                  : operationMessageHandler
              }
            />
          )}
          {titleBar && titleBar(data)}
          <Grid2
            container
            justifyContent="left"
            className="ET-ViewPage"
            ref={gridRef}
            spacing={spacing}
          >
            {leftContainer && (leftResult = leftContainer(data)) != null && (
              <React.Fragment>
                <Grid2
                  container
                  className="ET-ViewPage-LeftContainer"
                  spacing={spacing}
                  size={size}
                  {...leftContainerPropsRest}
                >
                  {leftResult}
                </Grid2>
                <Grid2
                  container
                  className="ET-ViewPage-LeftOthers"
                  spacing={spacing}
                  size={ViewPageSize.matchSize(size)}
                >
                  {createFields(
                    data,
                    leftContainerLines * (12 - getItemSize(bp, size))
                  )}
                </Grid2>
              </React.Fragment>
            )}
            {createFields(data)}
          </Grid2>
          {actions !== null && (
            <Stack
              className="ET-ViewPage-Actions"
              direction="row"
              width="100%"
              flexWrap="wrap"
              justifyContent="flex-end"
              paddingTop={actions == null ? undefined : paddings}
              paddingBottom={paddings}
              gap={paddings}
            >
              {actions != null && Utils.getResult(actions, data, refresh)}
            </Stack>
          )}
          {Utils.getResult(children, data, refresh)}
          {pullToRefresh && (
            <PullToRefreshUI
              mainElement={pullContainer}
              triggerElement={pullContainer}
              instructionsPullToRefresh={labels.pullToRefresh}
              instructionsReleaseToRefresh={labels.releaseToRefresh}
              instructionsRefreshing={labels.refreshing}
              onRefresh={refresh}
              shouldPullToRefresh={() => {
                const container = document.querySelector(pullContainer);
                return !container?.scrollTop;
              }}
            />
          )}
          <ScrollRestoration />
        </React.Fragment>
      )}
    </CommonPage>
  );
}
