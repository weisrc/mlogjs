import { ICompilerContext } from "../../CompilerContext";
import { InstructionBase } from "../../instructions";
import { ObjectValue } from "../../values";
import { createOverloadNamespace } from "../util";

export class FlushMessage extends ObjectValue {
  constructor(c: ICompilerContext) {
    const data = createOverloadNamespace({
      c,
      overloads: {
        notify: { args: [] },
        mission: { args: [] },
        announce: { args: ["duration"] },
        toast: { args: ["duration"] },
      },
      handler(c, overload, out, duration) {
        return [new InstructionBase("message", overload, duration)];
      },
    });
    super(data);
  }
}
