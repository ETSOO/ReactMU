import React from 'react';
import {
    Dialog,
    DialogTitle,
    List,
    ListItemText,
    DialogContent,
    Button,
    ListItemButton
} from '@mui/material';
import {
    DataTypes,
    IdDefaultType,
    LabelDefaultType,
    ListType
} from '@etsoo/shared';

/**
 * Item list properties
 */
export interface ItemListProps<
    T extends object,
    D extends DataTypes.Keys<T>,
    L extends DataTypes.Keys<T, string>
> {
    /**
     * Style class name
     */
    className?: string;

    /**
     * Id field name
     */
    idField?: D;

    /**
     * Label field name or callback
     */
    labelField?: L | ((item: T) => string);

    /**
     * Button icon
     */
    icon?: React.ReactNode;

    /**
     * Button color
     */
    color?: 'inherit' | 'primary' | 'secondary';

    /**
     * Close event
     */
    onClose?(item: T, changed: boolean): void;

    /**
     * Current selected language
     */
    selectedValue?: T[D];

    /**
     * Button size
     */
    size?: 'small' | 'medium' | 'large';

    /**
     * Title
     */
    title?: string;

    /**
     * Items
     */
    items: T[];

    /**
     * Button variant
     */
    variant?: 'text' | 'outlined' | 'contained';
}

/**
 * Item list component
 * @param props Properties
 */
export function ItemList<
    T extends object = ListType,
    D extends DataTypes.Keys<T> = IdDefaultType<T>,
    L extends DataTypes.Keys<T, string> = LabelDefaultType<T>
>(props: ItemListProps<T, D, L>) {
    //  properties destructure
    const {
        className,
        color = 'primary',
        items,
        idField = 'id' as D,
        labelField = 'label' as L,
        icon,
        onClose,
        selectedValue,
        size = 'medium',
        title,
        variant = 'outlined'
    } = props;

    // Get label
    const getLabel = (item: T): string => {
        if (typeof labelField === 'function') {
            return labelField(item);
        } else {
            return DataTypes.convert(item[labelField], 'string') ?? '';
        }
    };

    // Dialog open or not state
    const [open, setOpen] = React.useState(false);

    // Default state
    const defaultItem =
        items.find((item) => item[idField] === selectedValue) ?? items[0];

    // Current item
    const [currentItem, setCurrentItem] = React.useState(defaultItem);

    // Click handler
    const clickHandler = () => {
        // More than one language
        if (items.length < 2) {
            return;
        }

        // Open the dialog
        setOpen(true);
    };

    // Close handler
    const closeHandler = () => {
        if (!open) return;

        // Close the dialog
        setOpen(false);

        // Emit close event
        if (onClose) {
            onClose(currentItem, false);
        }
    };

    // Close item handler
    const closeItemHandler = (item: any) => {
        // Update the current item
        setCurrentItem(item);

        // Close the dialog
        setOpen(false);

        // Emit close event
        if (onClose) {
            onClose(item, true);
        }
    };

    return (
        <>
            <Button
                className={className}
                variant={variant}
                startIcon={icon}
                color={color}
                size={size}
                onClick={clickHandler}
            >
                {getLabel(currentItem)}
            </Button>
            <Dialog
                aria-labelledby="dialog-title"
                open={open}
                onClose={closeHandler}
            >
                <DialogTitle sx={{ minWidth: '200px' }} id="dialog-title">
                    {title || ''}
                </DialogTitle>
                <DialogContent>
                    <List>
                        {items.map((item) => {
                            const id = item[idField];
                            return (
                                <ListItemButton
                                    key={id as unknown as React.Key}
                                    disabled={id === currentItem[idField]}
                                    onClick={() => closeItemHandler(item)}
                                >
                                    <ListItemText>
                                        {getLabel(item)}
                                    </ListItemText>
                                </ListItemButton>
                            );
                        })}
                    </List>
                </DialogContent>
            </Dialog>
        </>
    );
}
