import { CompilerError } from "../CompilerError";
import { AsmInstruction, ImmutableId } from "../flow";
import { isTemplateObjectArray } from "../utils";
import { LiteralValue } from "../values";
import { MacroFunction } from "./Function";

export class Asm extends MacroFunction {
  constructor() {
    super((c, cursor, node, arrayId, ...ids) => {
      const stringsArray = c.getValue(arrayId);

      if (!isTemplateObjectArray(c, stringsArray))
        throw new CompilerError("Expected to receive a template strings array");

      const args: (string | ImmutableId)[] = [];

      for (let i = 0; i < ids.length; i++) {
        const itemId = stringsArray.data[i];
        const item = c.getValue(itemId) as LiteralValue<string>;
        args.push(item.data);
        args.push(ids[i]);
      }

      const { length } = stringsArray.data;

      const tailId = stringsArray.data[length.data - 1];
      const tail = c.getValue(tailId) as LiteralValue<string>;
      // const [tail] = stringsArray.get(
      //   scope,
      //   new LiteralValue(length.data - 1),
      // ) as [LiteralValue<string>, never];
      args.push(tail.data);

      // cursor.addInstruction(new AsmInstruction());

      const lines = formatInstructions(args);

      // return [null, formatInstructions(args)];
      return c.nullId;
    });
  }
}

/** Splits multiline asm calls and formats each line. */
function formatInstructions(args: (string | ImmutableId)[]) {
  const instructions: (string | ImmutableId)[][] = [];

  let buffer: (string | ImmutableId)[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (typeof arg !== "string" || !arg.includes("\n")) {
      buffer.push(arg);
      continue;
    }

    const segments = arg.split("\n");

    const params = [...buffer, segments[0]];

    if (validateInstructionArgs(params)) {
      instructions.push(params);
      buffer = [];
    }

    // iterates over all segments except the first and last
    // the first segment was already processed above
    // the last segment will be added to the buffer because there might
    // be an interpolation after it
    // and putting it in the buffer makes sure it has a proper output format
    for (let i = 1; i < segments.length - 1; i++) {
      const trimmed = segments[i].trim();
      if (trimmed.length == 0) continue;
      instructions.push([trimmed]);
    }

    if (segments.length > 1) {
      buffer.push(segments[segments.length - 1]);
    }
  }

  if (buffer.length > 0 && validateInstructionArgs(buffer)) {
    instructions.push(buffer);
  }

  return instructions;
}

/**
 * Determines if an asm line should be generated and trims it at the start and
 * end
 */
function validateInstructionArgs(args: (string | ImmutableId)[]) {
  if (args.length === 0) return false;
  if (args.length === 1) {
    const item = args[0];
    if (typeof item !== "string") return true;
    args[0] = item.trim();
    return args[0].length !== 0;
  }

  const first = args[0];
  const last = args[args.length - 1];
  if (typeof first === "string") args[0] = first.trimStart();
  if (typeof last === "string") args[args.length - 1] = last.trimEnd();
  return true;
}
