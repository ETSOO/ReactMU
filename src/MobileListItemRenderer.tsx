import { ListItemReact } from "@etsoo/react";
import React from "react";
import { MoreFab } from "./MoreFab";
import LinearProgress from "@mui/material/LinearProgress";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import { ScrollerListExItemRendererProps } from "./ScrollerListEx";

/**
 * Default mobile list item renderer
 * @param param0 List renderer props
 * @param margin Margin
 * @param renderer Renderer for card content
 * @returns Component
 */
export function MobileListItemRenderer<T>(
  { data, margins }: ScrollerListExItemRendererProps<T>,
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
      <CardContent
        sx={{
          paddingTop: 0,
          paddingBottom:
            cardActions == null ? Reflect.get(margins, "marginBottom") ?? 0 : 0
        }}
      >
        {children}
      </CardContent>
      {cardActions}
    </Card>
  );
}
