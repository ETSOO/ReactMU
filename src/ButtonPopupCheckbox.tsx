import Button, { ButtonProps } from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import React from "react";
import { DataTypes, DomUtils, IdType } from "@etsoo/shared";
import FormGroup from "@mui/material/FormGroup";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import AddIcon from "@mui/icons-material/Add";
import IconButton from "@mui/material/IconButton";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import { DnDList, DnDListRef } from "./DnDList";
import { HBox, VBox } from "./FlexBox";
import { useRequiredAppContext } from "./app/ReactApp";

type DnDItemType = {
  id: IdType;
};

export type ButtonPopupCheckboxProps<D extends DnDItemType> = Omit<
  ButtonProps,
  "chidren" | "onClick"
> & {
  /**
   * Add items splitter
   */
  addSplitter?: RegExp;

  /**
   * Input field name
   */
  inputName?: string;

  /**
   * Label
   */
  label?: string;

  /**
   * Label in the end
   */
  labelEnd?: string;

  /**
   * Label field in items
   */
  labelField: DataTypes.Keys<D>;

  /**
   * Label formatter
   * @param item Item to be formatted
   */
  labelFormatter?: (item: D) => string;

  /**
   * Labels
   */
  labels?: {
    dragIndicator?: string;
    add?: string;
    more?: string;
  };

  /**
   * Load data
   */
  loadData: (ids?: D["id"][]) => Promise<D[]>;

  /**
   * On add handler
   * @param ids Ids
   */
  onAdd?: (ids: string[]) => Promise<false | D[]>;

  /**
   * On value change handler
   * @param ids Ids
   */
  onValueChange?: (ids: D["id"][]) => void;

  /**
   * Popup title
   */
  popupTitle?: string;

  /**
   * Popup message
   */
  popupMessage?: string;

  /**
   * The field is required or not
   */
  required?: boolean;

  /**
   * Ids
   */
  ids?: D["id"][];
};

type ButtonPopupListProps<D extends DnDItemType> = Pick<
  ButtonPopupCheckboxProps<D>,
  | "addSplitter"
  | "labelField"
  | "labelFormatter"
  | "labels"
  | "loadData"
  | "onAdd"
  | "ids"
>;

function ButtonPopupList<D extends DnDItemType>(
  props: ButtonPopupListProps<D>
) {
  // Destruct
  const {
    addSplitter = /\s*[,;]\s*/,
    ids,
    labelField,
    labelFormatter = (data) => {
      console.log("data", data);
      if (labelField in data) {
        return data[labelField] as string;
      }

      return data.id.toString();
    },
    labels,
    loadData,
    onAdd
  } = props;

  // Methods
  const dndRef = React.createRef<DnDListRef<D>>();

  // Ref
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    loadData(ids).then((data) => {
      if (data == null || dndRef.current == null) return;
      dndRef.current.addItems(data);
    });
  }, [ids]);

  return (
    <VBox gap={2}>
      <FormGroup>
        <Grid container spacing={0}>
          <DnDList<D>
            items={[]}
            labelField={labelField}
            itemRenderer={(item, index, nodeRef, actionNodeRef) => (
              <Grid
                size={{ xs: 12, md: 6, lg: 4 }}
                display="flex"
                justifyContent="flex-start"
                alignItems="center"
                gap={1}
                {...nodeRef}
              >
                <IconButton
                  style={{ cursor: "move" }}
                  size="small"
                  title={labels?.dragIndicator}
                  {...actionNodeRef}
                >
                  <DragIndicatorIcon />
                </IconButton>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="item"
                      value={item.id}
                      defaultChecked={ids?.includes(item.id)}
                    />
                  }
                  label={`${index + 1}. ${labelFormatter(item)}`}
                />
              </Grid>
            )}
            height={200}
            mRef={dndRef}
          ></DnDList>
        </Grid>
      </FormGroup>
      {onAdd && (
        <HBox gap={1}>
          <TextField
            variant="outlined"
            label={labels?.more}
            fullWidth
            inputRef={inputRef}
          />
          <Button
            sx={{ width: "120px" }}
            variant="contained"
            startIcon={<AddIcon />}
            size="small"
            onClick={async () => {
              if (inputRef.current == null) return;

              const input = inputRef.current.value.trim();
              if (input === "") {
                inputRef.current.focus();
                return;
              }

              const items = dndRef.current?.getItems() ?? [];

              const inputIds = input
                .split(addSplitter)
                .filter((id) => !items.some((item) => item.id == id));

              if (inputIds.length === 0) {
                inputRef.current.focus();
                return;
              }

              const result = await onAdd(inputIds);
              if (result === false) {
                inputRef.current.focus();
                return;
              }

              dndRef.current?.addItems(result);

              inputRef.current.value = "";
              inputRef.current.focus();
            }}
          >
            {labels?.add}
          </Button>
        </HBox>
      )}
    </VBox>
  );
}

export function ButtonPopupCheckbox<D extends DnDItemType>(
  props: ButtonPopupCheckboxProps<D>
) {
  // App
  const app = useRequiredAppContext();

  // Destruct
  const {
    addSplitter,
    ids,
    inputName,
    label,
    labelEnd,
    labelFormatter,
    labelField,
    labels = {},
    loadData,
    onAdd,
    onValueChange,
    popupTitle = label,
    popupMessage,
    required = false,
    sx = { gap: 1, justifyContent: "flex-start" },
    variant = "outlined",
    ...rest
  } = props;

  // Default labels
  if (!labels.add) labels.add = app.get("add");
  if (!labels.dragIndicator) labels.dragIndicator = app.get("dragIndicator");
  if (!labels.more) labels.more = app.get("more");

  // State
  const [values, setValues] = React.useState<D["id"][]>([]);
  React.useEffect(() => {
    if (ids == null) return;
    setValues(ids);
  }, [ids]);

  // Click handler
  const clickHandler = () => {
    app.showInputDialog({
      title: popupTitle,
      message: popupMessage,
      callback: (form) => {
        if (form == null) return;

        // Form data
        const { item = [] } = DomUtils.dataAs(new FormData(form), {
          item: "string[]"
        });

        if (required && item.length === 0) {
          DomUtils.setFocus("item", form);
          return false;
        }

        setValues(item);

        onValueChange?.(item);
      },
      inputs: (
        <ButtonPopupList
          addSplitter={addSplitter}
          ids={values}
          labelFormatter={labelFormatter}
          labelField={labelField}
          labels={labels}
          loadData={loadData}
          onAdd={onAdd}
        />
      ),
      fullScreen: app.smDown
    });
  };

  return (
    <React.Fragment>
      <input
        type="text"
        style={{ position: "absolute", opacity: 0, width: 0 }}
        name={inputName}
        required={required}
        defaultValue={values.join(",")}
      />
      <Button
        variant={variant}
        sx={sx}
        onClick={() => clickHandler()}
        {...rest}
      >
        {label && <Typography variant="body2">{label}:</Typography>}
        {values.map((id) => (
          <Chip key={id} size="small" label={id} />
        ))}
        {labelEnd && <Typography variant="caption">{labelEnd}</Typography>}
      </Button>
    </React.Fragment>
  );
}
