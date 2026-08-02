import { describe, expect, it } from "vitest";
import {
  fieldsForGarment,
  MEASUREMENT_FIELDS_BY_GARMENT,
  M_META,
  type MField,
} from "@/lib/measurements";

describe("fieldsForGarment", () => {
  it("returns the configured fields for a known garment", () => {
    expect(fieldsForGarment("Shirt")).toEqual([
      "chest",
      "shoulder",
      "sleeve",
      "waist",
      "shirtLength",
      "neck",
    ]);
  });

  it("resolves garment_types aliases to their canonical field list", () => {
    expect(fieldsForGarment("Kurti")).toBe(MEASUREMENT_FIELDS_BY_GARMENT.Kurta);
    expect(fieldsForGarment("Bridal Lehenga")).toBe(MEASUREMENT_FIELDS_BY_GARMENT.Lehenga);
    expect(fieldsForGarment("Formal Shirt")).toBe(MEASUREMENT_FIELDS_BY_GARMENT.Shirt);
    expect(fieldsForGarment("Formal Trouser")).toBe(MEASUREMENT_FIELDS_BY_GARMENT.Trouser);
    expect(fieldsForGarment("Saree fall & pico")).toBe(MEASUREMENT_FIELDS_BY_GARMENT["Saree Fall"]);
  });

  it("falls back to chest/waist for an unrecognized garment", () => {
    expect(fieldsForGarment("Something made up")).toEqual(["chest", "waist"]);
  });
});

describe("M_META", () => {
  it("has metadata for every field referenced by MEASUREMENT_FIELDS_BY_GARMENT", () => {
    const referenced = new Set<MField>();
    Object.values(MEASUREMENT_FIELDS_BY_GARMENT).forEach((fields) =>
      fields.forEach((f) => referenced.add(f)),
    );
    for (const field of referenced) {
      expect(M_META[field], `missing M_META entry for "${field}"`).toBeDefined();
      const [min, max] = M_META[field].rangeCm;
      expect(min).toBeLessThan(max);
    }
  });
});
