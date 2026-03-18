import { Page, Locator, expect } from "@playwright/test";

export class TodoPage {
  readonly page: Page;
  readonly todoInput: Locator;
  readonly todoList: Locator;
  readonly todoItems: Locator;

  constructor(page: Page) {
    this.page = page;
    this.todoInput = page.getByPlaceholder("What needs to be done?");
    this.todoList = page.locator(".todo-list");
    this.todoItems = page.locator(".todo-list li");
  }

  async goto(url?: string) {
    await this.page.goto(url || "");
    await this.todoInput.waitFor({ state: "visible", timeout: 10000 });
  }

  async addTodo(text: string) {
    await this.todoInput.fill(text);
    await this.todoInput.press("Enter");
    await expect(this.todoItems.last()).toHaveText(text);
  }

  async toggleTodo(index: number) {
    await this.todoItems.nth(index).getByRole("checkbox").click();
  }
}
