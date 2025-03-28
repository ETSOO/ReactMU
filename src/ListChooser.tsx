import { useDelayedExecutor } from "@etsoo/react";
import { DataTypes, DelayedExecutorType, IdDefaultType } from "@etsoo/shared";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import React from "react";
import { VBox } from "./FlexBox";
import ListItemButton, {
  ListItemButtonProps
} from "@mui/material/ListItemButton";
import List, { ListProps } from "@mui/material/List";
import TextField from "@mui/material/TextField";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

type QueryData = {
  title?: string;
};

/**
 * List chooser button props
 */
export interface ListChooserButtonProps<
  T extends object,
  D extends DataTypes.Keys<T>
> {
  (id: T[D]): ListItemButtonProps;
}

/**
 * List chooser props
 */
export type ListChooserProps<
  T extends object,
  D extends DataTypes.Keys<T>,
  Q extends object
> = ListProps & {
  /**
   * Condition field name
   */
  conditionField?: string;

  /**
   * Condition renderer
   */
  conditionRenderer?: (
    rq: Partial<Q>,
    delayed: DelayedExecutorType
  ) => React.ReactNode;

  /**
   * List item renderer
   */
  itemRenderer?: (
    data: T,
    props: ListChooserButtonProps<T, D>
  ) => React.ReactNode;

  /**
   * Label field
   */
  labelField?: DataTypes.Keys<T, string> | ((data: T) => string);

  /**
   * Id field
   */
  idField?: D;

  /**
   * Load data callback
   */
  loadData: (rq: Partial<Q>) => PromiseLike<T[] | null | undefined>;

  /**
   * Multiple selected
   */
  multiple?: boolean;

  /**
   * Item onchange callback
   */
  onItemChange: (items: T[], ids: T[D][]) => void;

  /**
   * Title
   */
  title: string;

  /**
   * Double click enabled
   */
  doubleClickEnabled?: boolean;
};

/**
 * List chooser
 * @param props Props
 * @returns Component
 */
export function ListChooser<
  T extends object,
  D extends DataTypes.Keys<T> = IdDefaultType<T>,
  Q extends object = QueryData
>(props: ListChooserProps<T, D, Q>) {
  // Selected ids state
  const [selectedIds, setSelectedIds] = React.useState<T[D][]>([]);

  const selectProps: ListChooserButtonProps<T, D> = (id: T[D]) => ({
    selected: selectedIds.includes(id),
    onClick: () => {
      if (multiple) {
        const index = selectedIds.indexOf(id);
        if (index === -1) selectedIds.push(id);
        else selectedIds.splice(index, 1);
        setSelectedIds([...selectedIds]);
      } else {
        setSelectedIds([id]);
      }
    }
  });

  // Destruct
  const {
    conditionField = "title",
    conditionRenderer = (rq: Partial<Q>, delayed: DelayedExecutorType) => (
      <TextField
        autoFocus
        margin="dense"
        name={conditionField}
        label={title}
        fullWidth
        variant="standard"
        slotProps={{ htmlInput: { maxLength: 128 } }}
        onChange={(event) => {
          Reflect.set(rq, "title", event.target.value);
          delayed.call();
        }}
      />
    ),
    itemRenderer = (item, selectProps) => {
      const id = item[idField];
      const sp = selectProps(id);
      const label =
        typeof labelField === "function"
          ? labelField(item)
          : (Reflect.get(item, labelField) as React.ReactNode);

      return (
        <ListItem
          disableGutters
          key={`${id}`}
          secondaryAction={
            sp.selected ? <CheckBoxIcon fontSize="small" /> : undefined
          }
        >
          <ListItemButton {...sp}>
            <ListItemText primary={label} />
          </ListItemButton>
        </ListItem>
      );
    },
    idField = "id" as D,
    labelField = "label",
    loadData,
    multiple = false,
    onItemChange,
    title,
    doubleClickEnabled = false,
    onDoubleClick,
    ...rest
  } = props;

  // Default minimum height
  rest.sx ??= { minHeight: "220px" };

  // State
  const [items, setItems] = React.useState<T[]>([]);

  // Query request data
  const mounted = React.useRef<boolean>(false);
  const rq = React.useRef<Partial<Q>>({});

  // Delayed execution
  const delayed = useDelayedExecutor(async () => {
    const result = await loadData(rq.current);
    if (result == null || !mounted.current) return;

    if (
      !multiple &&
      selectedIds.length > 0 &&
      !result.some((item) => selectedIds.includes(item[idField]))
    ) {
      setSelectedIds([]);
    }

    setItems(result);
  }, 480);

  React.useEffect(() => {
    if (!mounted.current) return;
    onItemChange(
      items.filter((item) => selectedIds.includes(item[idField])),
      selectedIds
    );
  }, [selectedIds]);

  React.useEffect(() => {
    mounted.current = true;
    delayed.call(0);
    return () => {
      mounted.current = false;
      delayed.clear();
    };
  }, [delayed]);

  const onDoubleClickLocal = (event: React.MouseEvent<HTMLUListElement>) => {
    if (onDoubleClick) onDoubleClick(event);
    if (doubleClickEnabled) {
      const button = event.currentTarget
        .closest("form")
        ?.elements.namedItem("okButton") as HTMLButtonElement | undefined;
      if (button) {
        button.click();
      }
    }
  };

  // Layout
  return (
    <VBox>
      {conditionRenderer(rq.current, delayed)}
      <List onDoubleClick={onDoubleClickLocal} disablePadding dense {...rest}>
        {items.map((item) => itemRenderer(item, selectProps))}
      </List>
    </VBox>
  );
}
