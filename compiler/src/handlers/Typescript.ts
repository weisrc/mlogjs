import { CompilerError } from "../CompilerError";
import { es, THandler, TValueInstructions } from "../types";
import { nodeName } from "../utils";
import { IObjectValueData, LiteralValue, ObjectValue } from "../values";
import { ValueOwner } from "../values/ValueOwner";

const TypeCastExpression: THandler = (
  c,
  scope,
  node: es.TSAsExpression | es.TSTypeAssertion
) => {
  return c.handle(scope, node.expression) as TValueInstructions;
};

export const TSAsExpression = TypeCastExpression;

export const TSTypeAssertion = TypeCastExpression;

const IgnoredHandler: THandler<null> = () => [null, []];

export const TSInterfaceDeclaration = IgnoredHandler;

export const TSTypeAliasDeclaration = IgnoredHandler;

export const TSEnumDeclaration: THandler<null> = (
  c,
  scope,
  node: es.TSEnumDeclaration
) => {
  if (!node.const)
    throw new CompilerError(
      "All enums must be declared with the const keyword before enum"
    );
  let counter = 0;
  let hasString = false;

  const data: IObjectValueData = {};

  for (const member of node.members) {
    if (hasString && !member.initializer)
      throw new CompilerError("This enum member must be initialized", [member]);

    const [value] = member.initializer
      ? c.handleEval(scope, member.initializer)
      : [new LiteralValue(scope, counter)];

    if (!(value instanceof LiteralValue))
      throw new CompilerError("Enum members must contain literal values", [
        member,
      ]);

    if (typeof value.data === "number") {
      counter = value.data + 1;
    } else {
      hasString = true;
    }

    const name =
      member.id.type === "Identifier" ? member.id.name : member.id.value;
    data[name] = value;
  }

  scope.set(
    new ValueOwner({
      scope,
      value: new ObjectValue(scope, data),
      constant: true,
      identifier: node.id.name,
      name: c.compactNames ? nodeName(node) : scope.formatName(node.id.name),
    })
  );

  return [null, []];
};
