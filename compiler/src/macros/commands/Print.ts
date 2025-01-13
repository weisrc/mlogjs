import { LiteralValue } from "../../values";
import { isTemplateObjectArray, nullId } from "../../utils";
import { NativePrintInstruction } from "../../flow";
import { MacroFunction } from "../Function";

export class Print extends MacroFunction {
  constructor() {
    super((c, cursor, loc, ...values) => {
      const first = c.getValue(values[0]);
      if (!isTemplateObjectArray(c, first)) {
        for (const value of values) {
          cursor.addInstruction(new NativePrintInstruction(value, loc));
        }
        return nullId;
      }

      // `first` is likely a template strings array
      // maybe this should be checked in another way?
      const length = c.getValue(first.data.length) as LiteralValue<number>;

      for (let i = 1; i < values.length; i++) {
        const id = first.data[i - 1];
        const string = c.getValue(id) as LiteralValue<string>;
        console.log(string);
        if (string.data)
          cursor.addInstruction(new NativePrintInstruction(id, loc));
        cursor.addInstruction(new NativePrintInstruction(values[i], loc));
      }
      const tailId = first.data[length.data - 1];

      const tail = c.getValue(tailId) as LiteralValue<string>;
      if (tail.data)
        cursor.addInstruction(new NativePrintInstruction(tailId, loc));

      return nullId;
    });
  }
}
