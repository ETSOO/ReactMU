import { TextFieldProps } from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import { CustomFieldData, CustomFieldSpaceValues } from "@etsoo/appscript";
import Button from "@mui/material/Button";
import { Typography } from "@mui/material";
import { DataTypes, DomUtils } from "@etsoo/shared";
import { CustomFieldUtils } from "./CustomFieldUtils";
import { ComboBox } from "../ComboBox";
import { InputField } from "../InputField";
import { JsonTextField } from "../JsonTextField";
import { HBox } from "../FlexBox";
import { DnDSortableList } from "../DnDSortableList";
import { useRequiredAppContext } from "../app/ReactApp";

const size = { xs: 6, sm: 4, lg: 3, xl: 2 };
const smallSize = { xs: 3, sm: 2, xl: 1 };

const random4Digit = (): number => {
  return Math.floor(1000 + Math.random() * 9000);
};

const isCamelCase = (name: string): boolean => {
  return /^[a-z][a-zA-Z0-9]*$/.test(name);
};

function InputItemUIs({ data }: { data?: CustomFieldData }) {
  // Global app
  const app = useRequiredAppContext();

  // Labels
  const labels = app.getLabels(
    "gridItemProps",
    "helperText",
    "label",
    "mainSlotProps",
    "nameB",
    "options",
    "optionsFormat",
    "refs",
    "size",
    "type"
  );

  const types = Object.keys(CustomFieldUtils.customFieldCreators);

  const nameRef = React.useRef<HTMLInputElement>(null);
  const optionsRef = React.useRef<HTMLInputElement>(null);

  return (
    <Grid container spacing={2} marginTop={1}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <ComboBox
          name="type"
          label={labels.type}
          inputRequired
          size="small"
          loadData={() =>
            Promise.resolve(types.map((t) => ({ id: t, label: t })))
          }
          onValueChange={(item) => {
            const type = item?.id;
            optionsRef.current!.disabled =
              type !== "combobox" && type !== "select";

            const nameInput = nameRef.current!;
            if (
              nameInput.value === "" &&
              (type === "amountlabel" || type === "divider" || type === "label")
            ) {
              nameInput.value = type + random4Digit();
            }
          }}
          idValue={data?.type}
          fullWidth
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <ComboBox
          name="space"
          label={labels.size}
          inputRequired
          size="small"
          loadData={() =>
            Promise.resolve(
              CustomFieldSpaceValues.map((t) => ({ id: t, label: t }))
            )
          }
          idValue={data?.space}
          fullWidth
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <InputField
          fullWidth
          required
          name="name"
          size="small"
          inputRef={nameRef}
          slotProps={{ htmlInput: { maxLength: 128, readOnly: !!data } }}
          label={labels.nameB}
          defaultValue={data?.name ?? ""}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <InputField
          fullWidth
          name="label"
          size="small"
          slotProps={{ htmlInput: { maxLength: 128 } }}
          label={labels.label}
          defaultValue={data?.label ?? ""}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 12 }}>
        <InputField
          fullWidth
          name="helperText"
          size="small"
          label={labels.helperText}
          defaultValue={data?.helperText ?? ""}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 12 }}>
        <InputField
          fullWidth
          name="options"
          size="small"
          multiline
          rows={2}
          label={labels.options}
          inputRef={optionsRef}
          helperText={labels.optionsFormat}
          slotProps={{ htmlInput: { disabled: true } }}
          defaultValue={
            data?.options
              ? data.options
                  .map((o) => `${o.id}=${DataTypes.getListItemLabel(o)}`)
                  .join("\n")
              : ""
          }
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 12 }}>
        <JsonTextField
          isArray
          name="refs"
          size="small"
          multiline={false}
          label={labels.refs + " (JSON)"}
          defaultValue={data?.refs ? JSON.stringify(data.refs) : ""}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 12 }}>
        <JsonTextField
          name="gridItemProps"
          size="small"
          multiline={false}
          label={labels.gridItemProps + " (JSON)"}
          defaultValue={
            data?.gridItemProps ? JSON.stringify(data.gridItemProps) : ""
          }
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 12 }}>
        <JsonTextField
          name="mainSlotProps"
          size="small"
          multiline={false}
          label={labels.mainSlotProps + " (JSON)"}
          defaultValue={
            data?.mainSlotProps ? JSON.stringify(data.mainSlotProps) : ""
          }
          helperText='{"required":true}'
        />
      </Grid>
    </Grid>
  );
}

function InputUIs({
  source,
  onChange
}: {
  source?: string;
  onChange: (items: CustomFieldData[]) => void;
}) {
  // Global app
  const app = useRequiredAppContext();

  // Labels
  const labels = app.getLabels(
    "add",
    "delete",
    "edit",
    "sortTip",
    "dragIndicator"
  );

  const [items, setItems] = React.useState<CustomFieldData[]>([]);

  const doChange = (items: CustomFieldData[]) => {
    setItems(items);
    onChange(items);
  };

  const editItem = (item?: CustomFieldData) => {
    app.showInputDialog({
      title: item ? labels.edit : labels.add,
      message: "",
      callback: async (form) => {
        // Cancelled
        if (form == null) {
          return;
        }

        // Validate form
        if (!form.reportValidity()) {
          return false;
        }

        // Form data
        const {
          typeInput: type,
          spaceInput: space,
          name,
          label,
          helperText,
          options,
          refs,
          gridItemProps,
          mainSlotProps
        } = DomUtils.dataAs(new FormData(form), {
          typeInput: "string",
          spaceInput: "string",
          name: "string",
          label: "string",
          helperText: "string",
          options: "string",
          refs: "string",
          gridItemProps: "string",
          mainSlotProps: "string"
        });

        if (!type || !space || !name) {
          return app.get("noData");
        }

        if (!isCamelCase(name)) {
          DomUtils.setFocus("name", form);
          return app.get("invalidNaming") + " (camelCase)";
        }

        if (type !== "divider" && !label) {
          DomUtils.setFocus("label", form);
          return false;
        }

        if (item == null && items.some((item) => item.name === name)) {
          return app.get("itemExists")?.format(name);
        }

        const optionsJson = options
          ? options.split("\n").map((line) => {
              const [id, ...labelParts] = line.split("=");
              return { id, label: labelParts.join("=") };
            })
          : undefined;

        const refsJson = refs ? JSON.parse(refs) : undefined;
        const gridItemPropsJson = gridItemProps
          ? JSON.parse(gridItemProps)
          : undefined;
        const mainSlotPropsJson = mainSlotProps
          ? JSON.parse(mainSlotProps)
          : undefined;

        if (item == null) {
          const newItem: CustomFieldData = {
            type,
            name,
            space: space as CustomFieldData["space"],
            label,
            helperText,
            options: optionsJson,
            refs: refsJson,
            gridItemProps: gridItemPropsJson,
            mainSlotProps: mainSlotPropsJson
          };

          doChange([...items, newItem]);
        } else {
          item.type = type;
          item.space = space as CustomFieldData["space"];
          item.name = name;
          item.label = label;
          item.helperText = helperText;
          item.options = optionsJson;
          item.refs = refsJson;
          item.gridItemProps = gridItemPropsJson;
          item.mainSlotProps = mainSlotPropsJson;

          doChange([...items]);
        }

        return;
      },
      inputs: <InputItemUIs data={item} />
    });
  };

  React.useEffect(() => {
    try {
      if (source) {
        const parsed = JSON.parse(source);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to parse source:", error);
    }
  }, [source]);

  return (
    <React.Fragment>
      <HBox marginBottom={0.5} gap={1} alignItems="center">
        <Typography>{labels.sortTip}</Typography>
        <Button
          size="small"
          color="primary"
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => editItem()}
        >
          {labels.add}
        </Button>
      </HBox>
      <Card>
        <CardContent>
          <Grid container spacing={0}>
            <DnDSortableList<CustomFieldData>
              items={items}
              idField={(item) => item.name!}
              labelField={(item) => item.label || item.name!}
              onChange={(items) => doChange(items)}
              itemRenderer={(
                data,
                style,
                { sortable: { index }, ref, handleRef }
              ) => (
                <Grid
                  container
                  size={{ xs: 12, sm: 12 }}
                  ref={ref}
                  style={style}
                  gap={1}
                >
                  <Grid size={smallSize}>
                    <IconButton
                      style={{ cursor: "move" }}
                      size="small"
                      title={labels.dragIndicator}
                      ref={handleRef}
                    >
                      <DragIndicatorIcon />
                    </IconButton>
                  </Grid>
                  <Grid size={size}>
                    {index + 1} - {data.type} / {data.space}
                  </Grid>
                  <Grid size={size}>
                    {data.name} - {data.label}
                  </Grid>
                  <Grid size={smallSize}>
                    <IconButton
                      size="small"
                      title={labels.delete}
                      onClick={() =>
                        doChange(
                          items.filter((item) => item.name !== data.name)
                        )
                      }
                    >
                      <DeleteIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      title={labels.edit}
                      onClick={() => editItem(data)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              )}
            ></DnDSortableList>
          </Grid>
        </CardContent>
      </Card>
    </React.Fragment>
  );
}

/**
 * Custom attribute area properties
 */
export type CustomAttributeAreaProps = TextFieldProps & {};

/**
 * Custom attribute area
 * @param props Properties
 * @returns Component
 */
export function CustomAttributeArea(props: CustomAttributeAreaProps) {
  // Global app
  const app = useRequiredAppContext();

  // Destruct
  const { label = app.get("attributeDefinition"), ...rest } = props;

  const ref = React.useRef<CustomFieldData[]>([]);

  const showUI = (input: HTMLInputElement) => {
    app.showInputDialog({
      title: label,
      message: "",
      fullScreen: true,
      callback: (form) => {
        if (form == null) {
          return;
        }

        input.value = ref.current.length > 0 ? JSON.stringify(ref.current) : "";
      },
      inputs: (
        <InputUIs
          source={input.value}
          onChange={(items) => (ref.current = items)}
        />
      )
    });
  };

  // Layout
  return <JsonTextField label={label} onEdit={showUI} isArray {...rest} />;
}
