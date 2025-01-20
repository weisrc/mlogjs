import { CompilerError } from "./CompilerError";
import * as handlers from "./handlers";
import {
  es,
  IScope,
  THandler,
  IValue,
  TDeclarationKind,
  IWriteableHandler,
} from "./types";
import { CompilerOptions } from "./Compiler";
import { nullId } from "./utils";
import { LiteralValue, StoreValue } from "./values";
import { GlobalId, ImmutableId, ValueId } from "./flow/id";
import { IBlockCursor } from "./BlockCursor";

export interface ICompilerContext {
  readonly compactNames: boolean;
  readonly sourcemap: boolean;

  resolveImmutableId(id: ImmutableId): ImmutableId;
  resolveId(id: ValueId): ValueId;
  getValueName(id: ValueId): string | undefined;
  setValueName(id: ValueId, name: string): void;
  getValueId(name: string): ValueId | undefined;

  getValue(id: ValueId | undefined): IValue | undefined;
  getValueOrTemp(id: ValueId): IValue;
  setValue(id: ValueId, value: IValue): void;
  registerValue(value: IValue): ImmutableId;
  setAlias(alias: ImmutableId, original: ImmutableId): void;
  setGlobalAlias(alias: ImmutableId, original: GlobalId): void;

  handle(
    scope: IScope,
    cursor: IBlockCursor,
    node: es.Node,
    handler?: THandler,
    arg?: unknown,
  ): ImmutableId;

  handleWriteable(
    scope: IScope,
    cursor: IBlockCursor,
    node: es.Node,
    handler?: THandler,
    arg?: unknown,
  ): IWriteableHandler;

  handleDeclaration(
    scope: IScope,
    cursor: IBlockCursor,
    node: es.Node,
    kind: TDeclarationKind,
    init?: ImmutableId,
    handler?: THandler,
  ): void;

  /**
   * Handles many nodes in order.
   *
   * The usage of this method over a regular loop over an array of nodes is only
   * required if the code inside the loop generates instructions that are not
   * tracked by the compiler handler methods ({@link handle}, {@link handleEval}
   * and {@link handleMany})
   */
  handleMany<T extends es.Node>(
    scope: IScope,
    cursor: IBlockCursor,
    nodes: T[],
    handler?: (node: T) => ValueId,
  ): ImmutableId;
}

export class CompilerContext implements ICompilerContext {
  protected handlers: Partial<Record<es.Node["type"], THandler>> = handlers;
  #tempCounter = 0;
  #names = new Map<ValueId, string>();
  #ids = new Map<string, ValueId>();
  #values = new Map<ValueId, IValue>();
  aliases = new Map<ImmutableId, ValueId>();

  readonly compactNames: boolean;
  readonly sourcemap: boolean;

  constructor({
    compactNames = false,
    sourcemap = false,
  }: Required<CompilerOptions>) {
    this.compactNames = compactNames;
    this.sourcemap = sourcemap;
    this.setValue(nullId, new LiteralValue(null));
  }

  resolveId(id: ValueId): ValueId {
    if (id.type === "global") return id;
    return this.aliases.get(id) ?? id;
  }

  resolveImmutableId(id: ImmutableId): ImmutableId {
    const resolved = this.aliases.get(id);
    if (resolved?.type === "immutable") return resolved;
    return id;
  }

  getValue(id: ValueId | undefined): IValue | undefined {
    if (!id) return;
    return this.#values.get(this.resolveId(id));
  }

  getValueOrTemp(id: ValueId): IValue {
    const value = this.getValue(id);
    if (value) return value;

    const name = this.getValueName(id);
    const store = new StoreValue(name ?? `&t${this.#tempCounter++}`);
    this.setValue(id, store);
    return store;
  }
  setValue(id: ValueId, value: IValue): void {
    this.#values.set(this.resolveId(id), value);
  }

  registerValue(value: IValue): ImmutableId {
    const id = new ImmutableId();
    this.#values.set(id, value);
    return id;
  }

  setAlias(alias: ImmutableId, original: ImmutableId): void {
    const id = this.aliases.get(original) ?? original;
    this.aliases.set(alias, id);
  }

  setGlobalAlias(alias: ImmutableId, original: GlobalId): void {
    // const id = this.#aliases.get(original) ?? original;
    this.aliases.set(alias, original);
  }

  getValueName(id: ValueId): string | undefined {
    return this.#names.get(this.resolveId(id));
  }

  setValueName(id: ValueId, name: string): void {
    id = this.resolveId(id);
    this.#names.set(id, name);
    this.#ids.set(name, id);
  }

  getValueId(name: string): ValueId | undefined {
    return this.#ids.get(name);
  }

  handle(
    scope: IScope,
    cursor: IBlockCursor,
    node: es.Node,
    handler = this.handlers[node.type],
    arg?: unknown,
  ): ImmutableId {
    try {
      if (!handler) throw new CompilerError("Missing handler for " + node.type);
      const result = handler(this, scope, cursor, node, arg);
      // if (this.sourcemap) return appendSourceLocations(result, node);
      return result;
    } catch (error) {
      if (error instanceof CompilerError) {
        error.loc ??= node.loc as es.SourceLocation;
      }
      throw error;
    }
  }

  handleWriteable(
    scope: IScope,
    cursor: IBlockCursor,
    node: es.Node,
    handler = this.handlers[node.type],
    arg?: unknown,
  ): IWriteableHandler {
    try {
      if (!handler?.handleWriteable)
        throw new CompilerError("Missing handler for " + node.type);
      const result = handler.handleWriteable(this, scope, cursor, node, arg);
      // if (this.sourcemap) return appendSourceLocations(result, node);
      return result;
    } catch (error) {
      if (error instanceof CompilerError) {
        error.loc ??= node.loc as es.SourceLocation;
      }
      throw error;
    }
  }

  handleDeclaration(
    scope: IScope,
    cursor: IBlockCursor,
    node: es.Node,
    kind: TDeclarationKind,
    init?: ImmutableId,
    handler = this.handlers[node.type],
  ): void {
    try {
      if (!handler?.handleDeclaration)
        throw new CompilerError("Missing handler for " + node.type);
      handler.handleDeclaration(this, scope, cursor, node, kind, init);
    } catch (error) {
      if (error instanceof CompilerError) {
        error.loc ??= node.loc as es.SourceLocation;
      }
      throw error;
    }
  }

  /**
   * Handles many nodes in order.
   *
   * The usage of this method over a regular loop over an array of nodes is only
   * required if the code inside the loop generates instructions that are not
   * tracked by the compiler handler methods ({@link handle}, {@link handleEval}
   * and {@link handleMany})
   */
  handleMany<T extends es.Node>(
    scope: IScope,
    cursor: IBlockCursor,
    nodes: T[],
    handler?: (node: T) => ImmutableId,
  ): ImmutableId {
    for (const node of hoistedFunctionNodes(nodes)) {
      this.handle(scope, cursor, node, handler && (() => handler(node)));
    }
    return nullId;
  }
}

function* hoistedFunctionNodes<T extends es.Node>(nodes: T[]) {
  // sorting is O(n long n) while this is just O(n)
  // besides, it's better not to modify the node array
  for (const node of nodes) {
    if (node.type === "FunctionDeclaration") {
      yield node;
    }
  }

  for (const node of nodes) {
    if (node.type !== "FunctionDeclaration") {
      yield node;
    }
  }
}