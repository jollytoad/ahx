import { stream } from "./_stream.ts";
import { getRandomRows } from "./_random.ts";
import { adultAges, firstNames, lastNames, occupations } from "./_data.ts";

export default stream(table);

const columns = ["First Name", "Last Name", "Occupation", "Age"];

async function* table() {
  yield `<thead>`;
  yield `<tr>`;
  yield columns.map((cell) => `<th>${cell}</th>`).join("");
  yield `</tr>`;
  yield `</thead>`;
  yield `<tbody>`;
  for (
    const row of getRandomRows(
      50,
      firstNames,
      lastNames,
      occupations,
      adultAges,
    )
  ) {
    yield `<tr>`;
    yield row.map((cell) => `<td>${cell}</td>`).join("");
    yield `</tr>`;
  }
  yield `</tbody>`;
}
