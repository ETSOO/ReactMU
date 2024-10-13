import { CustomFieldData } from "@etsoo/appscript";
import { Grid2, Grid2Props, Typography, TypographyProps } from "@mui/material";
import { CustomFieldUtils } from "./CustomFieldUtils";
import { MUGlobal } from "../MUGlobal";
import { VBox } from "../FlexBox";
import { DataTypes, Utils } from "@etsoo/shared";

/**
 * Custom field viewer props
 * 自定义字段查看器属性
 */
export type CustomFieldViewerProps = {
  /**
   * Custom fields
   * 自定义字段
   */
  fields: CustomFieldData[];

  /**
   * Grid props
   * 网格属性
   */
  gridProps?: Grid2Props;

  /**
   * JSON data
   * JSON 数据
   */
  jsonData: unknown;

  /**
   * Title label props
   * 标题标签属性
   */
  titleProps?: TypographyProps;

  /**
   * Vertical gap
   * 垂直间距
   */
  verticalGap?: number;

  /**
   * Value label formatter
   * 值标签格式化
   */
  valueLabelFormatter?: (value: any, field: CustomFieldData) => string;

  /**
   * Value label props
   * 值标签属性
   */
  valueProps?: TypographyProps;
};

/**
 * Custom field viewer
 * 自定义字段查看器
 * @param props Props
 * @returns Component
 */
export function CustomFieldViewer(props: CustomFieldViewerProps) {
  // Destruct
  const {
    fields,
    gridProps,
    jsonData,
    titleProps,
    verticalGap = 0.5,
    valueLabelFormatter = (value, field) => {
      if (value == null) return "";
      if (field.options) {
        const option = field.options.find((o) => o.id === value);
        if (option) {
          return DataTypes.getListItemLabel(option);
        }
      }

      if (typeof value === "object") {
        if (value instanceof Date) {
          return value.toLocaleString();
        } else {
          return JSON.stringify(value);
        }
      } else {
        return `${value}`;
      }
    },
    valueProps
  } = props;

  const spacing = MUGlobal.half(MUGlobal.pagePaddings);
  const data = typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;
  if (data == null || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Invalid JSON data");
  }

  return (
    <Grid2
      container
      justifyContent="left"
      spacing={spacing}
      sx={{
        ".MuiTypography-subtitle2": {
          fontWeight: "bold"
        }
      }}
      {...gridProps}
    >
      {fields.map((field, index) => {
        // Field name
        const name = field.name;
        if (!name) return;

        // Field value
        const value = Utils.getNestedValue(data, name);

        return (
          <Grid2
            key={name ?? index}
            size={CustomFieldUtils.transformSpace(field.space)}
            {...field.gridItemProps}
          >
            <VBox gap={verticalGap}>
              <Typography fontWeight="bold" fontSize="small" {...titleProps}>
                {field.label ?? name}
              </Typography>
              <Typography {...valueProps}>
                {valueLabelFormatter(value, field)}
              </Typography>
            </VBox>
          </Grid2>
        );
      })}
    </Grid2>
  );
}
