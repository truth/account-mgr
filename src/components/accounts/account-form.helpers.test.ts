import { describe, expect, it } from "vitest";

import { getInitialAutoSiteName, shouldAutofillSiteName } from "@/components/accounts/account-form.helpers";

describe("account form siteName suggestion helpers", () => {
  it("autofills when current siteName is empty", () => {
    expect(shouldAutofillSiteName("", null)).toBe(true);
  });

  it("autofills when current siteName matches previous auto-filled value", () => {
    expect(shouldAutofillSiteName("github", "github")).toBe(true);
  });

  it("does not overwrite manual siteName", () => {
    expect(shouldAutofillSiteName("Personal GitHub", "github")).toBe(false);
  });

  it("detects edit-mode auto-generated initial siteName", () => {
    expect(getInitialAutoSiteName("github", "github")).toBe("github");
  });

  it("does not treat manual edit-mode siteName as auto-generated", () => {
    expect(getInitialAutoSiteName("Work Account", "github")).toBeNull();
  });
});
