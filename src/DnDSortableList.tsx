import { DataTypes, IdType } from "@etsoo/shared";
import React from "react";
import { CSSProperties, Theme, useTheme } from "@mui/material/styles";
import { useSortable } from "@dnd-kit/react/sortable";
import { DragDropEvents, DragDropProvider } from "@dnd-kit/react";

/**
 * DnD sortable item default style
 * @param index Item index
 * @param isDragging Is dragging
 * @param theme Theme
 * @returns Style
 */
export const DnDSortableItemStyle = (
  index: number,
  isDragging: boolean,
  theme: Theme
) => ({
  padding: theme.spacing(1),
  transform: isDragging ? "scale(1.03)" : "none",
  zIndex: isDragging ? 1 : "auto",
  boxShadow: isDragging
    ? `-1px 0 8px 0 ${theme.palette.grey[400]}, 0px 8px 8px 0 ${theme.palette.grey[200]}`
    : "none",
  background: isDragging
    ? theme.palette.primary.light
    : index % 2 === 0
      ? theme.palette.grey[100]
      : theme.palette.grey[50]
});

/**
 * DnD sortable list forward ref
 */
export interface DnDSortableListRef<D extends object> {
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
 * DnD sortable list props
 */
export type DnDSortableListProps<
  D extends object,
  E extends React.ElementType = React.ElementType
> = {
  /**
   * Component type to render the list into
   * Default is React.Fragment
   */
  component?: E;

  /**
   * Component props
   */
  componentProps?: React.ComponentProps<E>;

  /**
   * List items
   */
  items: D[];

  /**
   * Id field
   */
  idField?: DataTypes.Keys<D> | ((item: D) => IdType);

  /**
   * Label field
   */
  labelField: DataTypes.Keys<D, string> | ((item: D) => string);

  /**
   * Methods ref
   */
  mRef?: React.Ref<DnDSortableListRef<D>>;

  /**
   * Item renderer
   */
  itemRenderer: (
    data: D,
    style: CSSProperties,
    state: ReturnType<typeof useSortable<D>>
  ) => React.ReactElement;

  /**
   * Get list item style callback
   */
  itemStyle?: (index: number, isDragging: boolean) => CSSProperties;

  /**
   * Data change handler
   */
  onChange?: (items: D[]) => void;

  /**
   * Drag start handler
   */
  onDragStart?: (
    items: D[],
    source: Parameters<DragDropEvents["dragstart"]>[0]
  ) => void;

  /**
   * Drag end handler
   */
  onDragEnd?: (
    items: D[],
    ...args: Parameters<DragDropEvents["dragend"]>
  ) => void;
};

type SortableItemProps<D extends object> = {
  id: IdType;
  index: number;
  data: D;
  itemStyle?: (index: number, isDragging: boolean) => CSSProperties;
} & Pick<DnDSortableListProps<D>, "itemRenderer">;

function SortableItem<D extends object>(props: SortableItemProps<D>) {
  const theme = useTheme();
  const {
    id,
    data,
    index,
    itemRenderer,
    itemStyle = (index, isDragging) =>
      DnDSortableItemStyle(index, isDragging, theme)
  } = props;
  const state = useSortable<D>({ id, data, index });
  const style = itemStyle(index, state.isDragging);
  return itemRenderer(data, style, state);
}

/**
 * DnD sortable list component
 * @param props Props
 * @returns Component
 */
export function DnDSortableList<
  D extends object,
  E extends React.ElementType = React.ElementType
>(props: DnDSortableListProps<D, E>) {
  // Destruct
  const Component = props.component || React.Fragment;
  const {
    componentProps,
    idField,
    itemRenderer,
    itemStyle,
    labelField,
    mRef,
    onChange,
    onDragStart,
    onDragEnd
  } = props;

  const idFn =
    typeof idField === "function"
      ? idField
      : (item: D) =>
          !idField
            ? (Reflect.get(item, "id") as IdType)
            : (item[idField] as IdType);

  const labelFn = React.useCallback(
    typeof labelField === "function"
      ? labelField
      : (item: D) => item[labelField] as string,
    [labelField]
  );

  // States
  const [items, setItems] = React.useState<D[]>([]);

  React.useEffect(() => {
    setItems(props.items);
  }, [props.items]);

  const changeItems = React.useCallback(
    (newItems: D[]) => {
      // Possible to alter items with the handler
      onChange?.(newItems);

      // Update state
      setItems(newItems);
    },
    [onChange]
  );

  // Methods
  React.useImperativeHandle(mRef, () => {
    return {
      addItem(newItem: D) {
        // Existence check
        if (items.some((item) => labelFn(item) === labelFn(newItem))) {
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
          if (newItems.some((item) => labelFn(item) === labelFn(newItem))) {
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
          (item) => labelFn(item) === labelFn(newItem)
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
  }, [items, labelFn, changeItems]);

  return (
    <DragDropProvider
      onDragStart={(source) => onDragStart?.(items, source)}
      onDragEnd={(source, target) => onDragEnd?.(items, source, target)}
    >
      <Component {...componentProps}>
        {items.map((item, index) => {
          const id = idFn(item);
          return (
            <SortableItem
              key={id}
              id={id}
              index={index}
              data={item}
              itemRenderer={itemRenderer}
              itemStyle={itemStyle}
            />
          );
        })}
      </Component>
    </DragDropProvider>
  );
}
