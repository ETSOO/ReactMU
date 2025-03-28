import { DataTypes } from "@etsoo/shared";
import Button, { ButtonProps } from "@mui/material/Button";
import Menu, { MenuProps } from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import React from "react";

export type MenuButtonProps<T extends DataTypes.IdItem> = Omit<
  MenuProps,
  "open"
> & {
  items: T[];
  labelField: DataTypes.Keys<T, string> | ((data: T) => string);
  button:
    | ((
        clickHandler: React.MouseEventHandler<HTMLButtonElement>
      ) => React.ReactNode)
    | ButtonProps;
};

export function MenuButton<T extends DataTypes.IdItem>(
  props: MenuButtonProps<T>
) {
  // Destruct
  const {
    button,
    items,
    labelField,
    anchorOrigin = {
      vertical: "top",
      horizontal: "right"
    },
    transformOrigin = {
      vertical:
        anchorOrigin.vertical === "center"
          ? "center"
          : anchorOrigin.vertical === "top"
          ? "bottom"
          : "top",
      horizontal: anchorOrigin.horizontal
    },
    sx,
    ...rest
  } = props;

  // Top?
  const isTop = transformOrigin.vertical === "top";

  // Menu anchor
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement>();

  // Menu open or not
  const isMenuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(undefined);
  };

  const labelFormatter =
    typeof labelField === "function"
      ? labelField
      : (item: T) => item[labelField] as string;

  return (
    <React.Fragment>
      {typeof button === "function" ? (
        button(handleMenuOpen)
      ) : (
        <Button onClick={handleMenuOpen} {...button} />
      )}

      <Menu
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              "& .MuiAvatar-root": {
                width: 32,
                height: 32
              },
              "&:before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: isTop ? 0 : undefined,
                bottom: isTop ? undefined : -10,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0
              },
              ...{ sx }
            }
          }
        }}
        disableScrollLock
        anchorEl={anchorEl}
        anchorOrigin={anchorOrigin}
        keepMounted
        transformOrigin={transformOrigin}
        open={isMenuOpen}
        transitionDuration={0}
        onClose={handleMenuClose}
        {...rest}
      >
        {items.map((item) => {
          const label = labelFormatter(item);
          return (
            <MenuItem key={item.id} disabled>
              {label}
            </MenuItem>
          );
        })}
      </Menu>
    </React.Fragment>
  );
}
