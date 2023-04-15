import React from "react";
import { FabBox } from "../FabBox";
import { ScrollTopFab } from "../ScrollTopFab";
import { MUGlobal } from "../MUGlobal";
import { CommonPageProps } from "./CommonPageProps";
import { MoreFab } from "../MoreFab";
import { Container, Fab, useTheme } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { BackButton } from "../BackButton";
import { Labels } from "../app/Labels";
import { ReactAppStateDetector } from "../app/ReactApp";

/**
 * Default scroll container
 */
export const CommonPageScrollContainer = global;

/**
 * Common page
 * @param props Props
 */
export function CommonPage(props: CommonPageProps) {
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

  // Update
  const update = onUpdateAll
    ? onUpdateAll
    : onUpdate
    ? (authorized?: boolean) => {
        if (authorized == null || authorized) onUpdate();
      }
    : onRefresh
    ? (authorized?: boolean) => {
        if (authorized) onRefresh();
      }
    : undefined;

  const theme = useTheme();
  const distance = React.useMemo(
    () => MUGlobal.updateWithTheme(fabPadding, theme.spacing),
    [fabPadding, theme.spacing]
  );

  // Return the UI
  return (
    <React.Fragment>
      {update && (
        <ReactAppStateDetector targetFields={targetFields} update={update} />
      )}
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
          {onRefresh != null && (
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
