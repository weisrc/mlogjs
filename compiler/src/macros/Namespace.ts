import { camelToDashCase } from "../utils";
import { EMutability, IValue, es } from "../types";
import { LiteralValue, ObjectValue, StoreValue } from "../values";
import { CompilerError } from "../CompilerError";
import { ICompilerContext } from "../CompilerContext";
import { GlobalId, ImmutableId, LoadInstruction } from "../flow";
import { IBlockCursor } from "../BlockCursor";

const dynamicVars = ["time", "tick", "unit"];

interface NamespaceMacroOptions {
  changeCasing?: boolean;
}
export class NamespaceMacro extends ObjectValue {
  changeCasing: boolean;
  constructor({ changeCasing = false }: NamespaceMacroOptions = {}) {
    super();
    this.changeCasing = changeCasing;
  }

  get(
    c: ICompilerContext,
    cursor: IBlockCursor,
    targetId: ImmutableId,
    propId: ImmutableId,
    node: es.Node,
  ): ImmutableId {
    const key = c.getValue(propId);
    if (key && super.hasProperty(c, key))
      return super.get(c, cursor, targetId, propId, node);

    if (!(key instanceof LiteralValue) || !key.isString())
      throw new CompilerError(
        "Cannot use dynamic properties on namespace macros",
      );
    const symbolName = this.changeCasing ? camelToDashCase(key.data) : key.data;

    const mutability = dynamicVars.includes(symbolName)
      ? EMutability.readonly
      : EMutability.constant;

    const store = new StoreValue(`@${symbolName}`, mutability);
    const out = new ImmutableId();
    if (mutability === EMutability.constant) {
      c.setValue(out, store);
    } else {
      const globalId = new GlobalId();
      c.setValue(globalId, store);
      cursor.addInstruction(new LoadInstruction(globalId, out, node));
    }

    return out;
  }

  hasProperty(c: ICompilerContext, prop: IValue): boolean {
    return prop instanceof LiteralValue && prop.isString();
  }
}

export class VarsNamespace extends NamespaceMacro {
  constructor() {
    super();
  }
}
