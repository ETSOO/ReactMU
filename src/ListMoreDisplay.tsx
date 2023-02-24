import { DataTypes } from "@etsoo/shared";
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardProps,
  CircularProgress
} from "@mui/material";
import React from "react";
import {
  GridData,
  GridDataGet,
  GridLoadDataProps,
  GridLoader,
  GridLoaderStates
} from "@etsoo/react";
import { LoadingButton } from "./LoadingButton";
import { globalApp } from "./app/ReactApp";

/**
 * ListMoreDisplay props
 */
export interface ListMoreDisplayProps<
  T extends object,
  F extends DataTypes.BasicTemplate = DataTypes.BasicTemplate
> extends Omit<CardProps, "children">,
    GridLoader<T> {
  /**
   * Batch size to load
   */
  batchSize?: number;

  /**
   * Children to display the list
   */
  children: (data: T, index: number) => React.ReactNode;

  /**
   * Search field template
   */
  fieldTemplate?: F;

  /**
   * Header renderer
   */
  headerRenderer?: (reset: (data?: GridData) => void) => React.ReactNode;

  /**
   * Header title
   */
  headerTitle?: React.ReactNode;

  /**
   * More button label
   */
  moreLabel?: string;
}

type states<T> = {
  items?: T[];
  completed: boolean;
};

/**
 * ListMoreDisplay
 * @param props Props
 * @returns Component
 */
export function ListMoreDisplay<
  T extends object,
  F extends DataTypes.BasicTemplate = DataTypes.BasicTemplate
>(props: ListMoreDisplayProps<T, F>) {
  // Destruct
  const {
    batchSize = 6,
    children,
    defaultOrderBy,
    headerRenderer,
    autoLoad = headerRenderer == null,
    headerTitle,
    loadBatchSize,
    loadData,
    moreLabel = globalApp ? globalApp.get("more") + "..." : undefined,
    fieldTemplate,
    threshold,
    ...rest
  } = props;

  // Refs
  const refs = React.useRef<GridLoaderStates<T>>({
    autoLoad,
    currentPage: 0,
    hasNextPage: true,
    isNextPageLoading: false,
    orderBy: defaultOrderBy,
    batchSize,
    loadedItems: 0,
    selectedItems: [],
    idCache: {}
  });
  const ref = refs.current;

  // States
  const [states, setStates] = React.useReducer(
    (currentStates: states<T>, newStates: Partial<states<T>>) => {
      return { ...currentStates, ...newStates };
    },
    { completed: false }
  );

  // Load data
  const loadDataLocal = async (reset: boolean = false) => {
    // Prevent multiple loadings
    if (!ref.hasNextPage || ref.isNextPageLoading) return;

    // Update state
    ref.isNextPageLoading = true;

    // Parameters
    const { currentPage, batchSize, orderBy, orderByAsc, data } = ref;

    const loadProps: GridLoadDataProps = {
      currentPage,
      batchSize,
      orderBy,
      orderByAsc,
      data
    };

    const mergedData = GridDataGet(loadProps, fieldTemplate);

    const items = await loadData(mergedData);
    if (items == null || ref.isMounted === false) {
      return;
    }
    ref.isMounted = true;

    const newItems = items.length;
    const hasNextPage = newItems >= batchSize;
    ref.lastLoadedItems = newItems;
    ref.isNextPageLoading = false;
    ref.hasNextPage = hasNextPage;

    // Next page
    ref.currentPage = currentPage + 1;

    // Update rows
    if (states.items == null || reset) {
      setStates({ items, completed: !hasNextPage });
    } else {
      setStates({
        items: [...states.items, ...items],
        completed: !hasNextPage
      });
    }
  };

  const reset = (data?: GridData) => {
    // Update the form data
    ref.data = data;

    // Reset page number
    ref.isNextPageLoading = false;
    ref.currentPage = 0;
    ref.hasNextPage = true;

    // Load data
    loadDataLocal(true);
  };

  React.useEffect(() => {
    if (autoLoad) loadDataLocal();
  }, [autoLoad]);

  React.useEffect(() => {
    return () => {
      ref.isMounted = false;
    };
  }, []);

  return (
    <React.Fragment>
      {headerRenderer && headerRenderer(reset)}
      <Card {...rest}>
        <CardHeader title={headerTitle}></CardHeader>
        <CardContent
          sx={{
            paddingTop: 0,
            paddingBottom: states.completed ? 0 : "inherit"
          }}
        >
          {states.items == null ? (
            <CircularProgress size={20} />
          ) : (
            states.items.map((item, index) => children(item, index))
          )}
        </CardContent>
        {!states.completed && (
          <CardActions sx={{ justifyContent: "flex-end" }}>
            <LoadingButton onClick={async () => await loadDataLocal()}>
              {moreLabel}
            </LoadingButton>
          </CardActions>
        )}
      </Card>
    </React.Fragment>
  );
}
