import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { signIn } from "./helpers";

async function expectNoSeriousAccessibilityViolations(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  const seriousViolations = results.violations.filter((violation) =>
    ["critical", "serious"].includes(violation.impact ?? ""),
  );

  expect(seriousViolations).toEqual([]);
}

test("public landing and authentication flow", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /Messaging that feels/i }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
  await expectNoSeriousAccessibilityViolations(page);

  await signIn(page);
  await expectNoSeriousAccessibilityViolations(page);
});

test("signed-in landing replaces authentication actions", async ({ page }) => {
  await signIn(page);
  await page.goto("/");

  await expect(page.getByText(/Welcome back,/).first()).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Continue to your dashboard/i }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign in" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Get started" })).toHaveCount(0);
});

test("inbox, conversation history, and profile actions remain usable", async ({
  page,
}) => {
  await signIn(page);

  await page.getByRole("link", { name: /Layla Hassan/i }).click();
  await expect(
    page.getByRole("heading", { name: "Layla Hassan" }),
  ).toBeVisible();
  await expect(page.getByLabel("Message history")).toBeVisible();

  const loadOlder = page.getByRole("button", { name: /Load older/i });
  while (await loadOlder.isVisible()) {
    await Promise.all([
      page.waitForResponse(
        (response) => response.url().includes("/messages?") && response.ok(),
      ),
      loadOlder.click(),
    ]);
  }
  await expect(page.getByText("Morning! I reviewed")).toBeVisible();

  await page.goto("/settings/profile");
  const saveButton = page.getByRole("button", { name: "Save changes" });
  await expect(saveButton).toBeVisible();
  await expect(saveButton).toBeInViewport();
  await expectNoSeriousAccessibilityViolations(page);
});
