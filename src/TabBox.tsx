import { useSearchParamsEx1 } from "@etsoo/react";
import { Utils } from "@etsoo/shared";
import Box, { BoxProps } from "@mui/material/Box";
import Tab, { TabProps } from "@mui/material/Tab";
import Tabs, { TabsProps } from "@mui/material/Tabs";
import React from "react";

type TabBoxPanelActionType = () => void;

type TabBoxPanelChildrenType =
  | TabBoxPanelActionType
  | ((visible: boolean, index: number) => React.ReactNode)
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
export interface TabBoxProps extends Omit<TabsProps, "value"> {
  /**
   * Default selected index
   */
  defaultIndex?: number;

  /**
   * Current index
   */
  index?: number;

  /**
   * Index field of the search params
   * @default 'index'
   */
  indexField?: string;

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
export function TabBox(props: TabBoxProps) {
  // Destruct
  const {
    index,
    indexField = "index",
    inputName,
    root,
    defaultIndex = 0,
    onChange,
    tabProps,
    tabs,
    ...rest
  } = props;

  // State
  const [params, setSearchParams] = useSearchParamsEx1({
    [indexField]: "number"
  });
  const [value, setValue] = React.useState(params[indexField] ?? defaultIndex);

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
            setSearchParams((prev) => {
              if (newValue == defaultIndex) prev.delete(indexField);
              else prev.set(indexField, newValue);
              return prev;
            });
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
            Utils.getResult(children, value === index, index)
          )}
        </Box>
      ))}
    </React.Fragment>
  );
}
