import { describe, expect, it } from "vitest";
import { PROJECT_REFS, assertEnvironmentMatches, extractProjectRef } from "../../db/environment-guard";

const STAGING_URL = `postgresql://postgres.${PROJECT_REFS.staging}:fakepassword@aws-1-eu-west-1.pooler.supabase.com:5432/postgres`;
const PRODUCTION_URL = `postgresql://postgres.${PROJECT_REFS.production}:fakepassword@aws-0-eu-west-2.pooler.supabase.com:5432/postgres`;

describe("extractProjectRef", () => {
  it("extracts the ref from a Session Pooler connection string", () => {
    expect(extractProjectRef(STAGING_URL)).toBe(PROJECT_REFS.staging);
  });

  it("extracts the ref from a direct db.<ref>.supabase.co connection string", () => {
    const direct = `postgresql://postgres:fakepassword@db.${PROJECT_REFS.production}.supabase.co:5432/postgres`;
    expect(extractProjectRef(direct)).toBe(PROJECT_REFS.production);
  });

  it("returns null for a missing or unrecognized connection string", () => {
    expect(extractProjectRef(undefined)).toBeNull();
    expect(extractProjectRef("")).toBeNull();
    expect(extractProjectRef("postgresql://someone:pw@example.com:5432/db")).toBeNull();
  });
});

describe("assertEnvironmentMatches", () => {
  it("allows staging target + staging DATABASE_URL", () => {
    expect(() => assertEnvironmentMatches("staging", STAGING_URL)).not.toThrow();
  });

  it("allows production target + production DATABASE_URL", () => {
    expect(() => assertEnvironmentMatches("production", PRODUCTION_URL)).not.toThrow();
  });

  it("refuses staging target + production DATABASE_URL", () => {
    expect(() => assertEnvironmentMatches("staging", PRODUCTION_URL)).toThrow();
  });

  it("refuses production target + staging DATABASE_URL", () => {
    expect(() => assertEnvironmentMatches("production", STAGING_URL)).toThrow();
  });

  it("refuses a missing target", () => {
    expect(() => assertEnvironmentMatches(null, STAGING_URL)).toThrow(/valid --target is required/);
    expect(() => assertEnvironmentMatches(undefined, STAGING_URL)).toThrow(/valid --target is required/);
    expect(() => assertEnvironmentMatches("", STAGING_URL)).toThrow(/valid --target is required/);
  });

  it("refuses an unknown target name, including the retired 'dev' label", () => {
    expect(() => assertEnvironmentMatches("dev", STAGING_URL)).toThrow(/valid --target is required/);
    expect(() => assertEnvironmentMatches("development", PRODUCTION_URL)).toThrow(/valid --target is required/);
  });

  it("refuses when DATABASE_URL has no recognizable project ref", () => {
    expect(() => assertEnvironmentMatches("staging", "postgresql://someone:pw@example.com:5432/db")).toThrow(
      /Could not determine the Supabase project ref/
    );
  });

  it("never includes the password in a thrown error message", () => {
    let message = "";
    try {
      assertEnvironmentMatches("staging", PRODUCTION_URL);
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }
    expect(message).not.toContain("fakepassword");
    expect(message).not.toContain(PRODUCTION_URL);
  });
});
