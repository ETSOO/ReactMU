import React from "react";
import { FabBox } from "../FabBox";
import { ScrollTopFab } from "../ScrollTopFab";
import { MUGlobal } from "../MUGlobal";
import { MoreFab } from "../MoreFab";
import RefreshIcon from "@mui/icons-material/Refresh";
import { BackButton } from "../BackButton";
import { Labels } from "../app/Labels";
import type { CustomFabSize } from "../CustomFabProps";
import type { IStateUpdate, ListItemReact } from "@etsoo/react";
import type { UserKey } from "@etsoo/appscript";
import { useAppContext } from "../app/ReactApp";
import Container, { ContainerProps } from "@mui/material/Container";
import { Theme, useTheme } from "@mui/material/styles";
import Fab from "@mui/material/Fab";

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
   * Fab refresh button is supported or not
   */
  fabRefresh?: boolean;

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
  paddings?: number | Record<string, string | number>;

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

/**
 * Common page
 * @param props Props
 */
export function CommonPage(props: CommonPageProps) {
  // Global app
  const app = useAppContext();

  // Destruct
  const {
    children,
    disableGutters = true,
    fabTop,
    fabButtons,
    fabColumnDirection,
    fabPanel,
    fabPaddingAdjust = 1.5,
    fabSize = "small",
    maxWidth = false,
    moreActions,
    onRefresh,
    onUpdate,
    onUpdateAll,
    paddings = MUGlobal.pagePaddings,
    scrollContainer,
    supportBack = false,
    targetFields,
    fabRefresh = onRefresh != null,
    sx = {},
    ...rest
  } = props;

  // Fab padding
  const fabPadding = MUGlobal.increase(MUGlobal.pagePaddings, fabPaddingAdjust);

  if (typeof sx === "object" && sx != null && !Reflect.has(sx, "padding")) {
    // Set default padding
    Reflect.set(sx, "padding", paddings);
  }

  // Labels
  const labels = Labels.CommonPage;

  const theme = useTheme();
  const distance = React.useMemo(
    () => MUGlobal.updateWithTheme(fabPadding, theme.spacing),
    [fabPadding, theme.spacing]
  );

  // Update
  const updateRef = React.useRef(false);
  const update = React.useMemo(
    () =>
      onUpdateAll
        ? onUpdateAll
        : onUpdate
        ? async (authorized?: boolean) => {
            if (authorized == null || authorized) {
              await onUpdate();
              updateRef.current = true;
            }
          }
        : onRefresh
        ? async (authorized?: boolean) => {
            if (authorized) {
              await onRefresh();
              updateRef.current = true;
            }
          }
        : undefined,
    [onUpdateAll, onUpdate, onRefresh]
  );

  React.useEffect(() => {
    if (updateRef.current && update) {
      update(true, []);
    }
  }, [update]);

  // Return the UI
  return (
    <React.Fragment>
      {update && app?.stateDetector({ targetFields, update })}
      <Container
        disableGutters={disableGutters}
        maxWidth={maxWidth}
        sx={sx}
        id="page-container"
        {...rest}
      >
        <FabBox
          sx={{
            zIndex: 1,
            ...(typeof fabTop === "function"
              ? fabTop(theme, fabPadding)
              : fabTop
              ? {
                  top: MUGlobal.updateWithTheme(
                    MUGlobal.increase(fabPadding, 7),
                    theme.spacing
                  ),
                  right: distance
                }
              : {
                  bottom: distance,
                  right: distance
                })
          }}
          columnDirection={fabColumnDirection}
          fabPanel={fabPanel}
        >
          {scrollContainer && (
            <ScrollTopFab
              size={fabSize}
              target={scrollContainer}
              title={labels.scrollTop}
            />
          )}
          {fabButtons}
          {fabRefresh && (
            <Fab
              title={labels.refresh}
              size={fabSize}
              onClick={onRefresh}
              sx={{ display: { xs: "none", md: "inherit" } }}
            >
              <RefreshIcon />
            </Fab>
          )}
          <MoreFab size={fabSize} title={labels.more} actions={moreActions} />
          {supportBack && <BackButton title={labels.back} size={fabSize} />}
        </FabBox>
        {children}
      </Container>
    </React.Fragment>
  );
}
