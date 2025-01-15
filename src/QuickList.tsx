import { DataTypes, ListType2 } from "@etsoo/shared";
import {
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemButtonProps,
  ListItemProps,
  StackProps,
  Typography
} from "@mui/material";
import React from "react";
import { InputField, InputFieldProps } from "./InputField";
import { VBox } from "./FlexBox";
import { useAppContext } from "./app/ReactApp";

/**
 * Quick list props
 */
export type QuickListProps<T extends ListType2 = ListType2> = StackProps & {
  /**
   * Button props
   */
  buttonProps?: ListItemButtonProps;

  /**
   * Label
   */
  label?: string;

  /**
   * No matches label
   */
  noMatchesLabel?: string;

  /**
   * Input field props
   */
  inputProps?: Omit<InputFieldProps, "onChangeDelay">;

  /**
   * Get item label
   * @param item Current item
   * @returns Item label
   */
  itemLabel?: (item: T) => string;

  /**
   * Item renderer
   * @param item Current item
   * @returns UI
   */
  itemRenderer?: (item: T) => React.ReactNode;

  /**
   * List item props
   */
  itemProps?: ListItemProps;

  /**
   * Load data callback
   */
  loadData: (keyword: string | undefined) => PromiseLike<T[] | undefined>;

  /**
   * On item click
   * @param item Clicked item
   */
  onItemClick?: (item: T) => void;
};

/**
 * Quick list
 * @param props Props
 * @returns Component
 */
export function QuickList<T extends ListType2 = ListType2>(
  props: QuickListProps<T>
) {
  // Global app
  const app = useAppContext();

  // Destruct
  const {
    buttonProps = {},
    label,
    inputProps,
    itemLabel = DataTypes.getListItemLabel,
    itemRenderer = (item: T) => itemLabel(item),
    itemProps,
    loadData,
    noMatchesLabel = app?.get("noMatches"),
    gap = 1,
    height = "480px",
    onItemClick,
    ...rest
  } = props;

  const { onClick, ...buttonRest } = buttonProps;

  // States
  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState<T[]>([]);

  const loadDataLocal = (keyword?: string) => {
    setLoading(true);

    loadData(keyword).then((result) => {
      setLoading(false);
      setItems(result ?? []);
    });
  };

  React.useEffect(() => {
    loadDataLocal();
  }, []);

  // Layout
  return (
    <VBox gap={gap} height={height} {...rest}>
      <InputField
        label={label}
        changeDelay={480}
        onChangeDelay={(event) => {
          // Stop bubble
          event.preventDefault();
          event.stopPropagation();
          loadDataLocal(event.target.value);
        }}
        fullWidth
        {...inputProps}
      />
      {loading ? (
        <LinearProgress />
      ) : items.length === 0 ? (
        <Typography textAlign="center">{noMatchesLabel}</Typography>
      ) : (
        <List>
          {items.map((item) => (
            <ListItem key={item.id} disablePadding {...itemProps}>
              <ListItemButton
                onClick={(event) => {
                  if (onClick) onClick(event);
                  if (!event.defaultPrevented && onItemClick) onItemClick(item);
                }}
                {...buttonRest}
              >
                {itemRenderer(item)}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    </VBox>
  );
}
