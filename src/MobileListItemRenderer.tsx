import { ListItemReact } from '@etsoo/react';
import { Card, CardContent, CardHeader, LinearProgress } from '@mui/material';
import React from 'react';
import { MoreFab } from './MoreFab';
import { ScrollerListExInnerItemRendererProps } from './ScrollerListEx';

/**
 * Default mobile list item renderer
 * @param param0 List renderer props
 * @param margin Margin
 * @param renderer Renderer for card content
 * @returns Component
 */
export function MobileListItemRenderer<T>(
    { data, itemHeight, margins }: ScrollerListExInnerItemRendererProps<T>,
    renderer: (
        data: T
    ) => [
        string,
        string | undefined,
        React.ReactNode | (ListItemReact | boolean)[],
        React.ReactNode,
        React.ReactNode?
    ]
) {
    // Loading
    if (data == null) return <LinearProgress />;

    // Elements
    const [title, subheader, actions, children, cardActions] = renderer(data);

    return (
        <Card
            sx={{
                height: itemHeight,
                ...margins
            }}
        >
            <CardHeader
                sx={{ paddingBottom: 0.5 }}
                action={
                    Array.isArray(actions) ? (
                        <MoreFab
                            iconButton
                            size="small"
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right'
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right'
                            }}
                            actions={actions}
                        />
                    ) : (
                        actions
                    )
                }
                title={title}
                titleTypographyProps={{ variant: 'body2' }}
                subheader={subheader}
                subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent
                sx={{
                    paddingTop: 0,
                    paddingBottom:
                        cardActions == null
                            ? Reflect.get(margins, 'marginBottom')
                            : 0
                }}
            >
                {children}
            </CardContent>
            {cardActions}
        </Card>
    );
}
