import firstNames from "./_first_names.json" with { type: "json" };
import lastNames from "./_last_names.json" with { type: "json" };
import occupations from "./_occupations.json" with { type: "json" };

export { firstNames, lastNames, occupations };

export const adultAges: string[] = Array(102).fill(undefined).map((_, i) =>
  `${i + 18}`
);

console.debug(adultAges);
