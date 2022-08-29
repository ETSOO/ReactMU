import React from 'react';
import PullToRefresh, { Options } from 'pulltorefreshjs';

/**
 * PullToRefresh UI
 * Use hammerjs or touchemulator to simulate browser as mobile device
 * @param props Props
 * @returns Component
 */
export function PullToRefreshUI(props: Options) {
    // Ready
    React.useEffect(() => {
        PullToRefresh.init(props);

        return () => {
            PullToRefresh.destroyAll();
        };
    }, [props]);

    return <React.Fragment />;
}
