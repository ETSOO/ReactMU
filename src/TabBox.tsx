import { Utils } from "@etsoo/shared";
import Box, { BoxProps } from "@mui/material/Box";
import Tab, { TabProps } from "@mui/material/Tab";
import Tabs, { TabsProps } from "@mui/material/Tabs";
import React from "react";

/**
 * Tab with box panel props
 */
export interface TabBoxPanel extends Omit<TabProps, "value" | "children"> {
  /**
   * Children
   */
  children?: ((visible: boolean) => React.ReactNode) | React.ReactNode;

  /**
   * Panel box props
   */
  panelProps?: Omit<BoxProps, "hidden">;

  /**
   * Tab action
   */
  action?: () => void;
}

/**
 * Tabs with box props
 */
export interface TabBoxPros extends BoxProps {
  /**
   * Container props
   */
  container?: Omit<TabsProps, "value">;

  /**
   * Default selected index
   */
  defaultIndex?: number;

  /**
   * Current index
   */
  index?: number;

  /**
   * Add a hidden input and its name
   */
  inputName?: string;

  /**
   * Root props
   */
  root?: BoxProps;

  /**
   * Shared tab props
   */
  tabProps?: Omit<BoxProps, "hidden">;

  /**
   * Tabs
   */
  tabs: TabBoxPanel[];
}

/**
 * Tabs with box
 * @param props Props
 * @returns Component
 */
export function TabBox(props: TabBoxPros) {
  // Destruct
  const {
    index,
    inputName,
    root,
    container = {},
    defaultIndex = 0,
    tabProps,
    tabs
  } = props;
  const { onChange, ...rest } = container;

  // State
  const [value, setValue] = React.useState(defaultIndex);

  React.useEffect(() => {
    if (index == null) return;
    setValue(index);
  }, [index]);

  // Layout
  return (
    <React.Fragment>
      {inputName && <input type="hidden" name={inputName} value={value} />}
      <Box {...root}>
        <Tabs
          value={value}
          onChange={(event, newValue) => {
            if (tabs[newValue].action) {
              tabs[newValue].action();
            } else {
              setValue(newValue);
              if (onChange) onChange(event, newValue);
            }
          }}
          {...rest}
        >
          {tabs.map(({ action, children, panelProps, ...tabRest }, index) => (
            <Tab key={index} value={index} {...tabRest} />
          ))}
        </Tabs>
      </Box>
      {tabs.map(({ action, children, panelProps }, index) => (
        <Box key={index} hidden={value !== index} {...tabProps} {...panelProps}>
          {action ? (
            <React.Fragment />
          ) : (
            Utils.getResult(children, value === index)
          )}
        </Box>
      ))}
    </React.Fragment>
  );
}
