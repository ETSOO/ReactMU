import { UserKey } from "@etsoo/appscript";
import { IStateUpdate, ListItemReact } from "@etsoo/react";
import { ContainerProps, Theme } from "@mui/material";
import { CustomFabSize } from "../CustomFabProps";

/**
 * Common page props
 * Default container id is 'pageContainer'
 */
export interface CommonPageProps extends Omit<ContainerProps, "id"> {
  /**
   * Fab buttons
   */
  fabButtons?: React.ReactNode;

  /**
   * Fab size
   */
  fabSize?: CustomFabSize;

  /**
   * Fab flex column direction, undefined to hide it
   */
  fabColumnDirection?: boolean;

  /**
   * Fab padding adjust
   */
  fabPaddingAdjust?: number;

  /**
   * Add panel to the Fab
   */
  fabPanel?: boolean;

  /**
   * Fab lays in the top
   */
  fabTop?: ((theme: Theme, padding: {}) => object) | boolean;

  /**
   * More actions
   */
  moreActions?: ListItemReact[];

  /**
   * On refresh callback, only when authorized = true
   */
  onRefresh?: () => void | PromiseLike<void>;

  /**
   * On page update, when authorized = null or true case, may uses onRefresh
   */
  onUpdate?: () => void | PromiseLike<void>;

  /**
   * On page update, all cases with authorized
   */
  onUpdateAll?: IStateUpdate;

  /**
   * Paddings
   */
  paddings?: Record<string, string | number>;

  /**
   * Scroll container
   */
  scrollContainer?: HTMLElement | object;

  /**
   * Support back click
   */
  supportBack?: boolean;

  /**
   * State last changed fields
   */
  targetFields?: UserKey[];
}
