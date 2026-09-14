import { SVGUtils } from "../src";

it("SVGUtils hexToCssFilter for black", () => {
  const hex = "#fff";
  const filter = SVGUtils.hexToCssFilter(hex);
  expect(filter).toBeDefined();
});

it("SVGUtils hexToCssFilter", () => {
  const hex = "#ff3922";
  const filter = SVGUtils.hexToCssFilter(hex);
  expect(filter).toBeDefined();
});
