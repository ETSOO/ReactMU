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
export type InputTipFieldProps = InputFieldProps & {
  /**
   * Load data
   * @param value Duplicate test value
   */
  loadData(value: string): Promise<[ItemType[]?, string?]>;

  /**
   * Label props
   */
  labelProps?: Omit<TypographyProps, "onClick">;
};

/**
 * InputField with tips
 * @param props Props
 * @returns Component
 */
export function InputTipField(props: InputTipFieldProps) {
  // State
  const [title, setTitle] = React.useState<string>();
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement>();
  const [data, setData] = React.useState<ItemType[]>();

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
        {data && (
          <List>
            {data.map((item) => (
              <ListItem key={item.id}>{item.label}</ListItem>
            ))}
          </List>
        )}
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
