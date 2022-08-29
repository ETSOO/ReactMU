import {
    DndContext,
    DragEndEvent,
    DragStartEvent,
    UniqueIdentifier
} from '@dnd-kit/core';
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DataTypes } from '@etsoo/shared';
import { Theme, useTheme } from '@mui/material';
import React, { CSSProperties } from 'react';

function SortableItem(props: {
    id: UniqueIdentifier;
    itemRenderer: (
        nodeRef: React.ComponentProps<any>,
        actionNodeRef: React.ComponentProps<any>
    ) => React.ReactElement;
    style?: React.CSSProperties;
}) {
    // Destruct
    const { id, itemRenderer, style = {} } = props;

    // Use sortable
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        setActivatorNodeRef
    } = useSortable({ id });

    const allStyle = {
        ...style,
        transform: CSS.Transform.toString(transform),
        transition
    };

    const nodeRef = {
        style: allStyle,
        ref: setNodeRef,
        ...attributes
    };

    const actionNodeRef = {
        ...listeners,
        ref: setActivatorNodeRef
    };

    return itemRenderer(nodeRef, actionNodeRef);
}

/**
 * DnD item default style
 * @param index Item index
 * @param isDragging Is dragging
 * @param theme Theme
 * @returns Style
 */
export const DnDItemStyle = (
    index: number,
    isDragging: boolean,
    theme: Theme
) => ({
    padding: theme.spacing(1),
    zIndex: isDragging ? 1 : 'auto',
    background: isDragging
        ? theme.palette.primary.light
        : index % 2 === 0
        ? theme.palette.grey[100]
        : theme.palette.grey[50]
});

/**
 * DnD list forward ref
 */
export interface DnDListRef<D extends object> {
    /**
     * Add item
     * @param item New item
     */
    addItem(item: D): void;

    /**
     * Add items
     * @param items items
     */
    addItems(items: D[]): void;

    /**
     * Delete item
     * @param index Item index
     */
    deleteItem(index: number): void;

    /**
     * Edit item
     * @param newItem New item
     * @param index Index
     */
    editItem(newItem: D, index: number): boolean;
}

/**
 * DnD sortable list properties
 */
export interface DnDListPros<D extends object, K extends DataTypes.Keys<D>> {
    /**
     * Get list item style callback
     */
    getItemStyle?: (index: number, isDragging: boolean) => CSSProperties;

    /**
     * Item renderer
     */
    itemRenderer: (
        item: D,
        index: number,
        nodeRef: React.ComponentProps<any>,
        actionNodeRef: React.ComponentProps<any>
    ) => React.ReactElement;

    /**
     * List items
     */
    items: D[];

    /**
     * Unique key field
     */
    keyField: K;

    /**
     * Label field
     */
    labelField: K;

    /**
     * Methods ref
     */
    mRef?: React.Ref<DnDListRef<D>>;

    /**
     * Data change handler
     */
    onChange?: (items: D[]) => void;

    /**
     * Drag end handler
     */
    onDragEnd?: (items: D[]) => void;
}

/**
 * DnD (Drag and Drop) sortable list
 * @param props Props
 * @returns Component
 */
export function DnDList<
    D extends { id: UniqueIdentifier },
    K extends DataTypes.Keys<D, UniqueIdentifier> = DataTypes.Keys<
        D,
        UniqueIdentifier
    >
>(props: DnDListPros<D, K>) {
    // Destruct
    const { keyField, itemRenderer, labelField, mRef, onChange, onDragEnd } =
        props;

    let getItemStyle = props.getItemStyle;
    if (getItemStyle == null) {
        // Theme
        const theme = useTheme();
        getItemStyle = (index, isDragging) =>
            DnDItemStyle(index, isDragging, theme);
    }

    // States
    const [items, setItems] = React.useState<D[]>([]);
    const [activeId, setActiveId] = React.useState<UniqueIdentifier>();

    const changeItems = (newItems: D[]) => {
        // Possible to alter items with the handler
        if (onChange) onChange(newItems);

        // Update state
        setItems(newItems);
    };

    // Drag event handlers
    function handleDragStart(event: DragStartEvent) {
        const { active } = event;
        setActiveId(active.id);
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            // Indices
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);

            // Clone
            const newItems = [...items];

            // Removed item
            const [removed] = newItems.splice(oldIndex, 1);

            // Insert to the destination index
            newItems.splice(newIndex, 0, removed);

            changeItems(newItems);

            // Drag end handler
            if (onDragEnd) onDragEnd(newItems);
        }

        setActiveId(undefined);
    }

    // Methods
    React.useImperativeHandle(
        mRef,
        () => {
            return {
                addItem(newItem: D) {
                    // Existence check
                    if (
                        items.some(
                            (item) => item[labelField] === newItem[labelField]
                        )
                    ) {
                        return false;
                    }

                    // Clone
                    const newItems = [newItem, ...items];

                    // Update the state
                    changeItems(newItems);

                    return true;
                },

                addItems(inputItems: D[]) {
                    // Clone
                    const newItems = [...items];

                    // Insert items
                    inputItems.forEach((newItem) => {
                        // Existence check
                        if (
                            newItems.some(
                                (item) =>
                                    item[labelField] === newItem[labelField]
                            )
                        ) {
                            return;
                        }

                        newItems.push(newItem);
                    });

                    // Update the state
                    changeItems(newItems);

                    return newItems.length - items.length;
                },

                editItem(newItem: D, index: number) {
                    // Existence check
                    const newIndex = items.findIndex(
                        (item) => item[labelField] === newItem[labelField]
                    );
                    if (newIndex >= 0 && newIndex !== index) {
                        // Label field is the same with a different item
                        return false;
                    }

                    // Clone
                    const newItems = [...items];

                    // Remove the item
                    newItems.splice(index, 1, newItem);

                    // Update the state
                    changeItems(newItems);

                    return true;
                },

                deleteItem(index: number) {
                    // Clone
                    const newItems = [...items];

                    // Remove the item
                    newItems.splice(index, 1);

                    // Update the state
                    changeItems(newItems);
                }
            };
        },
        [items]
    );

    React.useEffect(() => {
        setItems(props.items);
    }, [props.items]);

    return (
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <SortableContext
                items={items}
                strategy={verticalListSortingStrategy}
            >
                {items.map((item, index) => {
                    const id = item[keyField] as unknown as UniqueIdentifier;
                    return (
                        <SortableItem
                            id={id}
                            key={id}
                            style={getItemStyle!(index, id === activeId)}
                            itemRenderer={(nodeRef, actionNodeRef) =>
                                itemRenderer(
                                    item,
                                    index,
                                    nodeRef,
                                    actionNodeRef
                                )
                            }
                        />
                    );
                })}
            </SortableContext>
        </DndContext>
    );
}
