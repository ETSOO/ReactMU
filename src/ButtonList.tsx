import * as React from "react";
import Button from "@mui/material/Button";
import ButtonGroup, { ButtonGroupProps } from "@mui/material/ButtonGroup";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";

/**
 * Button list item
 */
export type ButtonListItem = {
  /**
   * Label, '-' for divider
   */
  label: string;
  /**
   * Icon
   */
  icon?: React.ReactNode;

  /**
   * Click action
   */
  action?: (item: ButtonListItem, index: number) => void;
};

/**
 * Button list props
 */
export type ButtonListProps = Omit<ButtonGroupProps, "ref"> & {
  /**
   * Check if button is disabled
   * @param index Button index
   * @returns Result
   */
  checkDisable?: (index: number) => boolean;

  /**
   * Button items
   */
  items: ButtonListItem[];

  /**
   * Click button handler
   * @param event Click event
   * @param index Current button index
   */
  onItemClick?: (event: React.MouseEvent, index: number) => void;
};

/**
 * Dropdown button list
 * @param props Props
 * @returns Component
 */
export function ButtonList(props: ButtonListProps) {
  // Destruct
  const { checkDisable, items, onItemClick, ...buttonGroupProps } = props;

  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    handleClickEvent(event, selectedIndex);
  };

  const handleClickEvent = (event: React.MouseEvent, index: number) => {
    onItemClick?.(event, index);

    if (!event.isDefaultPrevented()) {
      const item = items[index];
      item.action?.(item, index);
    }
  };

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    index: number
  ) => {
    setSelectedIndex(index);
    setOpen(false);

    handleClickEvent(event, index);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  return (
    <React.Fragment>
      <ButtonGroup ref={anchorRef} {...buttonGroupProps}>
        <Button
          onClick={(event) => handleClick(event)}
          startIcon={items[selectedIndex].icon}
        >
          {items[selectedIndex].label}
        </Button>
        <Button size="small" onClick={handleToggle}>
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper
        sx={{ zIndex: 1 }}
        open={open}
        anchorEl={anchorRef.current}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === "bottom" ? "center top" : "center bottom"
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList autoFocusItem>
                  {items.map((item, index) => {
                    const label = item.label;

                    if (label === "-") {
                      return <Divider key={index} />;
                    } else {
                      return (
                        <MenuItem
                          key={label}
                          disabled={checkDisable?.(index) ?? false}
                          selected={index === selectedIndex}
                          onClick={(event) => handleMenuItemClick(event, index)}
                        >
                          {item.icon && (
                            <ListItemIcon>{item.icon}</ListItemIcon>
                          )}
                          {item.label}
                        </MenuItem>
                      );
                    }
                  })}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </React.Fragment>
  );
}
