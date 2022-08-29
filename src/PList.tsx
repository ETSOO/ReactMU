import React from 'react';

/**
 * Paragraph items list props
 */
export interface PListProps {
    /**
     * List items
     */
    items?: string[];
}

/**
 * Paragraph items list
 * @param items Items
 */
export function PList(props: PListProps) {
    const { items } = props;
    return (
        <React.Fragment>
            {items != null &&
                items.map((item, index) => {
                    return <p key={index}>{item}</p>;
                })}
        </React.Fragment>
    );
}
