import { expect, test } from "@playwright/test";

import { signIn } from "./helpers";

const screenshotOptions = {
  animations: "disabled" as const,
  fullPage: true,
};

test("capture documentation screenshots", async ({ page }, testInfo) => {
  test.skip(
    process.env.CAPTURE_SCREENSHOTS !== "true" ||
      testInfo.project.name !== "desktop",
  );

  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto("/");
  await page.screenshot({
    path: "docs/assets/screenshots/landing.png",
    ...screenshotOptions,
  });

  await signIn(page);
  await page.screenshot({
    path: "docs/assets/screenshots/inbox.png",
    ...screenshotOptions,
  });

  await page.getByRole("link", { name: /Layla Hassan/i }).click();
  await expect(
    page.getByRole("heading", { name: "Layla Hassan" }),
  ).toBeVisible();
  await page.screenshot({
    path: "docs/assets/screenshots/conversation.png",
    ...screenshotOptions,
  });

  await page.goto("/settings/profile");
  await expect(
    page.getByRole("button", { name: "Save changes" }),
  ).toBeInViewport();
  await page.screenshot({
    path: "docs/assets/screenshots/profile-settings.png",
    ...screenshotOptions,
  });
});
