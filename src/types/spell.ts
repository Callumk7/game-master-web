/**
 * The root object of the spell data file.
 */
export interface SpellFile {
  spell: Spell[];
}

/**
 * Describes a single spell's properties.
 */
export interface Spell {
  name: string;
  source: string;
  page: number;
  level: number;
  school: School;
  time: CastingTime[];
  range: Range;
  components: Components;
  duration: Duration[];
  entries: Entry[];
  srd?: boolean | string;
  basicRules?: boolean;
  reprintedAs?: string[];
  otherSources?: Source[];
  alias?: string[];
  meta?: Meta;
  entriesHigherLevel?: TitledEntry[];
  scalingLevelDice?: ScalingLevelDice;
  damageInflict?: DamageType[];
  savingThrow?: AbilityScore[];
  spellAttack?: AttackType[];
  abilityCheck?: AbilityScore[];
  miscTags?: string[];
  areaTags?: AreaTag[];
  conditionInflict?: string[];
  affectsCreatureType?: string[];
  damageResist?: DamageType[];
  damageImmune?: DamageType[];
  damageVulnerable?: DamageType[];
  conditionImmune?: string[];
  hasFluffImages?: boolean;
}

/**
 * Represents a reference to the spell in another sourcebook.
 */
export interface ReprintedAs {
  [key: string]: string; // e.g., "Acid Splash|XPHB"
}

/**
 * Represents a reference to the spell in another source.
 */
export interface Source {
  source: string;
  page: number;
}

/**
 * Represents the casting time of a spell.
 */
export interface CastingTime {
  number: number;
  unit: 'action' | 'bonus' | 'reaction' | 'minute' | 'hour';
  condition?: string;
}

/**
 * Describes the range of a spell.
 */
export interface Range {
  type: 'point' | 'radius' | 'sphere' | 'cone' | 'line' | 'cube' | 'hemisphere' | 'special';
  distance: Distance;
}

/**
 * Describes the distance for a spell's range.
 */
export interface Distance {
  type: 'self' | 'touch' | 'feet' | 'miles' | 'unlimited' | 'sight';
  amount?: number;
}

/**
 * Describes the components required to cast a spell.
 */
export interface Components {
  v?: boolean;
  s?: boolean;
  m?: string | MaterialComponent;
}

/**
 * Describes a material component for a spell, including optional cost.
 */
export interface MaterialComponent {
  text: string;
  cost?: number;
  consume?: boolean | 'optional';
}

/**
 * Describes the duration of a spell's effect.
 */
export interface Duration {
  type: 'instant' | 'timed' | 'permanent' | 'special';
  duration?: TimedDuration;
  concentration?: boolean;
  ends?: ('dispel' | 'trigger')[];
}

/**
 * Specifies the length of a timed duration.
 */
export interface TimedDuration {
  type: 'round' | 'minute' | 'hour' | 'day';
  amount: number;
  upTo?: boolean;
}

// A union type for all possible kinds of descriptive entries in a spell.
export type Entry = string | TitledEntry | ListEntry | TableEntry;

/**
 * An entry with a title and a list of sub-entries. Used for spell effects and "At Higher Levels" sections.
 */
export interface TitledEntry {
  type: 'entries';
  name: string;
  entries: Entry[];
}

/**
 * An entry representing a bulleted or numbered list.
 */
export interface ListEntry {
  type: 'list';
  items: string[];
}

/**
 * An entry representing a formatted table.
 */
export interface TableEntry {
  type: 'table';
  caption: string;
  colLabels: string[];
  colStyles: string[];
  rows: (string | TableCell)[][];
}

/**
 * A special cell within a table, often used for dice rolls.
 */
export interface TableCell {
  type: 'cell';
  roll: {
      exact?: number;
      min?: number;
      max?: number;
      pad?: boolean;
  };
}

/**
 * Describes how a cantrip's damage scales with character level.
 */
export interface ScalingLevelDice {
  label: string;
  scaling: {
    [level: string]: string; // e.g., "1": "1d6", "5": "2d6"
  };
}

/**
 * Contains metadata about a spell, such as whether it can be cast as a ritual.
 */
export interface Meta {
  ritual?: boolean;
}

// Literal Types for more specific type checking

export type School = 'A' | 'C' | 'D' | 'E' | 'I' | 'N' | 'T' | 'V';
export type AreaTag = 'ST' | 'MT' | 'S' | 'C' | 'Q' | 'L' | 'W' | 'R' | 'Y' | 'N' | 'H';
export type DamageType = 'acid' | 'bludgeoning' | 'cold' | 'fire' | 'force' | 'lightning' | 'necrotic' | 'piercing' | 'poison' | 'psychic' | 'radiant' | 'slashing' | 'thunder';
export type AbilityScore = 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma';
export type AttackType = 'M' | 'R';