import { Page, expect } from "@playwright/test";

export interface RegisterDetails {
  username: string;
  email: string;
  password: string;
  repeatPassword: string;
  acceptTerms: boolean;
}

export const defaultRegisterDetails: RegisterDetails = {
  username: "testuser",
  email: "test@example.com",
  password: "Password123!",
  repeatPassword: "Password123!",
  acceptTerms: true,
};

export async function fillRegisterForm(
  page: Page,
  details: Partial<RegisterDetails> = {},
) {
  const registerDetails = {
    ...defaultRegisterDetails,
    ...details,
  };

  await page
    .getByRole("textbox", { name: "username" })
    .fill(registerDetails.username);
  await page
    .getByRole("textbox", { name: "email" })
    .fill(registerDetails.email);
  await page.getByTestId("password").fill(registerDetails.password);
  await page.getByTestId("repeatPassword").fill(registerDetails.repeatPassword);

  if (registerDetails.acceptTerms) {
    await page.getByRole("checkbox").check();
  }
}

export async function submitRegisterForm(page: Page) {
  await page.getByRole("button", { name: "Register" }).click();
}

export async function register(
  page: Page,
  details: Partial<RegisterDetails> = {},
) {
  await fillRegisterForm(page, details);
  await submitRegisterForm(page);
}

export async function expectRegisterPage(page: Page) {
  await expect(page.getByRole("heading", { name: "Register" })).toBeVisible();

  await expect(page.getByRole("textbox", { name: "username" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "email" })).toBeVisible();
  await expect(page.getByTestId("password")).toBeVisible();
  await expect(page.getByTestId("repeatPassword")).toBeVisible();

  await expect(page.getByRole("checkbox")).toBeVisible();

  await expect(page.getByRole("button", { name: "Register" })).toBeVisible();
}

export async function expectRegisterError(page: Page, message: string) {
  await expect(page.getByText(message)).toBeVisible();
}

export async function acceptTerms(page: Page) {
  await page.getByRole("checkbox").check();
}

export async function declineTerms(page: Page) {
  await page.getByRole("checkbox").uncheck();
}

export async function expectTermsLinks(page: Page) {
  await expect(
    page.getByRole("link", { name: "Terms and Conditions" }),
  ).toHaveAttribute("href", "/terms");

  await expect(
    page.getByRole("link", { name: "Privacy Policy" }),
  ).toHaveAttribute("href", "/privacy");
}
