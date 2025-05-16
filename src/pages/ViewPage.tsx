import { ScrollRestoration } from "@etsoo/react";
import { DataTypes, Utils } from "@etsoo/shared";
import React from "react";
import { Labels } from "../app/Labels";
import { MUGlobal } from "../MUGlobal";
import { PullToRefreshUI } from "../PullToRefreshUI";
import { CommonPage, CommonPageProps } from "./CommonPage";
import type { OperationMessageHandlerAll } from "../messages/OperationMessageHandler";
import { MessageUtils } from "../messages/MessageUtils";
import type { RefreshHandler } from "../messages/RefreshHandler";
import { OperationMessageContainer } from "../messages/OperationMessageContainer";
import { ViewContainer, ViewContainerProps } from "../ViewContainer";
import LinearProgress from "@mui/material/LinearProgress";
import Stack, { StackProps } from "@mui/material/Stack";

/**
 * View page action bar
 * @param props Props
 * @returns Component
 */
export function ViewPageActionBar(
  props: StackProps & {
    actionPaddings?: number | Record<string, string | number>;
  }
) {
  const { actionPaddings = MUGlobal.pagePaddings, ...rest } = props;

  return (
    <Stack
      className="ET-ViewPage-Actions"
      direction="row"
      width="100%"
      flexWrap="wrap"
      justifyContent="center"
      paddingTop={actionPaddings}
      paddingBottom={actionPaddings}
      gap={actionPaddings}
      {...rest}
    ></Stack>
  );
}

/**
 * View page props
 */
export interface ViewPageProps<T extends DataTypes.StringRecord>
  extends Omit<CommonPageProps, "children">,
    Omit<ViewContainerProps<T>, "data" | "refresh"> {
  /**
   * Actions
   */
  actions?:
    | React.ReactNode
    | ((data: T, refresh: () => PromiseLike<void>) => React.ReactNode);

  /**
   * Paddings between actions
   */
  actionPaddings?: number | Record<string, string | number>;

  /**
   * Children
   */
  children?:
    | React.ReactNode
    | ((data: T, refresh: () => PromiseLike<void>) => React.ReactNode);

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
    spacing,
    actionPaddings = MUGlobal.pagePaddings,
    supportRefresh = true,
    fabColumnDirection = true,
    fabTop = true,
    supportBack = true,
    pullToRefresh = true,
    gridRef,
    operationMessageHandler,
    titleBar,
    leftContainer,
    leftContainerLines,
    leftContainerProps,
    ...rest
  } = props;

  // Data
  const [data, setData] = React.useState<T>();

  // Labels
  const labels = Labels.CommonPage;

  // Container
  const pullContainer = "#page-container";

  // Load data
  const refresh = React.useCallback(async () => {
    const result = await loadData();
    // When failed or no data returned, show the loading bar
    setData(result);
  }, [loadData]);

  React.useEffect(() => {
    const refreshHandler: RefreshHandler = async () => {
      await refresh();
    };
    MessageUtils.onRefresh(refreshHandler);

    return () => {
      MessageUtils.offRefresh(refreshHandler);
    };
  }, [refresh]);

  return (
    <CommonPage
      paddings={paddings}
      onRefresh={supportRefresh ? refresh : undefined}
      onUpdate={supportRefresh ? undefined : refresh}
      className="ET-ViewPage"
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
          <ViewContainer
            data={data}
            fields={fields}
            gridRef={gridRef}
            leftContainer={leftContainer}
            leftContainerLines={leftContainerLines}
            leftContainerProps={leftContainerProps}
            refresh={refresh}
            spacing={spacing}
          />
          {actions !== null && (
            <ViewPageActionBar actionPaddings={actionPaddings}>
              {Utils.getResult(actions, data, refresh)}
            </ViewPageActionBar>
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
