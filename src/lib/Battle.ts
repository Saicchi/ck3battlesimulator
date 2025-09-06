import type { Unit } from "./Defines";
import { DEFINES, PHASES } from "./Defines"

interface BattleDay {
    strength: number, // initial strength of the day

    damage: number, // damage the unit does in the day

    remaining: number, // actual amount of units the game sees (from rounded down deaths)
    killed: number, // killed in this day

    lost: number, // casualties in this day
    routed: number, //  soft casualties in this day
    died: number // hard casualties in this day

    // Aftermath stats
    pursuitDamage: number, // pursuit damage
    pursuitKilled: number, // killed with pursuit damage
    leftBehind: number // died during retreat
}

const _blankBattleDay = () => <BattleDay>{
    strength: 0,
    damage: 0,
    pursuitDamage: 0,
    remaining: 0,
    killed: 0,
    pursuitKilled: 0,
    lost: 0,
    routed: 0,
    died: 0,
    leftBehind: 0,
};

class ArmyUnit {
    public army: Army | null = null;
    readonly unit: Unit;
    //stationing?: Holding,

    // Values per day of battle
    readonly days: BattleDay[] = [];

    newDay() { this.days.push(_blankBattleDay()); }
    constructor(unit: Unit, strength: number) {
        this.unit = unit;
        this.newDay();
        this.days[0].strength = strength;
        this.days[0].remaining = strength;
    }

    attackPower(day: number) {
        let damage = this.unit.damage * DEFINES.DAMAGE_SCALING_FACTOR;
        damage *= this.days[day].strength;
        if (this.army) { damage *= this.army.combatWidthMultiplier(day); }
        return damage;
    }

    pursuitPower(day: number) {
        let damage = this.unit.pursuit * DEFINES.PURSUIT_STAT_TO_PURSUIT_DAMAGE;
        damage *= this.days[day].strength;
        if (this.army) { damage *= this.army.combatWidthMultiplier(day); }
        return damage;
    }

    finalToughness(): number { return this.unit.toughness; }

    screenPower(day: number) {
        let screen = this.unit.screen;  // 1 total defense per screen
        screen *= this.days[day].strength;
        return screen;
    }
}

export class Army {
    public battle: Battle | null = null;
    readonly commander: null;
    readonly units: ArmyUnit[] = [];

    // Total values per day of battle
    readonly days: BattleDay[] = [];

    newDay() { this.days.push(_blankBattleDay()); }
    constructor(...units: [Unit, number][]) {
        this.commander = null;
        this.newDay();
        for (const item of units) {
            const unit = new ArmyUnit(item[0], item[1]);
            unit.army = this;
            this.days[0].strength += item[1];
            this.days[0].remaining += item[1];
            this.units.push(unit);
        }
    }

    combatWidthMultiplier(day: number) {
        if (!this.battle) { return 1; }
        if (this.days[day].strength <= this.battle.combatWidth) { return 1; }
        return this.battle.combatWidth / this.days[day].strength;
    }
}

export class Battle {
    readonly left: Army;
    readonly right: Army;

    public days = -1; // days of battle
    public aftermath = 0; // starting day of aftermath
    readonly combatWidth; // 100 is the minimum combat width
    public leftWon: boolean = true; // 

    constructor(left: Army, right: Army) {
        this.left = left;
        this.right = right;
        this.left.battle = this;
        this.right.battle = this;
        this.combatWidth = Math.max(100, (this.left.days[0].strength + this.right.days[0].strength) / 2);
    }

    phase(day: number): string {
        // day starts at 0
        if (day < 2) { return PHASES.MANEUVER; } // 2 days
        if (day < 13) { return PHASES.EARLY; } // 12 days
        if (this.aftermath && day >= this.aftermath) { return PHASES.AFTERMATH; }
        return PHASES.LATE;
    }

    private combatManeuver() { // Maneuver Phase
        if (!this.days) { return; } // day 0 is already filled
        const pushDay = (army: Army) => {
            army.newDay();
            for (const unit of army.units) {
                unit.newDay();
                const strength = unit.days[this.days - 1].strength;
                unit.days[this.days].strength = strength;
                unit.days[this.days].remaining = strength;
                army.days[this.days].strength += strength;
                army.days[this.days].remaining += strength;
            }
        };
        pushDay(this.left);
        pushDay(this.right);
    }

    private combatBattle(attacker: Army, defender: Army) { // Early and Late Battle Phase

        const defenderHealth = defender.units.reduce((acc, unit) => acc + unit.days[this.days].strength * unit.finalToughness(), 0);

        for (const unit of defender.units) {
            const strength = unit.days[this.days].strength;
            if (!strength) {
                unit.days[this.days].remaining = unit.days[this.days - 1].remaining;
                continue;
            }

            const ratio = strength / defender.days[this.days].strength; // receives ratio% of the damage
            let lost = (ratio * attacker.days[this.days].damage) / unit.finalToughness();
            lost = Math.min(lost, strength);
            const died = DEFINES.BASE_RATIO_CASUALTIES_CONVERSION * lost;
            const routed = lost - died;

            attacker.days[this.days].killed += died;
            defender.days[this.days].died += died;

            unit.days[this.days].remaining = unit.days[this.days - 1].remaining - Math.floor(died);
            defender.days[this.days].remaining += unit.days[this.days].remaining;

            unit.days[this.days].lost = lost;
            defender.days[this.days].lost += unit.days[this.days].lost;

            unit.days[this.days].routed = routed;
            defender.days[this.days].routed += unit.days[this.days].routed;

            unit.days[this.days].died = died;
            defender.days[this.days].died += unit.days[this.days].died;
        }

        for (const unit of attacker.units) {
            const attackPower = unit.days[this.days].damage;
            if (!attackPower) { continue; }
            const ratio = attackPower / attacker.days[this.days].damage; // ratio% of damage gives ratio% of kills
            unit.days[this.days].killed = ratio * attacker.days[this.days].killed;
        }
    }

    private combatAftermath(attacker: Army, defender: Army) { // Aftermath Phase
        // this does not change per day
        const totalScreen = defender.units.reduce((acc, unit) => acc + unit.screenPower(this.aftermath), 0);

        let pursuitDamage = attacker.days[this.days].pursuitDamage;

        // multiply pursuit damage by ratio of initial strength / today strength
        if (defender.days[this.days].strength) {
            const lostStrengthRatio = defender.days[this.aftermath].strength / defender.days[this.days].strength;
            pursuitDamage *= lostStrengthRatio;
        }

        // receive left behind damage based on initial strength
        const defenderHealth = defender.units.reduce((acc, unit) => acc + unit.days[this.aftermath].strength * unit.finalToughness(), 0);
        const leftBehindDamage = defenderHealth * DEFINES.BASE_TOUGHNESS_TO_PURSUIT;
        pursuitDamage += leftBehindDamage;

        for (const unit of defender.units) {
            const strength = unit.days[this.days].strength;
            if (!strength) {
                unit.days[this.days].remaining = unit.days[this.days - 1].remaining;
                continue;
            }

            const unitHealth = unit.days[this.aftermath].strength * unit.finalToughness();
            const ratio = unitHealth / defenderHealth;

            //const ratio = strength / defender.days[this.days].strength; // receives ratio% of things
            const unitScreen = (ratio * totalScreen) / 3;
            let unitPursuitDamage = (ratio * pursuitDamage) / 3; // split over 3 days;

            // receive left behind damage based on initial strength

            const unitLeftBehindDamage = (unitHealth * DEFINES.BASE_TOUGHNESS_TO_PURSUIT) / 3;

            // screen reduces damage up to a limit
            const minimalDamage = (unitHealth * DEFINES.MINIMUM_PURSUIT_DAMAGE) / 3;
            unitPursuitDamage -= unitScreen;
            unitPursuitDamage = Math.max(unitPursuitDamage, minimalDamage);

            let lost = unitPursuitDamage / unit.finalToughness();
            lost = Math.min(lost, strength);

            // x% of damage gets x% of kills
            const leftBehindRatio = Math.min(1, unitLeftBehindDamage / unitPursuitDamage);
            const leftBehind = lost * leftBehindRatio;
            const diedFromPursuit = lost - leftBehind;

            attacker.days[this.days].killed += 0;

            unit.days[this.days].leftBehind += leftBehind;
            defender.days[this.days].leftBehind += leftBehind;

            unit.days[this.days].remaining = unit.days[this.days - 1].remaining - Math.floor(lost);
            defender.days[this.days].remaining += unit.days[this.days].remaining;

            unit.days[this.days].lost = lost;
            defender.days[this.days].lost += lost;

            unit.days[this.days].died = diedFromPursuit;
            defender.days[this.days].died += diedFromPursuit;
        }

        for (const unit of attacker.units) {
            // TODO: Separate kills from pursuit power from game kills (which uses attack)
            const attackPower = unit.days[this.days].damage;
            if (!attackPower) { continue; }
            const ratio = attackPower / attacker.days[this.days].damage; // ratio% of damage gives ratio% of kills
            unit.days[this.days].killed = ratio * attacker.days[this.days].killed;
        }
    }

    // https://forum.paradoxplaza.com/forum/threads/combat-mechanics-explained.1434737/
    simulate() {
        console.clear();
        while (this.days < DEFINES.MAX_DAYS_OF_COMBAT) {
            this.days += 1;
            if (this.aftermath && this.days == this.aftermath + 3) { break; } // aftermath always lasts 3 days

            let phase = this.phase(this.days);
            if (phase == PHASES.MANEUVER) { this.combatManeuver(); continue; }

            // an army was defeated
            const remainingLeft = Math.max(0, this.left.days[this.days - 1].strength - this.left.days[this.days - 1].lost);
            const remainingRight = Math.max(0, this.right.days[this.days - 1].strength - this.right.days[this.days - 1].lost);
            if (!this.aftermath && (!remainingLeft || !remainingRight)) {
                if (phase == PHASES.EARLY) { this.leftWon = remainingLeft > 0; break; } // early phase finish
                // TODO: HANDLE EARLY PHASE WIN KILLING THE ENTIRE ENEMY

                if (!this.aftermath) { // late phase finish
                    this.aftermath = this.days;
                    this.leftWon = remainingLeft > 0;
                    phase = PHASES.AFTERMATH;
                }
            }

            if (phase != PHASES.AFTERMATH) { // Early or Late combat phase
                const pushDay = (army: Army) => {
                    army.newDay();
                    for (const unit of army.units) {
                        unit.newDay();

                        const strength = Math.max(0, unit.days[this.days - 1].strength - unit.days[this.days - 1].lost);
                        unit.days[this.days].strength = strength;
                        army.days[this.days].strength += strength;

                        const attackPower = unit.attackPower(this.days);
                        unit.days[this.days].damage = attackPower;
                        army.days[this.days].damage += attackPower;
                    }
                };
                pushDay(this.left);
                pushDay(this.right);
                this.combatBattle(this.left, this.right);
                this.combatBattle(this.right, this.left);
            } else {
                const winner = this.leftWon ? this.left : this.right;
                const loser = this.leftWon ? this.right : this.left;
                const pushDay = (army: Army) => {
                    army.newDay();
                    for (const unit of army.units) {
                        unit.newDay();

                        let strength = Math.max(0, unit.days[this.days - 1].strength - unit.days[this.days - 1].lost);
                        if (this.days == this.aftermath && army === loser) { // aftermath setup
                            // loser routed units get attacked
                            strength = unit.days.reduce((acc, day) => acc + day.routed, 0);
                        }
                        unit.days[this.days].strength = strength;
                        army.days[this.days].strength += strength;

                        if (army === winner) { // only winner attacks
                            unit.days[this.days].remaining = unit.days[this.days - 1].remaining;
                            army.days[this.days].remaining += unit.days[this.days - 1].remaining;

                            const attackPower = unit.attackPower(this.days);
                            unit.days[this.days].damage = attackPower;
                            army.days[this.days].damage += attackPower;

                            const pursuitPower = unit.pursuitPower(this.days);
                            unit.days[this.days].pursuitDamage = pursuitPower;
                            army.days[this.days].pursuitDamage += pursuitPower;
                        }
                    }
                };
                pushDay(this.left);
                pushDay(this.right);
                this.combatAftermath(winner, loser);
            }
        }
        console.log('lost', this.right.units[0].days.slice(this.aftermath).reduce((acc, v) => acc + v.lost, 0));
        console.log('left', this.right.units[0].days.slice(this.aftermath).reduce((acc, v) => acc + v.leftBehind, 0));
        console.log('pursued', this.right.units[0].days.slice(this.aftermath).reduce((acc, v) => acc + v.died, 0));
        console.log("------")
        console.log('lost', this.right.units[1].days.slice(this.aftermath).reduce((acc, v) => acc + v.lost, 0));
        console.log('left', this.right.units[1].days.slice(this.aftermath).reduce((acc, v) => acc + v.leftBehind, 0));
        console.log('pursued', this.right.units[1].days.slice(this.aftermath).reduce((acc, v) => acc + v.died, 0));
    }
}