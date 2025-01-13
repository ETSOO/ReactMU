import React from "react";
import type { Options } from "pulltorefreshjs";
import type PullToRefresh from "pulltorefreshjs";
import { ExtendUtils } from "@etsoo/shared";

type p = typeof PullToRefresh;
let pr: p | null;

/**
 * PullToRefresh UI
 * Use hammerjs or touchemulator to simulate browser as mobile device
 * @param props Props
 * @returns Component
 */
export function PullToRefreshUI(props: Options) {
  // Ready
  React.useEffect(() => {
    if (pr) {
      // Loaded, delay a little bit
      pr.destroyAll();
      ExtendUtils.waitFor(() => {
        pr?.init(props);
      }, 100);
    } else {
      import("pulltorefreshjs").then((PullToRefresh) => {
        pr = PullToRefresh.default;
        pr.init(props);
      });
    }

    return () => {
      if (pr) {
        pr.destroyAll();
      }
    };
  }, [props]);

  return <React.Fragment />;
}
