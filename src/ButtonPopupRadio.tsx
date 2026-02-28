import Button, { ButtonProps } from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import React from "react";
import { DataTypes, IdType, NumberUtils } from "@etsoo/shared";
import Grid, { GridSize } from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import TextField from "@mui/material/TextField";
import FormLabel from "@mui/material/FormLabel";
import RadioGroup from "@mui/material/RadioGroup";
import { HBox, VBox } from "./FlexBox";
import { useRequiredAppContext } from "./app/ReactApp";
import { ResponsiveStyleValue } from "./ResponsiveStyleValue";

type DnDItemType = {
  id: IdType;
};

export type ButtonPopupRadioProps<D extends DnDItemType> = Omit<
  ButtonProps,
  "chidren" | "onClick" | "value"
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
  loadData: D[] | (() => Promise<D[]>);

  /**
   * On add handler
   * @param ids Ids
   */
  onAdd?: (ids: string[]) => Promise<false | D[]>;

  /**
   * On value change handler
   * @param id Id
   */
  onValueChange?: (id: D["id"]) => void;

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
   * Item size
   */
  itemSize?: ResponsiveStyleValue<GridSize>;

  /**
   * Value
   */
  value?: D["id"];
};

type ButtonPopupListProps<D extends DnDItemType> = Pick<
  ButtonPopupRadioProps<D>,
  "addSplitter" | "labels" | "onAdd" | "value" | "itemSize"
> &
  Required<Pick<ButtonPopupRadioProps<D>, "labelFormatter">> & {
    /**
     * Items to be displayed
     */
    items: D[];

    /**
     * On value change handler
     * @param id Id
     */
    onValueChange: (id: D["id"]) => void;
  };

function ButtonPopupList<D extends DnDItemType>(
  props: ButtonPopupListProps<D>
) {
  // Destruct
  const {
    addSplitter = /\s*[,;]\s*/,
    value,
    items,
    labelFormatter,
    labels,
    itemSize = { xs: 12, md: 6, lx: 4 },
    onAdd,
    onValueChange
  } = props;

  // Ref
  const inputRef = React.useRef<HTMLInputElement>(null);

  // State
  const [currentValue, setCurrentValue] = React.useState<D["id"]>();

  React.useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  return (
    <VBox gap={2}>
      <RadioGroup
        value={currentValue ?? ""}
        name="radio-buttons-group"
        onChange={(e, v) => {
          const checked = e.target.checked;
          const value = checked
            ? typeof items[0].id === "number"
              ? NumberUtils.parse(v)
              : v
            : undefined;
          setCurrentValue(value);
          onValueChange(value as D["id"]);
        }}
      >
        <Grid container spacing={0}>
          {items.map((item) => (
            <Grid
              size={itemSize}
              display="flex"
              justifyContent="flex-start"
              alignItems="center"
              gap={1}
              key={item.id}
            >
              <FormControlLabel
                control={<Radio value={item.id} />}
                label={`${labelFormatter(item)}`}
              />
            </Grid>
          ))}
        </Grid>
      </RadioGroup>
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

export function ButtonPopupRadio<D extends DnDItemType>(
  props: ButtonPopupRadioProps<D>
) {
  // App
  const app = useRequiredAppContext();

  // Destruct
  const {
    addSplitter,
    inputName,
    itemSize,
    label,
    labelEnd,
    labelFormatter = (data) => {
      if (labelField in data) {
        return data[labelField] as string;
      }

      return data.id.toString();
    },
    labelField,
    labels = {},
    loadData,
    onAdd,
    onValueChange,
    popupTitle = label,
    popupMessage,
    required = false,
    sx = { gap: 1, justifyContent: "flex-start", minHeight: "56px" },
    value,
    variant = "outlined",
    ...rest
  } = props;

  // Default labels
  if (!labels.add) labels.add = app.get("add");
  if (!labels.dragIndicator) labels.dragIndicator = app.get("dragIndicator");
  if (!labels.more) labels.more = app.get("more");

  // State
  const [items, setItems] = React.useState<D[]>([]);
  const [currentValue, setCurrentValue] = React.useState<D["id"]>();

  const item = currentValue
    ? items.find((item) => item.id === currentValue)
    : undefined;

  React.useEffect(() => {
    if (typeof loadData === "function") {
      // Load data
      loadData().then((data) => {
        if (data != null) {
          setItems(data);
        }
      });
    } else {
      setItems(loadData);
    }
  }, [loadData]);

  React.useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  // Selected id
  const tempSelectedId = React.useRef<D["id"]>(null);

  // Click handler
  const clickHandler = () => {
    app.showInputDialog({
      title: popupTitle,
      message: popupMessage,
      callback: (form) => {
        if (form == null || tempSelectedId.current == null) return;
        const id = tempSelectedId.current;
        setCurrentValue(id);
        onValueChange?.(id);
      },
      inputs: (
        <ButtonPopupList
          addSplitter={addSplitter}
          value={currentValue}
          items={items}
          itemSize={itemSize}
          labelFormatter={labelFormatter}
          labels={labels}
          onAdd={onAdd}
          onValueChange={(id) => {
            tempSelectedId.current = id;
          }}
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
        defaultValue={currentValue}
      />
      <Button
        variant={variant}
        sx={sx}
        onClick={() => clickHandler()}
        {...rest}
        disabled={!items || items.length === 0}
      >
        {label && (
          <FormLabel
            required={required}
            sx={{ fontSize: (theme) => theme.typography.body2.fontSize }}
          >
            {label}
          </FormLabel>
        )}
        {item ? (
          <Chip
            sx={{
              height: "auto",
              pointerEvents: "none",
              "& .MuiChip-label": {
                display: "block",
                whiteSpace: "normal"
              }
            }}
            size="small"
            label={labelFormatter(item)}
          />
        ) : undefined}
        {labelEnd && <Typography variant="caption">{labelEnd}</Typography>}
      </Button>
    </React.Fragment>
  );
}
