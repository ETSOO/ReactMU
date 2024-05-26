import { AuditLineChangesDto, IApp } from "@etsoo/appscript";
import { NotificationMessageType } from "@etsoo/notificationbase";
import { Utils } from "@etsoo/shared";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from "@mui/material";
import { globalApp } from "./app/ReactApp";

/**
 * Check obj is instance of AuditLineChangesDto
 * @param obj Input
 * @returns Result
 */
export function IsAuditLineUpdateData(obj: any): obj is AuditLineChangesDto {
  return (
    typeof obj === "object" &&
    "oldData" in obj &&
    typeof obj.oldData === "object" &&
    "newData" in obj &&
    typeof obj.newData === "object"
  );
}

// Format value
const formatValue = (value: unknown, app: IApp) => {
  if (value == null) return "";
  if (value instanceof Date) return app.formatDate(value, "ds");
  return `${value}`;
};

/**
 * Show data comparison
 * @param data Data
 * @param modelTitle Model window title
 * @param getLabel Get label callback
 * @param equalCheck Equal check for properties
 */
export const ShowDataComparison = (
  data: AuditLineChangesDto,
  modelTitle?: string,
  getLabel?: (field: string) => string,
  equalCheck: boolean = true
) => {
  // Validate app
  const app = globalApp;
  if (app == null) {
    throw new Error("No globalApp");
  }

  // Labels
  const { dataComparison, field, newValue, oldValue } = app.getLabels(
    "dataComparison",
    "field",
    "newValue",
    "oldValue"
  );

  modelTitle ??= dataComparison;
  getLabel ??= (key) => {
    return app.get(Utils.formatInitial(key)) ?? key;
  };

  const keys = new Set([
    ...Object.keys(data.oldData),
    ...Object.keys(data.newData)
  ]);

  let rows = Array.from(keys).map((field) => ({
    field,
    oldValue: data.oldData[field],
    newValue: data.newData[field]
  }));

  if (equalCheck)
    rows = rows.filter((item) => !Utils.equals(item.oldValue, item.newValue));

  const inputs = (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell width="18%">{field}</TableCell>
          <TableCell width="41%" align="right">
            {oldValue}
          </TableCell>
          <TableCell width="41%" align="right">
            {newValue}
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.field}>
            <TableCell>{getLabel!(row.field)}</TableCell>
            <TableCell align="right">
              {formatValue(row.oldValue, app)}
            </TableCell>
            <TableCell align="right">
              {formatValue(row.newValue, app)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  app.notifier.alert(
    [undefined, modelTitle],
    undefined,
    NotificationMessageType.Info,
    { fullScreen: app.smDown, inputs }
  );
};
