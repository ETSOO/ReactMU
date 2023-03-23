import { DataTypes } from "@etsoo/shared";
import { InputAdornment, List, ListItem, Popover } from "@mui/material";
import Typography, { TypographyProps } from "@mui/material/Typography";
import React from "react";
import { globalApp } from "./app/ReactApp";
import { InputField, InputFieldProps } from "./InputField";

type ItemType = DataTypes.IdLabelItem<string | number>;

/**
 * InputField with tips properties
 */
export type InputTipFieldProps<T extends ItemType = ItemType> =
  InputFieldProps & {
    /**
     * Load data
     * @param value Duplicate test value
     */
    loadData(value: string): Promise<[T[]?, string?]>;

    /**
     * Label props
     */
    labelProps?: Omit<TypographyProps, "onClick">;

    /**
     * Custom item label
     * @param item List item data
     * @returns Result
     */
    itemLabel?: (item: T) => React.ReactNode;

    /**
     * Custom render item
     * @param item List item data
     * @returns Result
     */
    renderItem?: (item: T) => React.ReactNode;
  };

/**
 * InputField with tips
 * @param props Props
 * @returns Component
 */
export function InputTipField<T extends ItemType = ItemType>(
  props: InputTipFieldProps<T>
) {
  // State
  const [title, setTitle] = React.useState<string>();
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement>();
  const [data, setData] = React.useState<T[]>();

  // Destruct
  const {
    labelProps = {
      title: globalApp?.get("clickForDetails"),
      sx: { color: (theme) => theme.palette.error.main, cursor: "pointer" }
    },
    InputProps = {
      endAdornment: title ? (
        <InputAdornment position="end">
          <Typography
            onClick={(event) => {
              setAnchorEl(event.currentTarget);
            }}
            {...labelProps}
          >
            {title}
          </Typography>
        </InputAdornment>
      ) : undefined
    },
    changeDelay = 480,
    onChangeDelay,
    loadData,
    itemLabel = (item) => item.label,
    renderItem = (item) => <ListItem key={item.id}>{itemLabel(item)}</ListItem>,
    ...rest
  } = props;

  const load = (value: string) => {
    if (value.length < 2) {
      setTitle(undefined);
      return;
    }

    loadData(value).then(([data, title]) => {
      setData(data);
      setTitle(title);
    });
  };

  return (
    <React.Fragment>
      <Popover
        open={anchorEl != null}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(undefined)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left"
        }}
      >
        {data && <List>{data.map((item) => renderItem(item))}</List>}
      </Popover>
      <InputField
        changeDelay={changeDelay}
        onChangeDelay={(event) => {
          load(event.target.value);
          if (onChangeDelay) onChangeDelay(event);
        }}
        InputProps={InputProps}
        {...rest}
      />
    </React.Fragment>
  );
}
