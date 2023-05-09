import React from "react";
import type { Options } from "pulltorefreshjs";
import type PullToRefresh from "pulltorefreshjs";

type p = typeof PullToRefresh;

/**
 * PullToRefresh UI
 * Use hammerjs or touchemulator to simulate browser as mobile device
 * @param props Props
 * @returns Component
 */
export function PullToRefreshUI(props: Options) {
  // Ready
  React.useEffect(() => {
    let pr: p | null;
    import("pulltorefreshjs").then((PullToRefresh) => {
      PullToRefresh.init(props);
      pr = PullToRefresh;
    });

    return () => {
      if (pr) pr.destroyAll();
    };
  }, [props]);

  return <React.Fragment />;
}
