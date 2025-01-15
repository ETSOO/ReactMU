import { DataTable, DataTableProps } from "./DataTable";
import React from "react";
import { ListType1 } from "@etsoo/shared";
import { GridRenderCellParams } from "@mui/x-data-grid";
import { useAppContext } from "./app/ReactApp";

/**
 * Culture table props
 */
export type CultureDataTableProps = Omit<DataTableProps, "columns"> & {
  cultures: ListType1[];
  cultureLabel?: string;
  editable?: boolean;
  titleLabel?: string;
  hasDescription?: boolean;
  descriptionLabel?: string;
};

/**
 * Culture DataTable
 * @param props Props
 * @returns Component
 */
export function CultureDataTable(props: CultureDataTableProps) {
  // Global app
  const app = useAppContext();

  // Destruct
  const {
    cultures,
    cultureLabel = app?.get("culture"),
    editable = true,
    titleLabel,
    hasDescription = false,
    descriptionLabel = app?.get("description"),
    ...rest
  } = props;

  const getCultureLabel = React.useCallback(
    (value: GridRenderCellParams) =>
      cultures.find((c) => c.id == value.id)?.label ?? `${value.value}`,
    [cultures]
  );

  return (
    <DataTable
      columns={[
        {
          field: "id",
          headerName: cultureLabel,
          renderCell: getCultureLabel,
          width: 150,
          editable: false,
          sortable: false
        },
        {
          field: "title",
          headerName: titleLabel,
          flex: 1,
          editable,
          sortable: false
        },
        ...(hasDescription
          ? [
              {
                field: "description",
                headerName: descriptionLabel,
                flex: 1,
                editable,
                sortable: false
              }
            ]
          : [])
      ]}
      {...rest}
    />
  );
}
