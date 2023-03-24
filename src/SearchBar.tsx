import { Button, Drawer, IconButton, Stack, useTheme } from "@mui/material";
import React from "react";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { DomUtils } from "@etsoo/shared";
import { ReactUtils, useDelayedExecutor, useDimensions } from "@etsoo/react";
import { Labels } from "./app/Labels";

/**
 * Search bar props
 */
export interface SearchBarProps {
  /**
   * Style class name
   */
  className?: string;

  /**
   * Fields
   */
  fields: React.ReactElement[];

  /**
   * Inner height
   * @default 40
   */
  innerHeight?: number;

  /**
   * On submit callback
   */
  onSubmit: (data: FormData, reset: boolean) => void | PromiseLike<void>;
}

// Cached width attribute name
const cachedWidthName: string = "data-cached-width";

// Reset form
const resetForm = (form: HTMLFormElement) => {
  for (const input of form.elements) {
    // Ignore disabled inputs
    if ("disabled" in input && (input as any).disabled) continue;

    // All non hidden inputs
    if (input instanceof HTMLInputElement) {
      // Ignore hidden input
      if (input.type === "hidden") continue;

      // Ignore readOnly without data-reset=true inputs
      if (!input.readOnly || input.dataset.reset === "true") {
        ReactUtils.triggerChange(input, "", true);
      }
      continue;
    }

    // All selects
    if (input instanceof HTMLSelectElement) {
      if (input.options.length > 0 && input.options[0].value === "") {
        input.selectedIndex = 0;
      } else {
        input.selectedIndex = -1;
      }
      continue;
    }
  }

  // Trigger reset event
  const resetEvent = new Event("reset");
  form.dispatchEvent(resetEvent);
};

// Disable inputs avoid auto trigger change events for them
const setChildState = (child: Element, enabled: boolean) => {
  const inputs = child.getElementsByTagName("input");
  for (const input of inputs) {
    input.disabled = !enabled;
  }
};

/**
 * Search bar
 * @param props Props
 * @returns Component
 */
export function SearchBar(props: SearchBarProps) {
  // Destruct
  const { className, fields, innerHeight = 45.6, onSubmit } = props;

  // Labels
  const labels = Labels.CommonPage;

  // Spacing
  const theme = useTheme();
  const gap = parseFloat(theme.spacing(1));

  // Menu index
  const [index, updateIndex] = React.useState<number>();

  // Drawer open / close
  const [open, updateOpen] = React.useState(false);

  // State
  const state = React.useRef<{
    form?: HTMLFormElement;
    moreForm?: HTMLFormElement;
    lastMaxWidth: number;
    hasMore: boolean;
  }>({ hasMore: true, lastMaxWidth: 9999 }).current;

  // Watch container
  const { dimensions } = useDimensions(
    1,
    (target, rect) => {
      // Same logic from resetButtonRef
      if (
        rect.width === state.lastMaxWidth ||
        (!state.hasMore && rect.width > state.lastMaxWidth)
      )
        return false;

      // Len
      const len = target.children.length;
      for (let i = 0; i < len; i++) {
        var classList = target.children[i].classList;
        classList.remove("showChild");
      }
    },
    0
  );

  // Show or hide element
  const setElementVisible = (element: Element, visible: boolean) => {
    element.classList.remove(visible ? "hiddenChild" : "showChild");
    element.classList.add(visible ? "showChild" : "hiddenChild");
  };

  // Reset button ref
  const resetButtonRef = (instance: HTMLButtonElement) => {
    // Reset button
    const resetButton = instance;
    if (resetButton == null) return;

    // First
    const [_, container, containerRect] = dimensions[0];
    if (container == null || containerRect == null || containerRect.width < 10)
      return;

    // Container width
    let maxWidth = containerRect.width;
    if (
      maxWidth === state.lastMaxWidth ||
      (!state.hasMore && maxWidth > state.lastMaxWidth)
    ) {
      return;
    }
    state.lastMaxWidth = maxWidth;

    // More button
    const buttonMore = resetButton.previousElementSibling!;

    // Cached button width
    const cachedButtonWidth = container.getAttribute(cachedWidthName);
    if (cachedButtonWidth) {
      maxWidth -= Number.parseFloat(cachedButtonWidth);
    } else {
      // Reset button rect
      const resetButtonRect = resetButton.getBoundingClientRect();

      // More button rect
      const buttonMoreRect = buttonMore.getBoundingClientRect();

      // Total
      const totalButtonWidth =
        resetButtonRect.width + buttonMoreRect.width + 3 * gap;

      // Cache
      container.setAttribute(cachedWidthName, totalButtonWidth.toString());

      maxWidth -= totalButtonWidth;
    }

    // Children
    const children = container.children;

    // Len
    const len = children.length;

    // Other elements
    const others = len - 2;
    let hasMore = false;
    let newIndex: number = others;
    for (let c: number = 0; c < others; c++) {
      const child = children[c];
      const cachedWidth = child.getAttribute(cachedWidthName);
      let childWidth: number;
      if (cachedWidth) {
        childWidth = Number.parseFloat(cachedWidth);
      } else {
        const childD = child.getBoundingClientRect();
        childWidth = childD.width + gap;
        child.setAttribute(cachedWidthName, childWidth.toString());
      }

      // No gap here, child width includes the gap
      if (childWidth <= maxWidth) {
        maxWidth -= childWidth;
        setChildState(child, true);
        setElementVisible(child, true);
      } else {
        setChildState(child, false);
        setElementVisible(child, false);

        if (!hasMore) {
          // Make sure coming logic to the block
          maxWidth = 0;

          // Keep the current index
          newIndex = c;

          // Indicates more
          hasMore = true;
        }
      }
    }

    // Show or hide more button
    state.hasMore = hasMore;
    setElementVisible(buttonMore, hasMore);
    setElementVisible(resetButton, true);

    // Update menu start index
    updateIndex(newIndex);
  };

  // More items creator
  const moreItems: React.ReactElement[] = [];
  if (index != null) {
    for (let i: number = index; i < fields.length; i++) {
      moreItems.push(<React.Fragment key={i}>{fields[i]}</React.Fragment>);
    }
  }

  // Handle main form
  const handleForm = (event: React.FormEvent<HTMLFormElement>) => {
    if (event.nativeEvent.cancelable && !event.nativeEvent.composed) return;

    if (state.form == null) state.form = event.currentTarget;

    delayed.call();
  };

  // Handle more button click
  const handleMore = () => {
    updateOpen(!open);
  };

  // More form change
  const moreFormChange = (event: React.FormEvent<HTMLFormElement>) => {
    if (event.nativeEvent.cancelable && !event.nativeEvent.composed) return;

    if (state.moreForm == null) state.moreForm = event.currentTarget;

    delayed.call();
  };

  // Submit at once
  const handleSubmitInstant = (reset: boolean = false) => {
    // Prepare data
    const data = new FormData(state.form);
    if (state.moreForm != null) {
      DomUtils.mergeFormData(data, new FormData(state.moreForm));
    }

    onSubmit(data, reset);
  };

  const delayed = useDelayedExecutor(handleSubmitInstant, 480);

  // Reset
  const handleReset = () => {
    // Clear form values
    if (state.form != null) resetForm(state.form);
    if (state.moreForm != null) resetForm(state.moreForm);

    // Resubmit
    handleSubmitInstant(true);
  };

  React.useEffect(() => {
    // Delayed way
    delayed.call(100);

    return () => {
      delayed.clear();
    };
  }, [className]);

  // Layout
  return (
    <React.Fragment>
      <form
        id="SearchBarForm"
        className={className}
        onChange={handleForm}
        ref={(form) => {
          if (form) state.form = form;
        }}
      >
        <Stack
          ref={dimensions[0][0]}
          justifyContent="center"
          alignItems="center"
          direction="row"
          spacing={1}
          height={innerHeight < 1 ? undefined : innerHeight}
          sx={{
            "& > :not(style)": {
              flexBasis: "auto",
              flexGrow: 0,
              flexShrink: 0,
              maxWidth: "180px",
              visibility: "hidden"
            },
            "& > .hiddenChild": {
              display: "none"
            },
            "& > .showChild": {
              display: "block",
              visibility: "visible"
            }
          }}
        >
          {fields.map((item, index) => (
            <React.Fragment key={index}>{item}</React.Fragment>
          ))}

          <IconButton aria-label="delete" size="medium" onClick={handleMore}>
            <MoreHorizIcon />
          </IconButton>
          <Button
            variant="contained"
            size="medium"
            ref={resetButtonRef}
            onClick={handleReset}
          >
            {labels.reset}
          </Button>
        </Stack>
      </form>
      {index != null && index < fields.length && (
        <Drawer
          anchor="right"
          sx={{ minWidth: "250px" }}
          ModalProps={{
            keepMounted: true // Better open performance on mobile.
          }}
          open={open}
          onClose={() => updateOpen(false)}
        >
          <form
            onChange={moreFormChange}
            ref={(form) => {
              if (form) state.moreForm = form;
            }}
          >
            <Stack
              direction="column"
              alignItems="stretch"
              spacing={2}
              padding={2}
              sx={{
                "& > :not(style)": {
                  minWidth: "100px"
                }
              }}
            >
              {moreItems}
            </Stack>
          </form>
        </Drawer>
      )}
    </React.Fragment>
  );
}
