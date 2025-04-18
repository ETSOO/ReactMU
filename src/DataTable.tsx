import React from "react";
import { useAppContext } from "./app/ReactApp";
import {
  GridCellModesModel,
  GridRowId,
  GridValidRowModel
} from "@mui/x-data-grid/models";
import { DataGridProps } from "@mui/x-data-grid/internals";
import { DataGrid } from "@mui/x-data-grid/DataGrid";

/**
 * Data table selected cell params
 */
export interface DataTableSelectedCellParams {
  id: GridRowId;
  field: string;
  index: number;
}

/**
 * Data table props
 */
export type DataTableProps<R extends GridValidRowModel = any> = Omit<
  DataGridProps<R>,
  "disableColumnMenu"
> & {
  /**
   * Cell selection handler
   * @param params Params
   * @returns Result
   */
  onCellSelection?: (params: DataTableSelectedCellParams) => void | false;
};

/**
 * Data table
 * @param props Props
 * @returns Component
 */
export function DataTable<R extends GridValidRowModel = any>(
  props: DataTableProps<R>
) {
  // Global app
  const app = useAppContext();

  // Destructor
  const {
    localeText = {},
    onCellSelection,
    onProcessRowUpdateError = (error) =>
      console.log("onProcessRowUpdateError", error),
    slotProps,
    ...rest
  } = props;

  // Labels
  const noRows = app?.get("noRows");
  if (noRows && !localeText.noRowsLabel) localeText.noRowsLabel = noRows;

  const [cellModesModel, setCellModesModel] =
    React.useState<GridCellModesModel>({});

  const handleCellFocus = React.useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      // event.target is the element that triggered the event
      // event.currentTarget is the element that the event listener is attached to
      const cell = event.currentTarget;
      const row = cell.parentElement;
      if (row == null) return;

      const id = row.dataset.id;
      const index = row.dataset.rowindex;
      const field = cell.dataset.field;
      if (id == null || index == null || field == null) return;

      const params: DataTableSelectedCellParams = {
        id,
        field,
        index: parseInt(index)
      };

      if (onCellSelection) {
        if (onCellSelection(params) === false) return;
      }
    },
    []
  );

  return (
    <DataGrid
      disableColumnMenu
      hideFooter
      localeText={localeText}
      cellModesModel={cellModesModel}
      onCellModesModelChange={(model) => setCellModesModel(model)}
      onProcessRowUpdateError={onProcessRowUpdateError}
      slotProps={{
        ...slotProps,
        cell: {
          onFocus: handleCellFocus
        }
      }}
      {...rest}
    />
  );
}
