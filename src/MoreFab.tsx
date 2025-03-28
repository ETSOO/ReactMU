import { CustomFabProps } from "./CustomFabProps";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import React from "react";
import { Link } from "react-router";
import { ListItemReact } from "@etsoo/react";
import { PopoverOrigin } from "@mui/material/Popover";
import { PaperProps } from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Fab from "@mui/material/Fab";
import Menu from "@mui/material/Menu";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

/**
 * More fab props
 */
export interface MoreFabProps extends CustomFabProps {
  /**
   * Actions
   */
  actions?: (ListItemReact | boolean)[];

  /**
   * Dray arrow
   */
  drawArrow?: boolean;

  /**
   * Main icon
   */
  icon?: React.ReactNode;

  /**
   * Show as icon button
   */
  iconButton?: boolean;

  /**
   * This is the point on the anchor where the popover's
   * `anchorEl` will attach to
   */
  anchorOrigin?: PopoverOrigin;

  /**
   * Props applied to the [`Paper`](/api/paper/) element.
   * @default {}
   */
  PaperProps?: Partial<PaperProps>;

  /**
   * This is the point on the popover which
   * will attach to the anchor's origin
   */
  transformOrigin?: PopoverOrigin;
}

function getActions(input: (ListItemReact | boolean)[]): ListItemReact[] {
  // Actions
  const actions: ListItemReact[] = [];
  input.forEach((action) => {
    if (typeof action === "boolean") return;
    actions.push(action);
  });
  return actions;
}

/**
 * More fab
 * @returns Component
 */
export function MoreFab(props: MoreFabProps) {
  // Destruct
  const {
    actions,
    drawArrow = true,
    anchorOrigin = {
      vertical: "top",
      horizontal: "right"
    },
    color = "primary",
    icon = <MoreHorizIcon />,
    iconButton = false,
    PaperProps = drawArrow
      ? {
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: -0.4,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1
            },
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0
            }
          }
        }
      : undefined,
    size,
    title,
    transformOrigin = {
      vertical: "bottom",
      horizontal: "right"
    }
  } = props;

  // State
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement>();

  // Open state
  const open = Boolean(anchorEl);

  // Handle click
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle close
  const handleClose = () => {
    setAnchorEl(undefined);
  };

  // No actions
  if (actions == null || actions.length == 0) return <React.Fragment />;

  // Actions
  const actionsLocal = getActions(actions);

  // Has any icon
  const hasIcon = actionsLocal.some((action) => action.icon != null);

  // Main
  const main = iconButton ? (
    <IconButton color={color} size={size} title={title} onClick={handleClick}>
      {icon}
    </IconButton>
  ) : (
    <Fab color={color} size={size} title={title} onClick={handleClick}>
      {icon}
    </Fab>
  );

  return (
    <React.Fragment>
      {main}
      <Menu
        disableScrollLock={true}
        anchorEl={anchorEl}
        anchorOrigin={anchorOrigin}
        keepMounted
        transformOrigin={transformOrigin}
        open={open}
        onClose={handleClose}
        PaperProps={PaperProps}
      >
        {actionsLocal.map(({ label, icon, action }, index) =>
          label === "-" ? (
            <Divider key={index} />
          ) : (
            <MenuItem
              key={label}
              {...(typeof action === "string"
                ? action.includes("://")
                  ? {
                      component: "a",
                      href: action,
                      target: "_blank"
                    }
                  : { component: Link, to: action }
                : Array.isArray(action)
                ? { component: Link, to: action[0], state: action[1] }
                : {
                    onClick: (event: React.MouseEvent) => {
                      handleClose();
                      if (typeof action === "function") action(event);
                    }
                  })}
            >
              {icon != null && <ListItemIcon>{icon}</ListItemIcon>}
              <ListItemText inset={icon == null && hasIcon}>
                {label}
              </ListItemText>
            </MenuItem>
          )
        )}
      </Menu>
    </React.Fragment>
  );
}
