import { EventWatcher } from "@etsoo/react";
import { IconButton, Menu } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import { UserAvatar } from "../UserAvatar";

/**
 * User menu props
 */
export interface UserMenuProps {
  /**
   * Organization id
   */
  organization: number | undefined;

  /**
   * User name
   */
  name: string;

  /**
   * User avatar
   */
  avatar: string | undefined;

  /**
   * Children
   * @param handleMenuClose Handler
   */
  children(handleMenuClose: () => void): React.ReactNode;
}

export interface UserMenuLocalProps extends Omit<UserMenuProps, "children"> {
  /**
   * Current screen size is down sm
   */
  smDown: boolean;
}

/**
 * Event watcher
 */
export const eventWatcher = new EventWatcher();

const eventWatcherAction = "usermenu.href.transitionend";

/**
 * User menu
 * @param props Props
 * @returns Component
 */
export function UserMenu(props: UserMenuProps) {
  // Destruct
  const { children, name, avatar } = props;

  // User menu anchor
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement>();

  // User menu open or not
  const isMenuOpen = Boolean(anchorEl);

  // Route
  const navigate = useNavigate();

  // User menu
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(undefined);
  };

  const handleClick = async (event: React.MouseEvent<HTMLDivElement>) => {
    handleMenuClose();

    const item = (event.target as HTMLElement)?.closest("li[href]");
    if (item != null) {
      const href = item.getAttribute("href");
      if (href) {
        // Even set transitionDuration = 0, still need to wait a little bit
        eventWatcher.add({
          type: eventWatcherAction,
          action: () => {
            navigate(href!);
          },
          once: true
        });
      }
    }
  };

  return (
    <React.Fragment>
      <IconButton
        edge="end"
        aria-haspopup="true"
        onClick={handleUserMenuOpen}
        color="inherit"
      >
        <UserAvatar title={name} src={avatar} />
      </IconButton>
      <Menu
        PaperProps={{
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
        }}
        disableScrollLock
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right"
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right"
        }}
        open={isMenuOpen}
        onTransitionEnd={() => eventWatcher.do(eventWatcherAction)}
        onClick={handleClick}
        onClose={handleMenuClose}
      >
        {children(handleMenuClose)}
      </Menu>
    </React.Fragment>
  );
}
