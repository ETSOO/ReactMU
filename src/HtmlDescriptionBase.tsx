import React from "react";
import { InputField, InputFieldProps } from "./InputField";
import { useCombinedRefs } from "@etsoo/react";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";

/**
 * HTML Description component base props
 * HTML 描述组件基础属性
 */
export type HtmlDescriptionBaseProps = Omit<InputFieldProps, "multiline"> & {
  /**
   * Maximum length of the input
   * 输入的最大长度
   */
  maxLength?: number;

  /**
   * Edit handler
   * 编辑处理器
   */
  onEdit: (input: HTMLInputElement) => void;
};

/**
 * HTML Description component base
 * HTML 描述组件属性基础
 * @param props Props
 * @returns Component
 */
export function HtmlDescriptionBase(props: HtmlDescriptionBaseProps) {
  // Destruct
  const {
    fullWidth = true,
    inputRef,
    label,
    maxLength = 1280,
    name = "description",
    onEdit,
    rows = 3,
    ...rest
  } = props;

  const localRef = React.useRef<HTMLInputElement>(null);
  const refs = useCombinedRefs(localRef, inputRef);

  return (
    <InputField
      fullWidth={fullWidth}
      inputRef={refs}
      name={name}
      slotProps={{
        htmlInput: { maxLength },
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                edge="end"
                onClick={() => {
                  const input = localRef.current;
                  if (input == null) return;

                  onEdit(input);
                }}
              >
                <EditIcon />
              </IconButton>
            </InputAdornment>
          )
        }
      }}
      label={label}
      multiline
      rows={rows}
      {...rest}
    />
  );
}
