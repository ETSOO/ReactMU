import { Utils } from "@etsoo/shared";
import Box, { BoxProps } from "@mui/material/Box";
import Tab, { TabProps } from "@mui/material/Tab";
import Tabs, { TabsProps } from "@mui/material/Tabs";
import React from "react";

type TabBoxPanelActionType = () => void;

type TabBoxPanelChildrenType =
  | TabBoxPanelActionType
  | ((visible: boolean) => React.ReactNode)
  | React.ReactNode;

function isActionTab(
  children?: TabBoxPanelChildrenType
): children is TabBoxPanelActionType {
  return typeof children === "function" && children.length === 0;
}

/**
 * Tab with box panel props
 */
export interface TabBoxPanel extends Omit<TabProps, "value" | "children"> {
  /**
   * Children
   */
  children: TabBoxPanelChildrenType;

  /**
   * Panel box props
   */
  panelProps?: Omit<BoxProps, "hidden">;
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
            const { children } = tabs[newValue];
            if (isActionTab(children)) {
              children();
            } else {
              setValue(newValue);
              if (onChange) onChange(event, newValue);
            }
          }}
          {...rest}
        >
          {tabs.map(({ children, panelProps, ...tabRest }, index) => (
            <Tab key={index} value={index} {...tabRest} />
          ))}
        </Tabs>
      </Box>
      {tabs.map(({ children, panelProps }, index) => (
        <Box key={index} hidden={value !== index} {...tabProps} {...panelProps}>
          {isActionTab(children) ? (
            <React.Fragment />
          ) : (
            Utils.getResult(children, value === index)
          )}
        </Box>
      ))}
    </React.Fragment>
  );
}
