import type {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  UniqueIdentifier
} from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable/dist/components/SortableContext";
import { useSortable } from "@dnd-kit/sortable/dist/hooks/useSortable";
import { horizontalListSortingStrategy } from "@dnd-kit/sortable/dist/strategies/horizontalListSorting";
import { rectSortingStrategy } from "@dnd-kit/sortable/dist/strategies/rectSorting";
import { rectSwappingStrategy } from "@dnd-kit/sortable/dist/strategies/rectSwapping";
import { verticalListSortingStrategy } from "@dnd-kit/sortable/dist/strategies/verticalListSorting";
import { SortingStrategy } from "@dnd-kit/sortable/dist/types/strategies";
import type { CSS } from "@dnd-kit/utilities";
import { DataTypes } from "@etsoo/shared";
import Skeleton from "@mui/material/Skeleton";
import { Theme, useTheme } from "@mui/material/styles";
import React, { CSSProperties } from "react";

function SortableItem(props: {
  id: UniqueIdentifier;
  useSortableType: typeof useSortable;
  CSSType: typeof CSS;
  itemRenderer: (
    nodeRef: React.ComponentProps<any>,
    actionNodeRef: React.ComponentProps<any>
  ) => React.ReactElement;
  style?: React.CSSProperties;
}) {
  // Destruct
  const { id, useSortableType, CSSType, itemRenderer, style = {} } = props;

  // Use sortable
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    setActivatorNodeRef
  } = useSortableType({ id });

  const allStyle = {
    ...style,
    transform: CSSType.Transform.toString(transform),
    transition
  };

  const nodeRef = {
    style: allStyle,
    ref: setNodeRef,
    ...attributes
  };

  const actionNodeRef = {
    ...listeners,
    ref: setActivatorNodeRef
  };

  return itemRenderer(nodeRef, actionNodeRef);
}

/**
 * DnD item default style
 * @param index Item index
 * @param isDragging Is dragging
 * @param theme Theme
 * @returns Style
 */
export const DnDItemStyle = (
  index: number,
  isDragging: boolean,
  theme: Theme
) => ({
  padding: theme.spacing(1),
  zIndex: isDragging ? 1 : "auto",
  background: isDragging
    ? theme.palette.primary.light
    : index % 2 === 0
    ? theme.palette.grey[100]
    : theme.palette.grey[50]
});

/**
 * DnD list forward ref
 */
export interface DnDListRef<D extends object> {
  /**
   * Add item
   * @param item New item
   */
  addItem(item: D): void;

  /**
   * Add items
   * @param items items
   */
  addItems(items: D[]): void;

  /**
   * Delete item
   * @param index Item index
   */
  deleteItem(index: number): void;

  /**
   * Edit item
   * @param newItem New item
   * @param index Index
   */
  editItem(newItem: D, index: number): boolean;

  /**
   * Get all items
   */
  getItems(): D[];
}

/**
 * DnD sortable list properties
 */
export interface DnDListPros<D extends { id: UniqueIdentifier }> {
  /**
   * Get list item style callback
   */
  getItemStyle?: (index: number, isDragging: boolean) => CSSProperties;

  /**
   * Item renderer
   */
  itemRenderer: (
    item: D,
    index: number,
    nodeRef: React.ComponentProps<any>,
    actionNodeRef: React.ComponentProps<any>
  ) => React.ReactElement;

  /**
   * Height
   */
  height?: string | number;

  /**
   * List items
   */
  items: D[];

  /**
   * Label field
   */
  labelField: DataTypes.Keys<D>;

  /**
   * Methods ref
   */
  mRef?: React.Ref<DnDListRef<D>>;

  /**
   * Sorting strategy
   */
  sortingStrategy?:
    | "rect"
    | "vertical"
    | "horizontal"
    | "rectSwapping"
    | (() => SortingStrategy);

  /**
   * Data change handler
   */
  onChange?: (items: D[]) => void;

  /**
   * Form data change handler
   */
  onFormChange?: (items: D[]) => void;

  /**
   * Drag end handler
   */
  onDragEnd?: (items: D[]) => void;
}

/**
 * DnD (Drag and Drop) sortable list
 * @param props Props
 * @returns Component
 */
export function DnDList<D extends { id: UniqueIdentifier }>(
  props: DnDListPros<D>
) {
  // Destruct
  const {
    height = 360,
    itemRenderer,
    labelField,
    mRef,
    sortingStrategy,
    onChange,
    onFormChange,
    onDragEnd
  } = props;

  // Theme
  const theme = useTheme();

  // States
  const [items, setItems] = React.useState<D[]>([]);
  const [activeId, setActiveId] = React.useState<UniqueIdentifier>();

  React.useEffect(() => {
    setItems(props.items);
  }, [props.items]);

  const doFormChange = React.useCallback(
    (newItems?: D[]) => {
      if (onFormChange) onFormChange(newItems ?? items);
    },
    [items, onFormChange]
  );

  const changeItems = React.useCallback(
    (newItems: D[]) => {
      // Possible to alter items with the handler
      if (onChange) onChange(newItems);

      doFormChange(newItems);

      // Update state
      setItems(newItems);
    },
    [onChange, doFormChange]
  );

  // Methods
  React.useImperativeHandle(
    mRef,
    () => {
      return {
        addItem(newItem: D) {
          // Existence check
          if (items.some((item) => item[labelField] === newItem[labelField])) {
            return false;
          }

          // Clone
          const newItems = [newItem, ...items];

          // Update the state
          changeItems(newItems);

          return true;
        },

        addItems(inputItems: D[]) {
          // Clone
          const newItems = [...items];

          // Insert items
          inputItems.forEach((newItem) => {
            // Existence check
            if (
              newItems.some((item) => item[labelField] === newItem[labelField])
            ) {
              return;
            }

            newItems.push(newItem);
          });

          // Update the state
          changeItems(newItems);

          return newItems.length - items.length;
        },

        editItem(newItem: D, index: number) {
          // Existence check
          const newIndex = items.findIndex(
            (item) => item[labelField] === newItem[labelField]
          );
          if (newIndex >= 0 && newIndex !== index) {
            // Label field is the same with a different item
            return false;
          }

          // Clone
          const newItems = [...items];

          // Remove the item
          newItems.splice(index, 1, newItem);

          // Update the state
          changeItems(newItems);

          return true;
        },

        deleteItem(index: number) {
          // Clone
          const newItems = [...items];

          // Remove the item
          newItems.splice(index, 1);

          // Update the state
          changeItems(newItems);
        },

        getItems() {
          return items;
        }
      };
    },
    [items, labelField, changeItems]
  );

  // Dynamic import library
  const [dnd, setDnd] =
    React.useState<
      [
        typeof DndContext,
        typeof SortableContext,
        typeof useSortable,
        typeof rectSortingStrategy,
        typeof rectSwappingStrategy,
        typeof horizontalListSortingStrategy,
        typeof verticalListSortingStrategy,
        typeof CSS
      ]
    >();

  React.useEffect(() => {
    Promise.all([
      import("@dnd-kit/core"),
      import("@dnd-kit/sortable"),
      import("@dnd-kit/utilities")
    ]).then(
      ([
        { DndContext },
        {
          SortableContext,
          useSortable,
          rectSortingStrategy,
          rectSwappingStrategy,
          horizontalListSortingStrategy,
          verticalListSortingStrategy
        },
        { CSS }
      ]) => {
        setDnd([
          DndContext,
          SortableContext,
          useSortable,
          rectSortingStrategy,
          rectSwappingStrategy,
          horizontalListSortingStrategy,
          verticalListSortingStrategy,
          CSS
        ]);
      }
    );
  }, []);

  const doChange = React.useCallback(() => doFormChange(), []);

  const setupDiv = (div: HTMLDivElement, clearup: boolean = false) => {
    // Inputs
    div
      .querySelectorAll("input")
      .forEach((input) =>
        clearup
          ? input.removeEventListener("change", doChange)
          : input.addEventListener("change", doChange)
      );

    // Textareas
    div
      .querySelectorAll("textarea")
      .forEach((input) =>
        clearup
          ? input.removeEventListener("change", doChange)
          : input.addEventListener("change", doChange)
      );

    // Select
    div
      .querySelectorAll("select")
      .forEach((input) =>
        clearup
          ? input.removeEventListener("change", doChange)
          : input.addEventListener("change", doChange)
      );
  };

  const divRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (divRef.current) {
      setupDiv(divRef.current);
    }

    return () => {
      if (divRef.current) {
        setupDiv(divRef.current, true);
      }
    };
  }, []);

  if (dnd == null) {
    return <Skeleton variant="rectangular" width="100%" height={height} />;
  }

  const [
    DndContextType,
    SortableContextType,
    useSortableType,
    rectSortingStrategyType,
    rectSwappingStrategyType,
    horizontalListSortingStrategyType,
    verticalListSortingStrategyType,
    CSSType
  ] = dnd;

  const strategy: SortingStrategy | undefined =
    typeof sortingStrategy === "function"
      ? sortingStrategy()
      : sortingStrategy === "rect"
      ? rectSortingStrategyType
      : sortingStrategy === "rectSwapping"
      ? rectSwappingStrategyType
      : sortingStrategy === "horizontal"
      ? horizontalListSortingStrategyType
      : sortingStrategy === "vertical"
      ? verticalListSortingStrategyType
      : undefined;

  let getItemStyle = props.getItemStyle;
  if (getItemStyle == null) {
    getItemStyle = (index, isDragging) =>
      DnDItemStyle(index, isDragging, theme);
  }

  // Drag event handlers
  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    setActiveId(active.id);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Indices
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      // Clone
      const newItems = [...items];

      // Removed item
      const [removed] = newItems.splice(oldIndex, 1);

      // Insert to the destination index
      newItems.splice(newIndex, 0, removed);

      changeItems(newItems);

      // Drag end handler
      if (onDragEnd) onDragEnd(newItems);
    }

    setActiveId(undefined);
  }

  const children = (
    <DndContextType onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <SortableContextType items={items} strategy={strategy}>
        {items.map((item, index) => {
          const id = item.id;
          return (
            <SortableItem
              id={id}
              useSortableType={useSortableType}
              CSSType={CSSType}
              key={id}
              style={getItemStyle!(index, id === activeId)}
              itemRenderer={(nodeRef, actionNodeRef) =>
                itemRenderer(item, index, nodeRef, actionNodeRef)
              }
            />
          );
        })}
      </SortableContextType>
    </DndContextType>
  );

  if (onFormChange) {
    return (
      <div style={{ width: "100%" }} ref={divRef}>
        {children}
      </div>
    );
  }

  return children;
}
