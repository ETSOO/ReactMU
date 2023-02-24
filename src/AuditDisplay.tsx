import { AuditLineDto } from "@etsoo/appscript";
import { Utils } from "@etsoo/shared";
import { Button, Divider, Theme, Typography, useTheme } from "@mui/material";
import React, { CSSProperties } from "react";
import { globalApp } from "./app/ReactApp";
import { ListMoreDisplay, ListMoreDisplayProps } from "./ListMoreDisplay";
import { ShowDataComparison } from "./ShowDataComparison";

/**
 * Audit display props
 */
export interface AuditDisplayProps
  extends Omit<ListMoreDisplayProps<AuditLineDto>, "children"> {
  /**
   * Get list item style callback
   */
  getItemStyle?: (index: number, theme: Theme) => CSSProperties;

  /**
   * Get column label
   */
  getColumnLabel?: (field: string) => string;

  /**
   * Equal check
   */
  equalCheck?: boolean;

  /**
   * Item/line renderer
   */
  itemRenderer?: (data: AuditLineDto, index: number) => React.ReactNode;
}

// Get label
const getLabel = (key: string) => {
  return globalApp?.get(Utils.formatInitial(key)) ?? key;
};

// Format date
const formatDate = (date: Date) => {
  if (globalApp) return globalApp.formatDate(date, "ds");
  return date.toUTCString();
};

/**
 * Audit display
 * @param props Props
 * @returns Component
 */
export function AuditDisplay(props: AuditDisplayProps) {
  // Theme
  const theme = useTheme();

  // Title
  var title = getLabel("dataComparison");

  // Destruct
  const {
    getItemStyle = (index, theme) => ({
      padding: [theme.spacing(1.5), theme.spacing(1)].join(" "),
      background:
        index % 2 === 0 ? theme.palette.grey[100] : theme.palette.grey[50]
    }),
    getColumnLabel,
    equalCheck,
    itemRenderer = (data) => {
      const {
        newData,
        oldData,
        changes = { newData: newData ?? {}, oldData: oldData ?? {} }
      } = data;
      return (
        <React.Fragment>
          {changes != null && (
            <Button
              variant="outlined"
              size="small"
              onClick={() =>
                ShowDataComparison(changes, title, getColumnLabel, equalCheck)
              }
              sx={{
                marginLeft: theme.spacing(1),
                marginTop: theme.spacing(-0.5),
                float: "right"
              }}
            >
              {title}
            </Button>
          )}
          <Typography>
            {formatDate(data.creation) +
              ", [" +
              getLabel(data.action) +
              "], " +
              data.user}
          </Typography>
        </React.Fragment>
      );
    },
    headerTitle = (
      <React.Fragment>
        <Typography>{getLabel("audits")}</Typography>
        <Divider />
      </React.Fragment>
    ),
    ...rest
  } = props;

  // Layout
  return (
    <ListMoreDisplay<AuditLineDto> headerTitle={headerTitle} {...rest}>
      {(data, index) => (
        <div key={data.id} style={getItemStyle(index, theme)}>
          {itemRenderer(data, index)}
        </div>
      )}
    </ListMoreDisplay>
  );
}
