// Adapted from https://github.com/bigskysoftware/htmx/blob/master/src/htmx.js (see LICENSE_htmx)

import { parseInterval } from "./parse_interval.ts";
import { triggerErrorEvent } from "./trigger_event.ts";
import type { RuleTarget, TriggerSpec } from "./types.ts";

const WHITESPACE_OR_COMMA = /[\s,]/;
const SYMBOL_START = /[_$a-zA-Z]/;
const SYMBOL_CONT = /[_$a-zA-Z0-9]/;
const STRINGISH_START = ['"', "'", "/"];
const NOT_WHITESPACE = /[^\s]/;

const INPUT_SELECTOR = "input, textarea, select";

export function parseTriggers(
  target: RuleTarget,
  triggerValue?: string,
  defaultEventType = "click",
): TriggerSpec[] {
  const triggerSpecs: TriggerSpec[] = [];
  const elt = target instanceof Element
    ? target
    : target.parentStyleSheet?.ownerNode instanceof Element
    ? target.parentStyleSheet.ownerNode
    : undefined;

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
          // const eventFilter = maybeGenerateConditional(elt, tokens, "event");
          // if (eventFilter) {
          //   every.eventFilter = eventFilter;
          // }
          triggerSpecs.push(every);
        } else {
          const triggerSpec: TriggerSpec = { eventType: trigger };
          // const eventFilter = maybeGenerateConditional(elt, tokens, "event");
          // if (eventFilter) {
          //   triggerSpec.eventFilter = eventFilter;
          // }
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
            } else if (token === "from" && tokens[0] === ":") {
              tokens.shift();
              let from_arg = consumeUntil(tokens, WHITESPACE_OR_COMMA);
              if (
                from_arg === "closest" || from_arg === "find" ||
                from_arg === "next" || from_arg === "previous"
              ) {
                tokens.shift();
                from_arg += " " +
                  consumeUntil(
                    tokens,
                    WHITESPACE_OR_COMMA,
                  );
              }
              triggerSpec.from = from_arg;
            } else if (token === "target" && tokens[0] === ":") {
              tokens.shift();
              triggerSpec.target = consumeUntil(tokens, WHITESPACE_OR_COMMA);
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
              triggerErrorEvent(elt ?? document, "triggerSyntax", {
                token: tokens.shift(),
              });
            }
          }
          triggerSpecs.push(triggerSpec);
        }
      }
      if (tokens.length === initialLength) {
        triggerErrorEvent(elt ?? document, "triggerSyntax", {
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
