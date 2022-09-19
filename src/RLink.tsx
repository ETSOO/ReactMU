import { useDelayedExecutor } from '@etsoo/react';
import { Link, LinkProps } from '@mui/material';
import React from 'react';
import { globalApp } from './app/ReactApp';

/**
 * Router Link properties
 */
export type RLinkProps = LinkProps & {
    delay?: number;
};

/**
 * Router Link
 * @param props Props
 * @returns Component
 */
export const RLink = React.forwardRef<HTMLAnchorElement, RLinkProps>(
    (props, ref) => {
        // Destruct
        const { delay = 0, href, target, onClick, ...rest } = props;

        const delayed = useDelayedExecutor((href: string) => {
            // Router push
            globalApp.redirectTo(href);
        }, delay);

        // Click handler
        const onClickLocl = (
            event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
        ) => {
            if (onClick) onClick(event);

            if (
                !event.isDefaultPrevented() &&
                href &&
                (!target || target === '_self') && // Let browser handle "target=_blank" etc
                globalApp
            ) {
                // Prevent href action
                event.preventDefault();

                // Delayed excution
                delayed.call(undefined, href);
            }
        };

        // Clear when exit
        React.useEffect(() => {
            return () => delayed.clear();
        }, [delayed]);

        // Component
        return (
            <Link
                {...rest}
                onClick={onClickLocl}
                href={href}
                target={target}
                ref={ref}
            />
        );
    }
);
