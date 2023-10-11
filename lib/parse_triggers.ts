// Adapted from https://github.com/bigskysoftware/htmx/blob/master/src/htmx.js (see LICENSE_htmx)

import { parseInterval } from "./parse_interval.ts";
import { dispatchError } from "./dispatch.ts";
import type { TriggerOrigin, TriggerSpec } from "./types.ts";
import { resolveElement } from "./resolve_element.ts";

const WHITESPACE_OR_COMMA = /[\s,]/;
const SYMBOL_START = /[_$a-zA-Z]/;
const SYMBOL_CONT = /[_$a-zA-Z0-9]/;
const STRINGISH_START = ['"', "'", "/"];
const NOT_WHITESPACE = /[^\s]/;

const INPUT_SELECTOR = "input, textarea, select";

export function parseTriggers(
  origin: TriggerOrigin,
  triggerValue?: string,
  defaultEventType = "click",
): TriggerSpec[] {
  const triggerSpecs: TriggerSpec[] = [];
  const elt = origin instanceof Element ? origin : undefined;
  const target = resolveElement(origin) ?? document;

  if (triggerValue) {
    const tokens = tokenizeString(triggerValue);
    do {
      consumeUntil(tokens, NOT_WHITESPACE);
      const initialLength = tokens.length;
      const trigger = consumeUntil(tokens, /[,\[\s]/);
      if (trigger) {
        if (trigger === "every") {
          const every: TriggerSpec = { eventType: "every" };
          consumeUntil(tokens, NOT_WHITESPACE);
          every.pollInterval = parseInterval(consumeUntil(tokens, /[,\[\s]/));
          consumeUntil(tokens, NOT_WHITESPACE);
          triggerSpecs.push(every);
        } else {
          const triggerSpec: TriggerSpec = { eventType: trigger };
          while (tokens.length > 0 && tokens[0] !== ",") {
            consumeUntil(tokens, NOT_WHITESPACE);
            const token = tokens.shift();
            if (token === "changed") {
              triggerSpec.changed = true;
            } else if (token === "once") {
              triggerSpec.once = true;
            } else if (token === "delay" && tokens[0] === ":") {
              tokens.shift();
              triggerSpec.delay = parseInterval(
                consumeUntil(tokens, WHITESPACE_OR_COMMA),
              );
            } else if (token === "throttle" && tokens[0] === ":") {
              tokens.shift();
              triggerSpec.throttle = parseInterval(
                consumeUntil(tokens, WHITESPACE_OR_COMMA),
              );
            } else if (token === "queue" && tokens[0] === ":") {
              tokens.shift();
              // TODO: validate queue keyword
              triggerSpec.queue = consumeUntil(
                tokens,
                WHITESPACE_OR_COMMA,
              ) as typeof triggerSpec["queue"];
            } else {
              dispatchError(target, "triggerSyntax", {
                token: tokens.shift(),
              });
            }
          }
          triggerSpecs.push(triggerSpec);
        }
      }
      if (tokens.length === initialLength) {
        dispatchError(target, "triggerSyntax", {
          token: tokens.shift(),
        });
      }
      consumeUntil(tokens, NOT_WHITESPACE);
    } while (tokens[0] === "," && tokens.shift());
  }

  if (triggerSpecs.length > 0) {
    return triggerSpecs;
  } else if (elt?.matches("form")) {
    return [{ eventType: "submit" }];
  } else if (elt?.matches('input[type="button"], input[type="submit"]')) {
    return [{ eventType: "click" }];
  } else if (elt?.matches(INPUT_SELECTOR)) {
    return [{ eventType: "change" }];
  } else {
    return [{ eventType: defaultEventType }];
  }
}

function tokenizeString(str: string): string[] {
  const tokens: string[] = [];
  let position = 0;
  while (position < str.length) {
    if (SYMBOL_START.exec(str.charAt(position))) {
      const startPosition = position;
      while (SYMBOL_CONT.exec(str.charAt(position + 1))) {
        position++;
      }
      tokens.push(str.substr(startPosition, position - startPosition + 1));
    } else if (STRINGISH_START.indexOf(str.charAt(position)) !== -1) {
      const startChar = str.charAt(position);
      const startPosition = position;
      position++;
      while (position < str.length && str.charAt(position) !== startChar) {
        if (str.charAt(position) === "\\") {
          position++;
        }
        position++;
      }
      tokens.push(str.substr(startPosition, position - startPosition + 1));
    } else {
      const symbol = str.charAt(position);
      tokens.push(symbol);
    }
    position++;
  }
  return tokens;
}

function consumeUntil(tokens: string[], match: string | RegExp): string {
  let result = "";
  while (tokens.length > 0 && !tokens[0].match(match)) {
    result += tokens.shift();
  }
  return result;
}
