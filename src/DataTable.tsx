import {
  DataGrid,
  GridCellModesModel,
  GridRowId,
  GridValidRowModel
} from "@mui/x-data-grid";
import { DataGridProps } from "@mui/x-data-grid/models/props/DataGridProps";
import React from "react";
import { globalApp } from "./app/ReactApp";

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

  /**
   * Toolbar creator
   * @returns Toolbar
   */
  toolbarCreator?: (
    selectedCellParams: DataTableSelectedCellParams | null,
    setCellModesModel: React.Dispatch<React.SetStateAction<GridCellModesModel>>,
    cellModesModel: GridCellModesModel
  ) => React.ReactElement;
};

/**
 * Data table
 * @param props Props
 * @returns Component
 */
export function DataTable<R extends GridValidRowModel = any>(
  props: DataTableProps<R>
) {
  // Destructor
  const {
    localeText = {},
    onCellSelection,
    toolbarCreator,
    onProcessRowUpdateError = (error) =>
      console.log("onProcessRowUpdateError", error),
    ...rest
  } = props;

  // Labels
  const { noRows } = globalApp?.getLabels("noRows") ?? {};
  if (noRows && !localeText.noRowsLabel) localeText.noRowsLabel = noRows;

  const [selectedCellParams, setSelectedCellParams] =
    React.useState<DataTableSelectedCellParams | null>(null);

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

      setSelectedCellParams(params);
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
      slots={{
        toolbar: toolbarCreator
          ? ({ selectedCellParams, setCellModesModel, cellModesModel }) =>
              toolbarCreator(
                selectedCellParams,
                setCellModesModel,
                cellModesModel
              )
          : undefined
      }}
      slotProps={{
        toolbar: {
          selectedCellParams,
          setCellModesModel,
          cellModesModel
        },
        cell: {
          onFocus: handleCellFocus
        }
      }}
      {...rest}
    />
  );
}
