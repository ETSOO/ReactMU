import React from "react";
import {
  act,
  fireEvent,
  getByText,
  render,
  screen
} from "@testing-library/react";
import { CustomFieldData } from "@etsoo/appscript";
import { CustomFieldUtils } from "../src/custom/CustomFieldUtils";
import { CustomFieldReactCollection } from "@etsoo/react";
import { NumberUtils } from "@etsoo/shared";

it("Render FieldAmountLabel", () => {
  // Arrange
  const fields: CustomFieldData[] = [
    {
      type: "amountlabel",
      mainSlotProps: { currency: "$CURRENCY$" }
    }
  ];

  const amount = 100;

  const collections: CustomFieldReactCollection<CustomFieldData> = {};

  const { baseElement } = render(
    <div>
      {CustomFieldUtils.create(
        fields,
        collections,
        (field) => {
          switch (field.type) {
            case "amountlabel":
              return amount;
            default:
              return undefined;
          }
        },
        (name, value) => {},
        (input) => input.replace("$CURRENCY$", "USD")
      )}
    </div>
  );

  getByText(baseElement, `$ ${NumberUtils.formatMoney(amount)}`);
});

it("Render FieldCheckbox", () => {
  // Arrange
  const fields: CustomFieldData[] = [
    {
      type: "checkbox",
      name: "checkbox",
      options: [
        { id: "a", name: "A" },
        { id: "b", name: "B" },
        { id: "c", name: "C" }
      ]
    }
  ];

  const collections: CustomFieldReactCollection<CustomFieldData> = {};

  act(() => {
    render(
      <div>
        {CustomFieldUtils.create(
          fields,
          collections,
          (field) => {
            switch (field.type) {
              case "checkbox":
                return ["a", "b"];
              default:
                return undefined;
            }
          },
          (name, value) => {
            expect(name).toBe("checkbox");
            expect(value).toStrictEqual(["a"]);
          }
        )}
      </div>
    );
  });

  const checkboxItems = document.querySelectorAll<HTMLInputElement>(
    "input[type=checkbox]"
  );

  expect(checkboxItems.length).toBe(3);
  expect(checkboxItems[0].checked).toBeTruthy();
  expect(checkboxItems[2].checked).toBeFalsy();

  act(() => {
    checkboxItems[1].click();
  });
});

it("Render FieldSelect", async () => {
  // Arrange
  const fields: CustomFieldData[] = [
    {
      type: "select",
      name: "select",
      options: [
        { id: "a", label: "A" },
        { id: "b", label: "B" },
        { id: "c", label: "C" }
      ]
    }
  ];

  const collections: CustomFieldReactCollection<CustomFieldData> = {};

  act(() => {
    render(
      <div>
        {CustomFieldUtils.create(
          fields,
          collections,
          (field) => {
            switch (field.type) {
              case "select":
                return "c";
              default:
                return undefined;
            }
          },
          (name, value) => {
            expect(name).toBe("checkbox");
            expect(value).toStrictEqual(["a"]);
          }
        )}
      </div>
    );
  });

  const button = await screen.findByRole("combobox");

  act(() => {
    // Act, click to open the dropdown list
    vi.useFakeTimers();
    fireEvent.mouseDown(button);
    vi.runAllTimers();
  });

  const input = document.querySelector<HTMLInputElement>("input");
  expect(input?.value).toBe("c");

  const listItems = document.querySelectorAll("li");
  expect(listItems.length).toBe(3);
});
