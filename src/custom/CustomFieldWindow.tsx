import { CustomFieldData } from "@etsoo/appscript";
import { CustomFieldReactCollection } from "@etsoo/react";
import { Utils } from "@etsoo/shared";
import React from "react";
import { MUGlobal } from "../MUGlobal";
import { CustomFieldUtils } from "./CustomFieldUtils";
import { useRequiredAppContext } from "../app/ReactApp";
import Grid, { GridProps } from "@mui/material/Grid";
import Stack from "@mui/material/Stack";

function calculateKeys(data: Record<string, unknown>) {
  let count = 0;
  for (const key in data) {
    const item = data[key];
    if (typeof item === "object" && item !== null && !Array.isArray(item)) {
      count += calculateKeys(item as Record<string, unknown>);
    } else {
      count++;
    }
  }
  return count;
}

function parseJsonData(jsonData: unknown): [Record<string, unknown>, number] {
  let data: Record<string, unknown> = {};
  if (jsonData) {
    try {
      data =
        typeof jsonData === "object"
          ? jsonData
          : typeof jsonData === "string"
          ? JSON.parse(jsonData)
          : {};
    } catch {}
  }
  return [data, calculateKeys(data)];
}

/**
 * Custom field window props
 * 自定义字段窗口属性
 */
export type CustomFieldWindowProps<D extends CustomFieldData> = {
  /**
   * Children creation callback
   * 子元素创建回调
   * @param open Open callback
   * @param label Label
   * @param pc Property count
   * @returns Component
   */
  children: (
    open: (customFields: D[], jsonData?: unknown) => void,
    label: string | undefined,
    pc: number
  ) => React.ReactNode;

  /**
   * Label
   * 标签
   */
  label?: string;

  /**
   * Grid props
   * 网格属性
   */
  gridProps?: GridProps;

  /**
   * JSON data
   * JSON 数据
   */
  jsonData?: unknown;

  /**
   * Input name
   * 输入框名称
   */
  inputName?: string;

  /**
   * Input ref
   * 输入框引用
   */
  inputRef?: React.MutableRefObject<HTMLInputElement | null>;

  /**
   * On update callback
   * 更新回调
   */
  onUpdate?: (data: Record<string, unknown>) => void;
};

/**
 * Custom field window
 * 自定义字段窗口
 * @param props Props
 * @returns Component
 */
export function CustomFieldWindow<D extends CustomFieldData = CustomFieldData>(
  props: CustomFieldWindowProps<D>
) {
  // Global app
  const app = useRequiredAppContext();

  const {
    children,
    label = app.get("jsonData"),
    gridProps,
    jsonData,
    inputName = "jsonData",
    inputRef,
    onUpdate
  } = props;

  const spacing = MUGlobal.half(MUGlobal.pagePaddings);

  const [count, setCount] = React.useState(0);

  const [initData, propertyCount] = parseJsonData(jsonData);

  React.useEffect(() => setCount(propertyCount), [propertyCount]);

  return (
    <React.Fragment>
      <input type="hidden" name={inputName} ref={inputRef} />
      {children(
        (customFields, jsonData) => {
          const collections: CustomFieldReactCollection<D> = {};
          let data: Record<string, unknown> = {};
          jsonData ??= inputRef?.current?.value;
          if (jsonData) {
            const [d, pc] = parseJsonData(jsonData);
            data = d;
            setCount(pc);
          } else {
            data = initData;
          }

          app.notifier.confirm(
            label,
            undefined,
            (value) => {
              if (value) {
                if (inputRef?.current) {
                  inputRef.current.value = JSON.stringify(data);
                }
                setCount(calculateKeys(data));
                if (onUpdate) onUpdate(data);
              }
            },
            {
              fullScreen: app.smDown,
              inputs: (
                <Stack marginTop={1.5}>
                  <Grid
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
                    {CustomFieldUtils.create(
                      customFields,
                      collections,
                      (field) => {
                        if (field.name == null) return;
                        return Utils.getNestedValue(data, field.name);
                      },
                      (name, value) => {
                        Utils.setNestedValue(data, name, value);
                      }
                    )}
                  </Grid>
                </Stack>
              )
            }
          );
        },
        label,
        count
      )}
    </React.Fragment>
  );
}
