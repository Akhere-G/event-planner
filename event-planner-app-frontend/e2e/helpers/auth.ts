import { expect, type Page } from "@playwright/test";

export interface Credentials {
  email: string;
  password: string;
}

export const defaultCredentials: Credentials = {
  email: "test@example.com",
  password: "Password123!",
};

export async function login(
  page: Page,
  { email, password }: Credentials = defaultCredentials,
) {
  await page.getByRole("textbox", { name: "email" }).fill(email);
  await page.getByRole("textbox", { name: "password" }).fill(password);
  await page.getByRole("button", { name: /login/i }).click();
}

export async function expectLoginPage(page: Page) {
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { name: /login/i })).toBeVisible();
}
