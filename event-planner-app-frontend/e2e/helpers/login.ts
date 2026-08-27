import { Page, expect } from "@playwright/test";

export interface LoginCredentials {
  email: string;
  password: string;
}

export const defaultLoginCredentials: LoginCredentials = {
  email: "test@example.com",
  password: "Password123!",
};

export async function fillLoginForm(
  page: Page,
  credentials: LoginCredentials = defaultLoginCredentials,
) {
  await page.getByRole("textbox", { name: "email" }).fill(credentials.email);
  await page
    .getByRole("textbox", { name: "password" })
    .fill(credentials.password);
}

export async function submitLoginForm(page: Page) {
  await page.getByRole("button", { name: /login/i }).click();
}

export async function login(
  page: Page,
  credentials: LoginCredentials = defaultLoginCredentials,
) {
  await fillLoginForm(page, credentials);
  await submitLoginForm(page);
}

export async function expectLoginPage(page: Page) {
  await expect(page.getByRole("heading", { name: /login/i })).toBeVisible();

  await expect(page.getByRole("textbox", { name: "email" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "password" })).toBeVisible();

  await expect(page.getByRole("button", { name: /login/i })).toBeVisible();
}

export async function expectLoginError(page: Page, message: string) {
  await expect(page.getByText(message)).toBeVisible();
}
