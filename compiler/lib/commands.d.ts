import "./kind";
import {
  TRadarFilter,
  TRadarSort,
  TUnitEffect,
  TUnitLocateBuildingGroup,
} from "./util";
declare global {
  /**
   * Appends the items to the print buffer, calling this function
   * on its own will not print any contents to a message block.
   *
   * To print the contents of the print buffer and empty it call `printFlush`.
   *
   * @param items The items to be added to the print buffer.
   *
   * ```js
   *  // call normally
   *  print("a + b = ", left, " + ", right, " = ", left + right)
   *
   *  // call with tagged string templates
   *  print`a + b = ${left} + ${right} = ${left + right}`
   * ```
   */
  function print(...items: unknown[]): void;

  /** Contains the multiple variants of the `draw` instruction */
  namespace draw {
    /**
     * Fills the screen with a color.
     *
     * Warning: nothing is drawn until `drawFlush` is called.
     */
    function clear(r: number, g: number, b: number): void;
    /**
     * Sets the color for the next drawing operations.
     *
     * Warning: nothing is drawn until `drawFlush` is called.
     */
    function color(r: number, g: number, b: number, a?: number): void;

    /**
     * Sets the width of the next lines to be drawn.
     *
     * Warning: nothing is drawn until `drawFlush` is called.
     */
    function stroke(width: number): void;

    /**
     * Draws a line between two points.
     *
     * Warning: nothing is drawn until `drawFlush` is called.
     */
    function line(options: {
      x: number;
      y: number;
      x2: number;
      y2: number;
    }): void;

    /**
     * Draws a filled rectangle.
     *
     * Warning: nothing is drawn until `drawFlush` is called.
     */
    function rect(options: {
      x: number;
      y: number;
      width: number;
      height: number;
    }): void;

    /**
     * Draws a rectangle outline.
     *
     * Warning: nothing is drawn until `drawFlush` is called.
     */
    function lineRect(options: {
      x: number;
      y: number;
      width: number;
      height: number;
    }): void;

    /**
     * Draws a filled, regular polygon.
     * @param options.sides The number of sides the polygon should have
     * @param options.radius The smallest distance between a line and the center of the polygon
     * @param options.rotation The rotation of the polygon in degrees
     *
     * Warning: nothing is drawn until `drawFlush` is called.
     */
    function poly(options: {
      x: number;
      y: number;
      /** The number of sides the polygon should have */
      sides: number;
      /** The smallest distance between a line and the center of the polygon */
      radius: number;
      /** The rotation of the polygon in degrees */
      rotation: number;
    }): void;

    /**
     * Draws the outline of a regular polygon.
     * @param options.sides The number of sides the polygon should have
     * @param options.radius The smallest distance between a line and the center of the polygon
     * @param options.rotation The rotation of the polygon in degrees
     *
     *
     * Warning: nothing is drawn until `drawFlush` is called.
     */
    function linePoly(options: {
      x: number;
      y: number;
      /** The number of sides the polygon should have */
      sides: number;
      /** The smallest distance between a line and the center of the polygon */
      radius: number;
      /** The rotation of the polygon in degrees */
      rotation: number;
    }): void;

    /**
     * Draws a filled triangle.
     *
     * Warning: nothing is drawn until `drawFlush` is called.
     */
    function triangle(options: {
      x: number;
      y: number;
      x2: number;
      y2: number;
      x3: number;
      y3: number;
    }): void;

    /**
     * Draws an image of the respective content. (like `Units.dagger` and `Blocks.router`)
     *
     * Warning: nothing is drawn until `drawFlush` is called.
     * @param options.image The symbol for the image to be drawn.
     * @param options.rotation The rotation of the image in degrees.
     *
     * Example:
     * ```js
     * // draw a router
     * draw({
     *  mode: "image",
     *  x: 30,
     *  y: 30,
     *  image: Blocks.router,
     *  size: 15,
     *  rotation: 0
     * });
     *
     * // draw the unit bound to the processor
     * draw({
     *  mode: "image",
     *  x: 60,
     *  y: 60,
     *  image: Vars.unit.type,
     *  size: 15,
     *  rotation: 0
     * });
     * ```
     */
    function image(options: {
      x: number;
      y: number;
      /** The symbol for the image to be drawn. */
      image: symbol;
      size: number;
      /** The rotation of the image in degrees. */
      rotation: number;
    }): void;
  }

  /**
   * Writes the contents of the print buffer into the target message
   * and clears the buffer afterwards.
   * @param target The message building to write to. Writes to `message1` by default.
   *
   * Note that the default value only applies if you don't pass any parameter to this function.
   */
  function printFlush(target?: BasicBuilding): void;

  /**
   * Writes the contents of the draw buffer into the target display
   * and clears the buffer afterwards.
   * @param target The display building to write to. Writes to `display1` by default.
   *
   * Note that the default value only applies if you don't pass any parameter to this function.
   */
  function drawFlush(target?: BasicBuilding): void;

  /**
   * Gets a block link by its index.
   *
   * To make safe queries it is recommended to check an index
   * before trying to get a link. This can be done by using `Vars.links`.
   * @param index
   *
   * Example:
   * ```js
   * if(index < Vars.links) {
   *   myBlock = getLink(index)
   * }
   * ```
   */
  function getLink<T extends BasicBuilding = AnyBuilding>(index: number): T;

  /** Contains the multiple variants of the `control` instruction */
  namespace control {
    /**
     * Sets whether the building is enabled or disabled.
     */
    function enabled(building: BasicBuilding, value: boolean): void;

    /**
     * Makes the building shoot or aim at the given position
     * @param options.building The shooting building
     * @param options.shoot `true` to shoot, `false` to just aim at the position
     */
    function shoot(options: {
      /** The shooting building */
      building: BasicBuilding & Shooting;
      x: number;
      y: number;
      /** `true` to shoot, `false` to just aim at the position */
      shoot: boolean;
    }): void;

    /**
     * Shoot at an unit with velocity prediction
     * @param options.building The shooting building
     * @param options.unit The target unit
     * @param options.shoot `true` to shoot, `false` to just aim
     */
    function shootp(options: {
      /** The shooting building */
      building: BasicBuilding & Shooting;
      /** The target unit */
      unit: BasicUnit;
      /** `true` to shoot, `false` to just aim */
      shoot: boolean;
    }): void;

    /**
     * Sets the config of a block (like the item of a sorter)
     */
    function config(building: BasicBuilding, value: symbol): void;

    /**
     * Sets the color of an illuminator
     */
    function color(
      building: BasicBuilding,
      r: number,
      g: number,
      b: number
    ): void;
  }

  /**
   * Detects an unit nearby this `building`.
   * @param options.building The building used to detect potential targets
   * @param options.filters The filters for selecting a target. Use "any" for any target.
   * @param options.order The n th unit that fits these requirements based on the sorting method
   *  (1 => first unit, 2 => second unit and so on)
   * @param options.sort The method on which the results should be sorted
   *
   * Example:
   * ```js
   *  const turret = getBuilding("cyclone1")
   *  // returns the second nearest enemy unit
   *  const result = radar({
   *    building: turret,
   *    filters: ["enemy", "any", "any"],
   *    order: 2,
   *    sort: "distance"
   *  });
   * ```
   */
  function radar<T extends BasicUnit = AnyUnit>(options: {
    /** The building used to detect potential targets */
    building: BasicBuilding;
    /** The filters for selecting a target. Use "any" for any target. */
    filters: [TRadarFilter, TRadarFilter, TRadarFilter];
    /** The n th unit that fits these requirements based on the sorting method
     *  (1 => first unit, 2 => second unit and so on) */
    order: number;
    /** The method on which the results should be sorted */
    sort: TRadarSort;
  }): T;

  /**
   * Alternate way to access special properties on objects.
   *
   * This method allows you to use customly created symbols
   * and sensor them on buildings.
   * @param property The property to be sensed on the building
   * @param target
   *
   * Example:
   * ```js
   *  let myBuilding = getBuilding("container1")
   *  // jsdoc doesn't allow me to type this
   * // variable, but you should type it as a symbol in this case
   *  let myCustomSymbol = getVar("@custom-symbol") // problably defined by a mod
   *  let result = sensor(myCustomSymbol, myBuilding)
   * ```
   */
  function sensor<T>(property: symbol, target: BasicBuilding | BasicUnit): T;

  /**
   * Stops the execution for the given amount of seconds
   */
  function wait(seconds: number): void;

  namespace lookup {
    /**
     * Looks up a block symbol by it's index on the content registry.
     *
     * Use `Vars.blockCount` to check the maximum index allowed.
     *
     * Example:
     * ```js
     * if(index < Vars.blockCount) {
     *   let blockKind = lookup.block(index);
     * }
     * ```
     */
    function block(index: number): BlockSymbol;

    /**
     * Looks up an unit symbol by it's index on the content registry.
     *
     * Use `Vars.unitCount` to check the maximum index allowed.
     *
     * Example:
     * ```js
     * if(index < Vars.unitCount) {
     *   let unitKind = lookup.unit(index);
     * }
     * ```
     */
    function unit(index: number): UnitSymbol | null;

    /**
     * Looks up an item symbol by it's index on the content registry.
     *
     * Use `Vars.itemCount` to check the maximum index allowed.
     *
     * Example:
     * ```js
     * if(index < Vars.itemCount) {
     *   let itemKind = lookup.item(index);
     * }
     * ```
     */
    function item(index: number): ItemSymbol | null;

    /**
     * Looks up a liquid symbol by it's index on the content registry.
     *
     * Use `Vars.liquidCount` to check the maximum index allowed.
     *
     * Example:
     * ```js
     * if(index < Vars.liquidCount) {
     *   let liquidKind = lookup.liquid(index);
     * }
     * ```
     */
    function liquid(index: number): LiquidSymbol | null;
  }

  /**
   * Packs RGBA color information into a single number.
   *
   * Each paremeter must range from `0` to `1`.
   */
  function packColor(r: number, g: number, b: number, a: number): number;

  /**
   * Binds an unit to the this processor. The unit is accessible at `Vars.unit`
   */
  function unitBind(type: UnitSymbol): void;

  namespace unitControl {
    /**
     * Makes the unit bound to this processor stop moving but
     * allows it to keep doing it's action (like mining or building)
     */
    function idle(): void;

    /**
     * Makes the unit bound to this processor stop mining, building and moving
     */
    function stop(): void;

    /**
     * Makes the unit bound to this processor move to the given position
     */
    function move(x: number, y: number): void;

    /**
     * Makes the unit bound to this processor approach the given position at the given radius
     * @param options.radius How distant to the position the unit can be
     */
    function approach(options: {
      x: number;
      y: number;
      /** How distant to the position the unit can be */
      radius: number;
    }): void;

    /**
     * Whether the unit bound to this processor should be boosted (floating)
     */
    function boost(enable: boolean): void;

    /**
     * Makes the unit bound to this processor move to the enemy spawn
     */
    function pathfind(): void;

    /**
     * Makes the unit bound to this processor shoot/aim at the given position
     * @param options.shoot `true` to shoot, `false` to just aim
     */
    function target(options: {
      x: number;
      y: number;
      /** `true` to shoot, `false` to just aim */
      shoot: boolean;
    }): void;

    /**
     * Makes the unit bound to this processor target an unit with velocity prediction
     * @param options.unit The shoot target
     * @param options.shoot `true` to shoot, `false` to just aim
     */
    function targetp(options: {
      /** The shoot target */
      unit: BasicUnit;
      /** `true` to shoot, `false` to just aim */
      shoot: boolean;
    }): void;

    /**
     * Makes the unit bound to this processor drop it's held items onto the given target
     * @param target Where to drop the items, if `EnvBlocks.air`, the unit will throw it's items away
     * @param amount How many items should be dropped
     */
    function itemDrop(
      target: BasicBuilding | typeof Blocks.air,
      amount: number
    ): void;

    /**
     * Makes the unit bound to this processor take items from a building
     * @param target The building that will have it's items taken
     * @param item The kind of item to take
     * @param amount How many items should be taken
     */
    function itemTake(
      target: BasicBuilding,
      item: ItemSymbol,
      amount: number
    ): void;

    /**
     * Makes the unit bound to this processor drop one entity from it's payload
     */
    function payDrop(): void;

    /**
     * Makes the unit bound to this processor take an entity into it's payload
     * @param options.takeUnits Whether to take units or buildings
     */
    function payTake(options: {
      /** Whether to take units or buildings */
      takeUnits: boolean;
    }): void;

    /**
     * Makes the unit bound to this processor enter/land on the
     * payload block the unit is on
     */
    function payEnter(): void;

    /**
     * Makes the unit bound to this processor mine at the given position
     */
    function mine(x: number, y: number): void;

    /**
     * Sets the numeric flag of the unit bound to this processor
     */
    function flag(value: number): void;

    /**
     * Makes the unit bound to this processor build a building with the
     * given properties
     * @param options.block The kind of building to build
     * @param options.rotation The rotation of the building, ranges from 0 to 3
     * @param options.config The config of the building
     */
    function build(options: {
      x: number;
      y: number;
      block: BuildingSymbol;
      rotation: number;
      config?: unknown;
    }): void;

    /**
     * Makes the unit bound to this processor data about a block at the given position
     */
    function getBlock<T extends BasicBuilding = AnyBuilding>(
      x: number,
      y: number
    ): [type: BlockSymbol | null, building: T | null];

    /**
     * Checks if the unit bound to this processor is within a radius of a given position.
     */
    function within(options: { x: number; y: number; radius: number }): boolean;
  }

  /**
   * Finds an unit near the unit bound to this processor
   * @param options.filters The filters for selecting a target. Use "any" for any target.
   * @param options.order The n th unit that fits these requirements based on the sorting method
   *  (1 => first unit, 2 => second unit and so on)
   * @param options.sort The method on which the results should be sorted
   *
   * Example:
   * ```js
   *  // returns the second nearest enemy unit
   *  const result = unitRadar({
   *    filters: ["enemy", "any", "any"],
   *    order: 2,
   *    sort: "distance",
   *  });
   * ```
   */
  function unitRadar<T extends BasicUnit = AnyUnit>(options: {
    /** The filters for selecting a target. Use "any" for any target. */
    filters: [TRadarFilter, TRadarFilter, TRadarFilter];
    /** The n th unit that fits these requirements based on the sorting method
     *  (1 => first unit, 2 => second unit and so on) */
    order: number;
    /** The method on which the results should be sorted */
    sort: TRadarSort;
  }): T;

  namespace unitLocate {
    /**
     * Uses the unit bound to this processor to find an ore vein anywhere on the map
     * @param ore The kind of item the ore should contain
     */
    function ore(
      ore: ItemSymbol
    ): [found: false] | [found: true, x: number, y: number];

    /**
     * Uses the unit bound to this processor to find a building anywhere on the map
     * @param options.group The group that the building belongs to
     * @param options.enemy Whether it should be an enemy building or an ally one
     */
    function building<T extends BasicBuilding = AnyBuilding>(options: {
      /** The group that the building belongs to */
      group: TUnitLocateBuildingGroup;
      /** Whether it should be an enemy building or an ally one */
      enemy: boolean;
    }): [found: false] | [found: true, x: number, y: number, building: T];

    /**
     * Uses the unit bound to this processor to find an enemy spawn anywhere on the map.
     *
     * May return a building (a core) or a position
     */
    function spawn<T extends BasicBuilding = AnyBuilding>():
      | [found: false]
      | [found: true, x: number, y: number, building: T];

    /**
     * Uses the unit bound to this processor to find a damaged ally buildings anywhere on the map
     */
    function damaged<T extends BasicBuilding = AnyBuilding>():
      | [found: false]
      | [found: true, x: number, y: number, building: T];
  }

  /**Jumps to the top of the instruction stack*/
  function endScript(): never;

  /** Halts the execution of this processor */
  function stopScript(): never;

  /** Gets block data from the map. Available ONLY for world processors. */
  namespace getBlock {
    /** Gets the floor type on the given location */
    function floor(x: number, y: number): EnvBlockSymbol;

    /** Gets the ore type on the given location. `Blocks.air` if there is no ore */
    function ore(x: number, y: number): OreSymbol | typeof Blocks.air;

    /** Gets the block type on the give location. `Blocks.air` if there is no block. */
    function block(x: number, y: number): BlockSymbol;

    /** Gets the building on the given location. `null` if there is no building. */
    function building<T extends BasicBuilding = AnyBuilding>(
      x: number,
      y: number
    ): T | null;
  }

  namespace setBlock {
    // TODO: maybe have a separate floor symbol type?
    /** Sets the floor of the tile at the given location. */
    function floor(x: number, y: number, to: EnvBlockSymbol): void;

    /** Sets the ore at the given location. Use `Blocks.air` to remove any ore. */
    function ore(x: number, y: number, to: OreSymbol | typeof Blocks.air): void;

    /** Sets the block at a given location, it can be a regular building or an environment block. */
    function block(
      x: number,
      y: number,
      to: EnvBlockSymbol | BuildingSymbol,
      team: TeamSymbol,
      rotation: number
    ): void;
  }

  /** Spawns an unit at the given location */
  function spawnUnit<T extends BasicUnit = AnyUnit>(
    type: UnitSymbol,
    x: number,
    y: number,
    team: TeamSymbol,
    rotation?: number
  ): T;

  /** Contains the variants for the `applyStatus` instruction. World processor ONLY. */
  namespace applyStatus {
    /**
     * Applies a status effect to the given unit.
     *
     * The only status effects that don't require a duration are `overdrive` and `boss`.
     */
    function apply(
      status: Exclude<TUnitEffect, "overdrive" | "boss">,
      unit: BasicUnit,
      duration: number
    ): void;

    function apply(status: "overdrive" | "boss", unit: BasicUnit): void;

    /**
     * Removes a status effect to the given unit.
     */
    function clear(status: TUnitEffect, unit: BasicUnit): void;
  }

  /**
   * Spawns an enemy wave, can be used even if there is an already active wave.
   */
  function spawnWave(natural: true): void;
  function spawnWave(natural: false, x: number, y: number): void;

  /** Contains the multiple variants of the `set rule` instruction */
  namespace setRule {
    /** Sets the wave countdown in seconds. */
    function currentWaveTime(seconds: number): void;

    /** Enables/disables the wave timer. */
    function waveTimer(enabled: boolean): void;

    /** Allows or prevents waves from spawning. */
    function waves(enabled: boolean): void;

    /** Sets the current wave number. */
    function wave(number: number): void;

    /** Sets the time between waves in seconds. */
    function waveSpacing(seconds: number): void;

    /** Sets wether waves can be manually summoned by pressing the play button. */
    function waveSending(enabled: boolean): void;

    /** Sets wether the gamemode is the attack mode */
    function attackMode(enabled: boolean): void;

    /** Sets the radius of the no-build zone around enemy cores. */
    function enemyCoreBuildRadius(radius: number): void;

    /** Sets the radius around enemy wave drop zones. */
    function dropZoneRadius(radius: number): void;

    /** Sets the base unit cap. */
    function unitCap(cap: number): void;

    /** Sets the playable map area. Blocks that are out of the new bounds will be removed.  */
    function mapArea(options: {
      x: number;
      y: number;
      width: number;
      height: number;
    }): void;

    /** Sets wether ambient lighting is enabled */
    function lighting(enabled: boolean): void;

    /**
     * Sets the ambient light color.
     *
     * `packColor` can be used to get the rgba data recevied by this function.
     *
     *
     * ```js
     * // enables lighting and sets the color to gray
     * setRule("lighting", true);
     * setRule("ambientLight", packColor(0.5, 0.5, 0.5, 1));
     * ```
     */
    function ambientLight(rgbaData: number): void;

    /** Sets the multiplier for the energy output of solar panels. */
    function solarMultiplier(multiplier: number): void;

    /**
     * Sets the build speed multiplier of a team.
     * The multiplier will always be clamped between `0.001` and `50`.
     */
    function buildSpeed(team: TeamSymbol, multiplier: number): void;

    /**
     * Sets the speed multiplier for unit factories.
     * The multiplier will always be clamped between `0` and `50`.
     */
    function unitBuildSpeed(team: TeamSymbol, multiplier: number): void;

    /** Sets the damage multiplier for units on a given team. */

    function unitDamage(team: TeamSymbol, multiplier: number): void;
    /** Sets the block health multiplier for a given team. */

    function blockHealth(team: TeamSymbol, multiplier: number): void;

    /** Sets the block damage multiplier for a given team. */
    function blockDamage(team: TeamSymbol, multiplier: number): void;

    /**
     * Sets the Real Time Strategy minimum weight for a team.
     *
     * In other words it, sets the minimum "advantage" needed for a squad to attack.
     * The higher the value, the more cautious the squad is.
     */

    function rtsMinWeight(team: TeamSymbol, value: number): void;

    /**
     * Sets the Real Time Strategy minimum size of attack squads of a team.
     *
     * The higher the value, the more units are required before a squad attacks.
     */
    function rtsMinSquad(team: TeamSymbol, value: number): void;
  }

  /**
   * Writes the contents of the print buffer in the selected mode
   * and clears the buffer afterwards.
   *
   * ```js
   * print("Hello");
   * flushMessage.announce(4); // lasts 4 seconds
   * wait(5);
   * print("World");
   * flushMessage.toast(4);
   * wait(5);
   * ```
   */
  namespace flushMessage {
    /** Shows a nofication at the top of the screen */
    function notify(): void;
    /** Puts the content on the top left corner of the screen */
    function mission(): void;
    /**
     * Puts the content on the middle of the screen
     *
     * @param duration The duration, in seconds
     */
    function announce(duration: number): void;
    /**
     * Puts the content on the middle top of the screen
     *
     * @param duration The duration, in seconds
     */
    function toast(duration: number): void;
  }

  /** Moves the player's camera to the given location. */
  function cutscene(mode: "pan", x: number, y: number, speed: number): void;
  /** Zooms the player camera to the desired level */
  function cutscene(mode: "zoom", level: number): void;
  /** Gives the camera control back to the player */
  function cutscene(mode: "stop"): void;

  /** Creates an explosion */
  function explosion(
    team: TeamSymbol,
    x: number,
    y: number,
    radius: number,
    damage: number,
    air: boolean,
    ground: boolean,
    pierce: boolean
  ): void;

  /** Sets the speed of this world processor in instructions per tick. */
  function setRate(ipt: number): void;

  /**
   * Gets an unit from the given team
   *
   * The index starts at 0.
   *
   * ```js
   *  const count = fetch("unitCount");
   *  for(let i = 0; i < count; i++) {
   *    const unit = fetch("unit", Teams.sharded, i);
   *    print`x: ${unit.x}, y: ${unit.y}\n`;
   *  }
   *  printFlush();
   * ```
   */
  function fetch<T extends BasicUnit = AnyUnit>(
    kind: "unit",
    team: TeamSymbol,
    index: number
  ): T;
  /**
   *  Gets the amount of units existing on a given team.
   *
   * ```js
   *  const count = fetch("unitCount");
   *  for(let i = 0; i < count; i++) {
   *    const unit = fetch("unit", Teams.sharded, i);
   *    print`x: ${unit.x}, y: ${unit.y}\n`;
   *  }
   *  printFlush();
   * ```
   */
  function fetch(kind: "unitCount", team: TeamSymbol): number;
  /**
   * Gets a player from a team.
   *
   * The index starts at 0.
   *
   * ```js
   *  const count = fetch("playerCount");
   *  for(let i = 0; i < count; i++) {
   *    const player = fetch("player", Teams.sharded, i);
   *    print`x: ${player.x}, y: ${player.y}\n`;
   *  }
   *  printFlush();
   * ```
   */
  function fetch<T extends BasicUnit = AnyUnit>(
    kind: "player",
    team: TeamSymbol,
    index: number
  ): T;
  /**
   * Gets the amount of players existing on a given team.
   *
   * ```js
   *  const count = fetch("playerCount");
   *  for(let i = 0; i < count; i++) {
   *    const player = fetch("player", Teams.sharded, i);
   *    print`x: ${player.x}, y: ${player.y}\n`;
   *  }
   *  printFlush();
   * ```
   */
  function fetch(kind: "playerCount", team: TeamSymbol): number;
  /**
   * Gets a core from a team.
   *
   * The index of the starts at 0.
   *
   * ```js
   *  const count = fetch("coreCount");
   *  for(let i = 0; i < count; i++) {
   *    const core = fetch("core", Teams.sharded, i);
   *    print`x: ${core.x}, y: ${core.y}\n`;
   *  }
   *  printFlush();
   * ```
   */
  function fetch(kind: "core", team: TeamSymbol, index: number): AnyBuilding;
  /**
   * Gets the amount of cores existing on a given team.
   * ```js
   *  const count = fetch("coreCount");
   *  for(let i = 0; i < count; i++) {
   *    const core = fetch("core", Teams.sharded, i);
   *    print`x: ${core.x}, y: ${core.y}\n`;
   *  }
   *  printFlush();
   * ```
   */
  function fetch(kind: "coreCount", team: TeamSymbol): number;
  /**
   * Gets a building from a team.
   *
   * The index starts at 0.
   *
   * ```js
   *  const count = fetch("buildCount");
   *  for(let i = 0; i < count; i++) {
   *    const router = fetch("build", Teams.sharded, i, Blocks.router);
   *    print`x: ${router.x}, y: ${router.y}\n`;
   *  }
   *  printFlush();
   * ```
   */
  function fetch<T extends BasicBuilding = AnyBuilding>(
    kind: "build",
    team: TeamSymbol,
    index: number,
    block: BuildingSymbol
  ): T;
  /**
   * Gets the amount of buildings existing on a given team.
   *
   * ```js
   *  const count = fetch("buildCount");
   *  for(let i = 0; i < count; i++) {
   *    const router = fetch("build", Teams.sharded, i, Blocks.router)
   *    print`x: ${router.x}, y: ${router.y}\n`
   *  }
   *  printFlush()
   * ```
   */
  function fetch(
    kind: "buildCount",
    team: TeamSymbol,
    block: BuildingSymbol
  ): number;

  /** Checks if a global flag is set */
  function getFlag(flag: string): boolean;

  /** Sets a global flag */
  function setFlag(flag: string, value: boolean): void;
}
