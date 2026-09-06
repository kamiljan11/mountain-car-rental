import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { COMPANIES, COMPANY, kennitalaLabel, webLabel, type Company } from "./company";

describe("kennitalaLabel", () => {
  it("formats a ten-digit kennitala as DDMMYY-NNNN", () => {
    expect(kennitalaLabel({ kennitala: "6907250450" } as Company)).toBe("690725-0450");
  });

  it("leaves anything else untouched, so a half-filled profile is visibly incomplete", () => {
    expect(kennitalaLabel({ kennitala: "" } as Company)).toBe("");
    expect(kennitalaLabel({ kennitala: "690725-0450" } as Company)).toBe("690725-0450");
  });
});

describe("webLabel", () => {
  it("strips the protocol for display", () => {
    expect(webLabel({ web: "https://example.is" } as Company)).toBe("example.is");
    expect(webLabel({ web: "http://example.is" } as Company)).toBe("example.is");
  });
});

describe("company profiles", () => {
  it("has a default landlord and unique keys", () => {
    expect(COMPANY).toBe(COMPANIES[0]);
    expect(new Set(COMPANIES.map((c) => c.key)).size).toBe(COMPANIES.length);
  });

  it("never ships a brand or legal name that is only whitespace", () => {
    for (const c of COMPANIES) {
      expect(c.brand.trim()).not.toBe("");
      expect(c.legalName.trim()).not.toBe("");
    }
  });
});

// Kto stawia te aplikacje u siebie, ma podmienic dane w jednym pliku. Ta bramka
// pilnuje, zeby tozsamosc operatora nie rozlazla sie z powrotem po komponentach.
describe("operator identity lives in one file", () => {
  const IDENTITY =
    /Mountain All Service|Mountain Car Rental|Rebel Travel|6907250450|6007230140|Njarðarbraut|Skógarhlíð|mountaincar\.is|rebeltravel\.is/;

  function sourceFiles(dir: string): string[] {
    return readdirSync(dir).flatMap((entry) => {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) return sourceFiles(path);
      return /\.tsx?$/.test(entry) ? [path] : [];
    });
  }

  it("keeps operator details out of every other source file", () => {
    const src = resolve(process.cwd(), "src");
    const offenders = sourceFiles(src)
      .filter((path) => !/company\.(ts|test\.ts)$/.test(path))
      .filter((path) => IDENTITY.test(readFileSync(path, "utf8")))
      .map((path) => path.slice(src.length + 1));
    expect(offenders).toEqual([]);
  });

  // Seed jest opcjonalny i syntetyczny — nie ma prawa wstawiac prawdziwego operatora
  // do bazy, ktora ktos wlasnie postawil u siebie. Migracje sa historia i zostaja.
  it("keeps them out of supabase/seed.sql too", () => {
    const seed = readFileSync(resolve(process.cwd(), "supabase/seed.sql"), "utf8");
    const hits = seed
      .split(/\r?\n/)
      .filter((line) => IDENTITY.test(line) && !line.trimStart().startsWith("--"));
    expect(hits).toEqual([]);
  });
});
