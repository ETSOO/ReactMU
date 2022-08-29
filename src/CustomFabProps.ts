import { FabPropsColorOverrides, PropTypes } from '@mui/material';
import { OverridableStringUnion } from '@mui/types';

/**
 * Custom fab size
 */
export type CustomFabSize = 'small' | 'medium' | 'large';

/**
 * Custom fab props
 */
export interface CustomFabProps {
    /**
     * Color
     */
    color?: OverridableStringUnion<PropTypes.Color, FabPropsColorOverrides>;

    /**
     * Fab size
     */
    size?: CustomFabSize;

    /**
     * Scroll target
     */
    target?: any;

    /**
     * Fab title
     */
    title?: string;
}
