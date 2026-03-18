import { test } from "../fixtures";

test("add todo", async ({ poManager }) => {
  await poManager.todoPage.addTodo("Learn to use Playwright agents");
});
