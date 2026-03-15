import {
  INotification,
  NotificationMessageType
} from "@etsoo/notificationbase";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { NotificationMUDataMethods, NotifierMU, VBox } from "../src";
import TextField from "@mui/material/TextField";
import { waitFor, screen, fireEvent } from "@testing-library/react";

// Without it will popup error:
// The current testing environment is not configured to support act
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

// Root
const root = document.body;
const container: HTMLElement = document.createElement("div");
root.append(container);

act(() => {
  // The state provider
  const Provider = NotifierMU.setup();
  const reactRoot = createRoot(container);

  // Concorrent renderer needs act block
  reactRoot.render(<Provider />);
});

// Notifier
const notifier = NotifierMU.instance;

// Timer mock
// https://jestjs.io/docs/en/timer-mocks
vi.useFakeTimers();

test("Alert tests", async () => {
  // Click
  const handleClick = vi.fn();

  act(() => {
    // Add the notification
    notifier.alert("Alert message", handleClick);
  });

  // Button
  const button = root.getElementsByTagName("button");

  expect(button.length).toBe(1);
  expect(button[0].innerHTML).toContain("OK");

  await act(async () => {
    button[0].click();
  });

  expect(handleClick).toHaveBeenCalled();

  // Fast forward
  vi.runOnlyPendingTimers();
});

test("Confirm tests", async () => {
  // Click
  const handleClick = vi.fn();

  act(() => {
    // Add the notification
    notifier.confirm("Confirm message", undefined, handleClick);
  });

  // Button
  const button = root.getElementsByTagName("button");

  expect(button.length).toBe(2);
  expect(button[0].innerHTML).toContain("Cancel");

  await act(async () => {
    button[0].click();
  });

  expect(handleClick).toHaveBeenCalled();

  // Fast forward
  vi.runOnlyPendingTimers();
});

test("Confirm tests without cancel button", async () => {
  // Click
  const handleClick = vi.fn();

  act(() => {
    // Add the notification
    notifier.confirm("Confirm message", undefined, handleClick, {
      cancelButton: false
    });
  });

  // Button
  const button = root.getElementsByTagName("button");

  expect(button.length).toBe(1);
  expect(button[0].innerHTML).toContain("OK");

  await act(async () => {
    button[0].click();
  });

  expect(handleClick).toHaveBeenCalled();

  // Fast forward
  vi.runOnlyPendingTimers();
});

test("Prompt tests", async () => {
  // Click
  const handleClick = vi.fn((result: boolean) => {
    expect(result).toBeTruthy();
  });

  act(() => {
    // Add the notification
    notifier.prompt<boolean>("Prompt message", handleClick, undefined, {
      type: "switch",
      inputProps: { required: false }
    });
  });

  // Button
  const button = root.getElementsByTagName("button");

  expect(button.length).toBe(2); // Switch will generate a button
  expect(button[1].innerHTML).toContain("OK");

  await act(async () => {
    button[1].click();
  });

  expect(handleClick).toHaveBeenCalled();

  vi.runOnlyPendingTimers();
});

type DataType = {
  name: string;
  age: number;
};

function DataCollector(props: { mRef: React.Ref<NotificationMUDataMethods> }) {
  const { mRef } = props;
  const nameRef = React.createRef<HTMLInputElement>();
  const ageRef = React.createRef<HTMLInputElement>();

  function getValue(): DataType | undefined {
    if (!nameRef.current?.value) {
      nameRef.current?.focus();
      return undefined;
    }

    if (!ageRef.current?.valueAsNumber) {
      ageRef.current?.focus();
      return undefined;
    }

    return {
      name: nameRef.current.value,
      age: ageRef.current.valueAsNumber
    };
  }

  React.useImperativeHandle(mRef, () => ({
    getValue
  }));

  return (
    <VBox>
      <TextField name="name" required inputRef={nameRef} />
      <TextField name="age" type="number" required inputRef={ageRef} />
    </VBox>
  );
}

test("Data tests", async () => {
  const name = "John Doe";
  const age = 30;

  act(() => {
    // Add the notification
    notifier.data<DataType>(
      <DataCollector mRef={React.createRef<NotificationMUDataMethods>()} />,
      (result) => {
        expect(result).toEqual({ name, age });
        return true;
      },
      "Data Modal"
    );
  });

  const button = screen.getByText("OK");
  expect(button).toBeInTheDocument();

  const nameInput = root.querySelector<HTMLInputElement>('input[name="name"]');
  expect(nameInput).not.toBeNull();
  nameInput!.value = name;

  const ageInput = root.querySelector<HTMLInputElement>('input[name="age"]');
  expect(ageInput).not.toBeNull();
  ageInput!.value = age.toString();

  await act(async () => {
    button.click();
  });
});

test("Prompt tests with form submit", async () => {
  // Click
  const handleClick = vi.fn((result: boolean) => {
    expect(result).toBeTruthy();
  });

  act(() => {
    // Add the notification
    notifier.prompt<boolean>("Prompt message", handleClick, undefined, {
      type: "switch",
      inputProps: { required: false }
    });
  });

  const button = screen.getByText("OK");
  expect(button).toBeInTheDocument();

  await act(async () => {
    button.click();
  });

  expect(handleClick).toHaveBeenCalled();
});

test("Message tests", () => {
  // Callback
  const callback = vi.fn();

  let n: INotification<React.ReactNode, any> | undefined;
  act(() => {
    // Add the notification
    n = notifier.message(
      NotificationMessageType.Danger,
      "Error Message",
      undefined,
      {
        callback
      }
    );
  });

  expect(n?.timespan).toBe(5);

  expect(root.innerHTML).toContain("Error Message");

  act(() => {
    // Here is the bug need further study...
    n?.dismiss();

    // Fast forward
    vi.runOnlyPendingTimers();
  });

  expect(root.innerHTML).not.toContain("Error Message");
  expect(callback).toHaveBeenCalled();
});

test("Loading tests", () => {
  act(() => {
    // Add the notification
    notifier.showLoading("Loading");
  });

  expect(root.innerHTML).toContain("Loading");

  act(() => {
    notifier.hideLoading();

    // Fast forward
    vi.runOnlyPendingTimers();
  });

  expect(root.innerHTML).not.toContain("Loading");
});
