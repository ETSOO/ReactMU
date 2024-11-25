import {
  AddressUtils,
  ApiAuthorizationScheme,
  Culture,
  ExternalSettings
} from "@etsoo/appscript";
import { ReactApp } from "../src";
import { DataTypes, DomUtils, IActionResult, Utils } from "@etsoo/shared";
import React, { act } from "react";
import { createRoot } from "react-dom/client";

// Without it will popup error:
// The current testing environment is not configured to support act
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

// Detected country or region
const { detectedCountry } = DomUtils;

// Detected culture
const { detectedCulture } = DomUtils;

// Supported cultures
const supportedCultures: DataTypes.CultureDefinition[] = [
  Culture.zhHans({}),
  Culture.en({})
];

// Supported regions
const supportedRegions = ["CN"];

const settings = ExternalSettings.format({
  /**
   * Endpoint of the API service
   */
  endpoint: "http://{hostname}/com.etsoo.SmartERPApi/api/",

  /**
   * App root url
   */
  homepage: "/cms",

  /**
   * Web url of the cloud
   */
  webUrl: "http://localhost",

  // Authorization scheme
  authScheme: ApiAuthorizationScheme.Bearer,

  // Detected culture
  detectedCulture,

  // Supported cultures
  cultures: supportedCultures,

  // Supported regions
  regions: supportedRegions,

  // Browser's time zone
  timeZone: Utils.getTimeZone(),

  // Current country or region
  currentRegion: AddressUtils.getRegion(
    supportedRegions,
    detectedCountry,
    detectedCulture
  ),

  // Current culture
  currentCulture: DomUtils.getCulture(supportedCultures, detectedCulture)![0]
});

const app = new ReactApp(settings, "test");

// Root
const root = document.body;
const container: HTMLElement = document.createElement("div");
root.append(container);

// The state provider
const Provider = ReactApp.notifierProvider;
const reactRoot = createRoot(container);

act(() => {
  // Concorrent renderer needs act block
  reactRoot.render(<Provider />);
});

test("Test for properties", () => {
  const result: IActionResult = {
    ok: false,
    type: "https://tools.ietf.org/html/rfc9110#section-15.5.1",
    title: "One or more validation errors occurred.",
    status: 400,
    errors: {
      $: [
        "JSON deserialization for type \u0027com.etsoo.CMS.RQ.User.UserCreateRQ\u0027 was missing required properties, including the following: password"
      ],
      rq: ["The rq field is required."]
    },
    traceId: "00-ed96a4f0c83f066594ecc69b77da9803-df770e3cd714fedd-00"
  };

  act(() => {
    app.alertResult(result);
  });

  expect(root.innerHTML).toContain(result.title);
});

test("Test for alertResult", () => {
  const result: IActionResult = {
    ok: false,
    type: "TokenExpired",
    title: "您的令牌已过期",
    data: {}
  };

  act(() => {
    app.alertResult(result);
  });

  expect(root.innerHTML).toContain(
    '<span style="font-size: 9px;">(TokenExpired)</span>'
  );
});
