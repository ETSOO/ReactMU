import { Utils } from '@etsoo/shared';
import { Box, BoxProps, Tab, TabProps, Tabs, TabsProps } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Tab with box panel props
 */
export interface TabBoxPanel extends Omit<TabProps, 'value' | 'children'> {
    /**
     * Children
     */
    children?: ((visible: boolean) => React.ReactNode) | React.ReactNode;

    /**
     * Panel box props
     */
    panel?: Omit<BoxProps, 'hidden'>;

    /**
     * To URL
     */
    to?: string;
}

/**
 * Tabs with box props
 */
export interface TabBoxPros extends BoxProps {
    /**
     * Container props
     */
    container?: Omit<TabsProps, 'value'>;

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
            {inputName && (
                <input type="hidden" name={inputName} value={value} />
            )}
            <Box {...root}>
                <Tabs
                    value={value}
                    onChange={(event, newValue) => {
                        setValue(newValue);
                        if (onChange) onChange(event, newValue);
                    }}
                    {...rest}
                >
                    {tabs.map(({ children, panel, ...tabRest }, index) => (
                        <Tab
                            key={index}
                            value={index}
                            LinkComponent={tabRest.to ? Link : undefined}
                            {...tabRest}
                        />
                    ))}
                </Tabs>
            </Box>
            {tabs.map(({ children, panel }, index) => (
                <Box key={index} hidden={value !== index} {...panel}>
                    {Utils.getResult(children, value === index)}
                </Box>
            ))}
        </React.Fragment>
    );
}
