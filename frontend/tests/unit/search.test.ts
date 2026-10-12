import { describe, expect, it } from "vitest";
import { normalizeSearchKeyword } from "@/lib/utils/search";

describe("keyword pencarian", () => {
  it.each(["", "a", "ab", "  ab  ", "   "])("tidak mencari keyword pendek %j", (value) => {
    expect(normalizeSearchKeyword(value)).toBe("");
  });

  it.each(["abc", "engineer", "UI/UX"])("menerima keyword %j", (value) => {
    expect(normalizeSearchKeyword(value)).toBe(value);
  });

  it("mengabaikan spasi di tepi tetapi mempertahankan spasi antar kata", () => {
    expect(normalizeSearchKeyword("  Frontend Engineer  ")).toBe("Frontend Engineer");
  });
});
