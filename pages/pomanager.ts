import { Page } from "@playwright/test";
import { TodoPage } from "./todo.page";

export class POManager {
  private readonly page: Page;
  public readonly todoPage: TodoPage;

  constructor(page: Page) {
    this.page = page;
    this.todoPage = new TodoPage(this.page);
  }
}
