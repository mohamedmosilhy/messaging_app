import { expect, type Page } from "@playwright/test";

export const demoAccount = {
  email: "mohamed@example.com",
  password: "Test12345",
};

export async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(demoAccount.email);
  await page.locator('input[name="password"]').fill(demoAccount.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard\/conversations$/);
  await expect(
    page.getByRole("heading", { name: "Messages", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Live", { exact: true })).toBeVisible();
}
