import {
  INotification,
  NotificationMessageType
} from "@etsoo/notificationbase";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { NotifierMU } from "../src";

// Without it will popup error:
// The current testing environment is not configured to support act
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

// Root
const root = document.body;
const container: HTMLElement = document.createElement("div");
root.append(container);

// The state provider
const Provider = NotifierMU.setup();
const reactRoot = createRoot(container);

act(() => {
  // Concorrent renderer needs act block
  reactRoot.render(<Provider />);
});

// Notifier
const notifier = NotifierMU.instance;

// Timer mock
// https://jestjs.io/docs/en/timer-mocks
jest.useFakeTimers();

test("Alert tests", async () => {
  // Click
  const handleClick = jest.fn();

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
  jest.runOnlyPendingTimers();
});

test("Confirm tests", async () => {
  // Click
  const handleClick = jest.fn();

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
  jest.runOnlyPendingTimers();
});

test("Confirm tests without cancel button", async () => {
  // Click
  const handleClick = jest.fn();

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
  jest.runOnlyPendingTimers();
});

test("Prompt tests", async () => {
  // Click
  const handleClick = jest.fn((result: boolean) => {
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

  jest.runOnlyPendingTimers();
});

test("Prompt tests with form submit", async () => {
  // Click
  const handleClick = jest.fn((result: boolean) => {
    expect(result).toBeTruthy();
  });

  act(() => {
    // Add the notification
    notifier.prompt<boolean>("Prompt message", handleClick, undefined, {
      type: "switch",
      inputProps: { required: false }
    });
  });

  await act(async () => {
    (
      root
        .getElementsByTagName("form")[0]
        .elements.namedItem("okButton") as HTMLButtonElement
    )?.click();
  });

  expect(handleClick).toHaveBeenCalled();

  jest.runOnlyPendingTimers();
});

test("Message tests", (done) => {
  // Callback
  const callback = jest.fn(() => done());

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
    jest.runOnlyPendingTimers();
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
    jest.runOnlyPendingTimers();
  });

  expect(root.innerHTML).not.toContain("Loading");
});
