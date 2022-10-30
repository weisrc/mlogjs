import { CompilerError } from "../CompilerError";
import { EMutability, IValue } from "../types";
import { LiteralValue, SenseableValue } from "../values";
import { MacroFunction } from "./Function";

export class GetGlobal extends MacroFunction {
  constructor(mutability: EMutability) {
    super((scope, out, name: IValue) => {
      if (!(name instanceof LiteralValue) || typeof name.data !== "string")
        throw new CompilerError("The name parameter must be a string literal.");

      const result = SenseableValue.named(scope, name.data, mutability);

      return [result, []];
    });
  }
}
