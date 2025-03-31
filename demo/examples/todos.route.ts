import { stream } from "./_stream.ts";
import { escape } from "@std/html/entities";

interface Todo {
  id: string;
  done: boolean;
  text: string;
}

const todos = new Map<string, Todo>();

addTodo("Add some todos");

export const GET = stream(getTodoList);
export const POST = stream(postTodo);
export const DELETE = stream(deleteTodo);

function* getTodoList() {
  for (const todo of todos.values()) {
    yield renderTodo(todo);
  }
  yield renderBlankTodo();
}

async function* postTodo(req: Request) {
  const form = await req.formData();

  const id = form.get("id") as string | null;

  let todo = todos.get(id!);

  const done = form.get("done") === "true";
  const text: string = form.get("text") as string ?? "";

  if (todo) {
    todo.done = done;
    todo.text = text;
    yield renderTodo(todo);
  } else {
    todo = addTodo(text, done);
    yield renderTodo(todo);
    yield renderBlankTodo();
  }
}

async function* deleteTodo(req: Request) {
  const params = new URL(req.url).searchParams;
  const id = params.get("id");
  todos.delete(id!);
  yield "";
}

function renderTodo(todo: Todo): string {
  const id = escape(todo.id);
  const text = escape(todo.text);
  return /*html*/ `
<li class="todo-item">
  <form class="row" on-submit="prevent-default |> post todos |> target closest li |> swap outer">
    <input name="done" type="checkbox" value="true"
      ${todo.done ? "checked" : ""}
      on-change="target closest form |> dispatch submit">

    <input name="text" type="text" value="${text}"
      on-change="target closest form |> dispatch submit">

    <input type="hidden" name="id" value="${id}"/>

    <button type="button" on-click="target closest li |> delete todos?id=${id} |> swap outer">Delete</button>
  </form>
</li>
`;
}

function renderBlankTodo(): string {
  return /*html*/ `
<li class="todo-item">
  <form class="row" on-submit="prevent-default |> post todos |> target closest li |> swap outer">
    <input name="done" type="checkbox" value="true">
    <input name="text" type="text" value="" autofocus>
    <button type="submit">Add</button>
  </form>
</li>
`;
}

function addTodo(text: string, done: boolean = false): Todo {
  const id = crypto.randomUUID();
  const todo = { id, done, text };
  todos.set(id, todo);
  return todo;
}
