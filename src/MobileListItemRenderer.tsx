import { ListItemReact } from "@etsoo/react";
import React from "react";
import { MoreFab } from "./MoreFab";
import LinearProgress from "@mui/material/LinearProgress";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import { ScrollerListExItemRendererProps } from "./ScrollerListEx";
import { SxProps, Theme } from "@mui/material/styles";

/**
 * Default mobile list item renderer
 * @param param0 List renderer props
 * @param margin Margin
 * @param renderer Renderer for card content
 * @param cellSX Cell sx
 * @returns Component
 */
export function MobileListItemRenderer<T>(
  { data }: ScrollerListExItemRendererProps<T>,
  renderer: (
    data: T
  ) => [
    string,
    string | undefined,
    React.ReactNode | (ListItemReact | boolean)[],
    React.ReactNode,
    React.ReactNode?
  ],
  cellSX?: SxProps<Theme>
) {
  // Loading
  if (data == null) return <LinearProgress />;

  // Elements
  const [title, subheader, actions, children, cardActions] = renderer(data);

  return (
    <Card
      sx={{
        height: `calc(100% - 8px)`,
        marginTop: "8px",
        overflow: "auto",
        ...cellSX
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
                vertical: "bottom",
                horizontal: "right"
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right"
              }}
              actions={actions}
            />
          ) : (
            actions
          )
        }
        title={title}
        subheader={subheader}
        slotProps={{
          title: { variant: "body2" },
          subheader: { variant: "caption" }
        }}
      />
      <CardContent>{children}</CardContent>
      {cardActions}
    </Card>
  );
}
