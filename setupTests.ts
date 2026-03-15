import { MockResizeObserver, NodeStorage } from "@etsoo/shared";
import { vi } from "vitest";
import "@testing-library/jest-dom";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

// Stub the global ResizeObserver
vi.stubGlobal("ResizeObserver", MockResizeObserver);

// Mock localStorage
vi.mock("localStorage", () => new NodeStorage());
