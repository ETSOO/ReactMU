import { IconButton, Menu } from "@mui/material";
import React from "react";
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

  // User menu
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(undefined);
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
        onClick={handleMenuClose}
        onClose={handleMenuClose}
      >
        {children(handleMenuClose)}
      </Menu>
    </React.Fragment>
  );
}
