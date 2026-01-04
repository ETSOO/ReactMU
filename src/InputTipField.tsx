import { DataTypes, IdType } from "@etsoo/shared";
import Typography, { TypographyProps } from "@mui/material/Typography";
import React from "react";
import { InputField, InputFieldProps } from "./InputField";
import { useAppContext } from "./app/ReactApp";
import ListItem from "@mui/material/ListItem";
import Popover from "@mui/material/Popover";
import List from "@mui/material/List";
import InputAdornment from "@mui/material/InputAdornment";
import { EmailInput } from "./EmailInput";
import { MobileInput } from "./MobileInput";
import { PhoneInput } from "./PhoneInput";

type ItemType = {
  id: IdType;
};

const componentMap = {
  email: EmailInput,
  phone: PhoneInput,
  mobile: MobileInput
};

type ComponentMap = typeof componentMap;
type ComponentKey = keyof ComponentMap;

type ComponentProps<T extends ItemType> = {
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
 * InputField with tips properties
 */
export type InputTipFieldProps<T extends ItemType = ItemType> = {
  /**
   * Component properties
   */
  componentProps: ComponentProps<T>;
} & (
  | ({
      /**
       * Component properties
       */
      componentProps: ComponentProps<T>;
    } & {
      [K in ComponentKey]: {
        /**
         * Component key
         */
        component: K;
      } & Omit<React.ComponentProps<ComponentMap[K]>, "component">;
    }[ComponentKey])
  | ({ component?: "input" } & Omit<InputFieldProps, "component">)
);

/**
 * InputField with tips
 * @param props Props
 * @returns Component
 */
export function InputTipField<T extends ItemType = ItemType>(
  props: InputTipFieldProps<T>
) {
  // Global app
  const app = useAppContext();

  // State
  const [title, setTitle] = React.useState<string>();
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement>();
  const [data, setData] = React.useState<T[]>();

  // Destruct
  const {
    component = "input",
    componentProps,
    changeDelay,
    onChangeDelay,
    fullWidth = true,
    slotProps = {},
    ...rest
  } = props;

  const {
    labelProps = {
      title: app?.get("clickForDetails"),
      sx: { color: (theme) => theme.palette.error.main, cursor: "pointer" }
    },
    loadData,
    itemLabel = (item) => DataTypes.getObjectItemLabel(item),
    renderItem = (item) => <ListItem key={item.id}>{itemLabel(item)}</ListItem>
  } = componentProps;

  const { input, ...slotRests } = slotProps;

  const Component =
    component === "input" ? InputField : componentMap[component];

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
      <Component
        changeDelay={changeDelay}
        fullWidth={fullWidth}
        onChangeDelay={(event) => {
          load(event.target.value);
          if (onChangeDelay) onChangeDelay(event);
        }}
        slotProps={{
          input: {
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
            ) : undefined,
            ...input
          },
          ...slotRests
        }}
        {...rest}
      />
    </React.Fragment>
  );
}
