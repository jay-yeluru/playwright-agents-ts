import { test as base, expect } from "@playwright/test";
import { POManager } from "../pages/pomanager";

export interface AppFixtures {
  poManager: POManager;
}

export const test = base.extend<AppFixtures>({
  poManager: async ({ page, baseURL }, use) => {
    const poManager = new POManager(page);
    await poManager.todoPage.goto(baseURL!);
    await use(poManager);
  },
});

export { expect };
