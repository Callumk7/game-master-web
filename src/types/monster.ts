//
// Basic & Enumerated Types
//

/** Represents the size categories for monsters. */
export type Size = "T" | "S" | "M" | "L" | "H" | "G";

/** Represents alignment abbreviations. */
export type Alignment = "L" | "N" | "C" | "G" | "E" | "NX" | "NY" | "A" | "U";

//
// Main Monster Interface
//

/**
 * The root interface for the entire JSON structure, containing an array of monsters.
 */
export interface MonsterData {
  monster: Monster[];
}

/**
 * Represents a single monster's complete stat block and descriptive information.
 */
export interface Monster {
  name: string;
  source: string;
  page: number;
  srd?: boolean;
  basicRules?: boolean;
  otherSources?: OtherSource[];
  reprintedAs?: string[];
  size: Size[];
  type: string | TypeObject;
  alignment: Alignment[];
  ac: (number | ACObject)[];
  hp: HP;
  speed: Speed;
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
  save?: Record<string, string>;
  skill?: Record<string, string>;
  senses?: string[];
  passive: number;
  resist?: (string | DamageCondition)[];
  immune?: (string | DamageCondition)[];
  vulnerable?: (string | DamageCondition)[];
  conditionImmune?: string[];
  languages?: string[];
  cr: string | CRObject;
  spellcasting?: Spellcasting[];
  trait?: Trait[];
  action?: Action[];
  reaction?: Action[];
  legendaryHeader?: string[];
  legendary?: LegendaryAction[];
  legendaryGroup?: LegendaryGroup;
  variant?: Variant[];
  environment?: string[];
  soundClip?: SoundClip;
  attachedItems?: string[];
  languageTags?: string[];
  damageTags?: string[];
  damageTagsSpell?: string[];
  spellcastingTags?: string[];
  miscTags?: string[];
  conditionInflict?: string[];
  conditionInflictLegendary?: string[];
  savingThrowForced?: string[];
  savingThrowForcedSpell?: string[];
  savingThrowForcedLegendary?: string[];
  hasToken: boolean;
  hasFluff?: boolean;
  hasFluffImages?: boolean;
  group?: string[];
  traitTags?: string[];
  senseTags?: string[];
  actionTags?: string[];
  damageTagsLegendary?: string[];
  dragonCastingColor?: string;
  dragonAge?: string;
  familiar?: boolean;
  altArt?: AltArt[];
  // biome-ignore lint/suspicious/noExplicitAny: The structure of _versions is highly dynamic and best handled as 'any'
  _versions?: any[];
}

//
// Sub-Interfaces for Nested Objects
//

/** Represents an alternative source for the monster. */
export interface OtherSource {
  source: string;
}

/** Defines a monster's type and associated tags. */
export interface TypeObject {
  type: string;
  tags: string[];
}

/** Defines an Armor Class value, possibly with its source or conditions. */
export interface ACObject {
  ac: number;
  from?: string[];
  condition?: string;
  braces?: boolean;
}

/** Defines the Hit Points of a monster. */
export interface HP {
  average: number;
  formula: string;
}

/** Defines a specific type of speed with potential conditions. */
export interface SpeedDetail {
  number: number;
  condition: string;
}

/** Defines the various movement speeds of a monster. */
export interface Speed {
  walk?: number;
  burrow?: number;
  climb?: number;
  fly?: number | SpeedDetail;
  swim?: number;
  canHover?: boolean;
}

/** Defines a Challenge Rating that may differ in a creature's lair. */
export interface CRObject {
  cr: string;
  lair: string;
}

/** A generic entry for traits, actions, etc., which can be a string or a structured list. */
type Entry = string | List | EntryItem | EntriesItem;

/** Base interface for traits, actions, and legendary actions. */
export interface Trait {
  name: string;
  entries: Entry[];
}

/** Alias for Trait, used for actions. */
export type Action = Trait;

/** Alias for Trait, used for legendary actions. */
export type LegendaryAction = Trait;

/** Represents a list item within an entry. */
export interface EntryItem {
  type: "item";
  name: string;
  entry: string;
  entries?: string[];
}

/** Represents a collection of entries under a name. */
export interface EntriesItem {
  type: "entries";
  name: string;
  entries: Entry[];
}

/** Represents a formatted list within an entry. */
export interface List {
  type: "list";
  style?: string;
  items: EntryItem[];
}

/** Represents a monster's spellcasting abilities. */
export interface Spellcasting {
  name: string;
  type: string;
  headerEntries: string[];
  will?: string[];
  daily?: Record<string, string[]>;
  spells?: Record<string, SpellLevel>;
  footerEntries?: string[];
  ability: string;
  hidden?: string[];
}

/** Represents spells available at a specific level and the number of slots. */
export interface SpellLevel {
  slots?: number;
  spells: string[];
}

/** Represents conditional resistances, vulnerabilities, or immunities. */
export interface DamageCondition {
  resist?: string[];
  immune?: string[];
  vulnerable?: string[];
  note: string;
  cond: boolean;
  preNote?: string;
}

/** Information about a monster's legendary action group. */
export interface LegendaryGroup {
  name: string;
  source: string;
}

/** Represents a variant or optional rule for a monster. */
export interface Variant {
  type: string;
  name: string;
  entries: Entry[];
  source?: string;
  page?: number;
}

/** Represents a link to a sound clip for the monster. */
export interface SoundClip {
  type: string;
  path: string;
}

/** Represents alternate art for a monster. */
export interface AltArt {
  name: string;
  source: string;
  page?: number;
}