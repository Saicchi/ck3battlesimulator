export const DEFINES = {
    MAX_DAYS_OF_COMBAT: 300,
    DAMAGE_SCALING_FACTOR: 0.03, // every damage is worth this much as attack power
    BASE_RATIO_CASUALTIES_CONVERSION: 0.3,
    PURSUIT_STAT_TO_PURSUIT_DAMAGE: 0.5, // every pursuit is worth this much as attack power
    BASE_TOUGHNESS_TO_PURSUIT: 0.05, // this % of strength turns into damage during pursuit
    MINIMUM_PURSUIT_DAMAGE: 0.01, // this % of strength is the minimum damage during pursuit
}

export const PHASES = {
    MANEUVER: "Maneuver",
    EARLY: "Early",
    LATE: "Late",
    AFTERMATH: "Aftermath"
}

export const UNITTYPES = {
    KNIGHT: "Knight",
    LEVY: "Levy",
    SKIRMISHER: "Skirmisher",
    HEAVY_INFANTRY: "Heavy Infantry",
    ARCHERS: "Archers",
    SPEARMEN: "Spearmen",
    LIGHT_CAVALRY: "Light Cavalry",
    HEAVY_CAVALRY: "Heavy Cavalry",
    ARCHER_CAVALRY: "Archer Cavalry",
    CAMEL_CAVALRY: "Camel Cavalry",
    ELEPHANT_CAVALRY: "Elephant Cavalry",
}

export interface Unit {
    type: string;
    name: string;
    damage: number;
    toughness: number,
    pursuit: number,
    screen: number,
}

export const UNITS: Record<string, Unit> = {
    KNIGHT: {
        type: UNITTYPES.KNIGHT,
        name: "Knight",
        damage: 50,
        toughness: 10,
        pursuit: 0,
        screen: 0,
    },
    LEVY: {
        type: UNITTYPES.LEVY,
        name: "Levies",
        damage: 10,
        toughness: 10,
        pursuit: 0,
        screen: 0
    },
    BOWMEN: {
        type: UNITTYPES.ARCHERS,
        name: "Bowmen",
        damage: 25,
        toughness: 10,
        pursuit: 13,
        screen: 0
    },
    ARMORED_FOOTMEN: {
        type: UNITTYPES.HEAVY_INFANTRY,
        name: "Armored Footmen",
        damage: 32,
        toughness: 22,
        pursuit: 0,
        screen: 0
    },
    LIGHT_FOOTMEN: {
        type: UNITTYPES.SKIRMISHER,
        name: "Light Footmen",
        damage: 10,
        toughness: 16,
        pursuit: 10,
        screen: 16
    },
    PIKEMEN_UNIT: {
        type: UNITTYPES.SPEARMEN,
        name: "Pikemen Unit",
        damage: 22,
        toughness: 24,
        pursuit: 0,
        screen: 0
    },
    LIGHT_HORSEMEN: {
        type: UNITTYPES.LIGHT_CAVALRY,
        name: "Light Horsemen",
        damage: 22,
        toughness: 15,
        pursuit: 30,
        screen: 30
    }
}