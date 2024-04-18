import { CompilerError } from "../../CompilerError";
import { NativeInstruction } from "../../flow";
import { nullId } from "../../utils";
import { LiteralValue } from "../../values";
import { MacroFunction } from "../Function";

export class SpawnWave extends MacroFunction {
  constructor() {
    super((c, cursor, loc, ...args) => {
      const natural = c.getValue(args[0]);
      const [, x, y] = args;

      if (
        !(natural instanceof LiteralValue) ||
        (natural.data !== 1 && natural.data !== 0)
      )
        throw new CompilerError(
          "The 'natural' argument must be a boolean literal",
          loc,
        );

      if (!natural.data) {
        if (!x) throw new CompilerError("Missing argument: x", loc);
        if (!y) throw new CompilerError("Missing argument: y", loc);
      }

      cursor.addInstruction(
        new NativeInstruction(
          ["spawnwave", x, y, String(!!natural.data)],
          [x, y],
          [],
          loc,
        ),
      );

      return nullId;
    });
  }
}
