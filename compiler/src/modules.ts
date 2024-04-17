import {
  commands,
  Concat,
  DynamicArrayConstructor,
  GetBuildings,
  MemoryBuilder,
  MlogMath,
  NamespaceMacro,
  Unchecked,
  VarsNamespace,
} from "./macros";
import { GetGlobal } from "./macros/GetGlobal";
import { EMutability, IScope, IValue } from "./types";
import { Asm } from "./macros/Asm";
import { ObjectValue } from "./values";
import { Scope } from "./Scope";
import { nullId, worldModuleName } from "./utils";
import { ICompilerContext } from "./CompilerContext";

/**
 * Creates the global scope of the user's script, contains all built-ins that
 * are not privileged
 */
export function createGlobalScope(c: ICompilerContext): IScope {
  const scope = new Scope({
    builtInModules: {
      [worldModuleName]: c.registerValue(createWordModule(c)),
    },
  });

  scope.hardSet("undefined", nullId);

  const data: Record<string, IValue> = {
    // namespaces
    ControlKind: new NamespaceMacro(),
    Vars: new VarsNamespace(),
    Teams: new NamespaceMacro(),
    Items: new NamespaceMacro({ changeCasing: true }),
    Liquids: new NamespaceMacro(),
    Units: new NamespaceMacro({ changeCasing: true }),
    LAccess: new NamespaceMacro(),
    Blocks: new NamespaceMacro({ changeCasing: true }),

    // helper methods
    getBuilding: new GetGlobal(EMutability.constant),
    getBuildings: new GetBuildings(),
    getVar: new GetGlobal(EMutability.mutable),
    concat: new Concat(),
    asm: new Asm(),

    Math: new MlogMath(c),
    Memory: new MemoryBuilder(),
    MutableArray: new DynamicArrayConstructor(false),
    DynamicArray: new DynamicArrayConstructor(true),
    unchecked: new Unchecked(),

    // commands
    draw: new commands.Draw(c),
    print: new commands.Print(),
    printFlush: new commands.PrintFlush(),
    drawFlush: new commands.DrawFlush(),
    getLink: new commands.GetLink(),
    control: new commands.Control(c),
    radar: new commands.Radar(),
    sensor: new commands.Sensor(),
    wait: new commands.Wait(),
    lookup: new commands.Lookup(c),
    packColor: new commands.PackColor(),
    endScript: new commands.End(),
    stopScript: new commands.Stop(),
    unitBind: new commands.UnitBind(),
    unitControl: new commands.UnitControl(c),
    unitRadar: new commands.UnitRadar(),
    unitLocate: new commands.UnitLocate(c),
  };

  for (const name in data) {
    const id = c.registerValue(data[name]);
    c.setValueName(id, name);
    scope.set(name, id);
  }

  return scope;
}

export function createWordModule(c: ICompilerContext) {
  const module = new ObjectValue(
    ObjectValue.autoRegisterData(c, {
      getBlock: new commands.GetBlock(c),
      setBlock: new commands.SetBlock(c),
      spawnUnit: new commands.SpawnUnit(),
      applyStatus: new commands.ApplyStatus(c),
      spawnWave: new commands.SpawnWave(),
      setRule: new commands.SetRule(c),
      flushMessage: new commands.FlushMessage(c),
      cutscene: new commands.Cutscene(c),
      explosion: new commands.Explosion(),
      setRate: new commands.SetRate(),
      fetch: new commands.Fetch(c),
      getFlag: new commands.GetFlag(),
      setFlag: new commands.SetFlag(),
      setProp: new commands.SetProp(),
    }),
  );
  return module;
}
