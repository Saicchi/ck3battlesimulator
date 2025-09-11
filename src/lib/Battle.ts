import type { Unit } from "./Defines";
import { DEFINES, PHASES } from "./Defines"

const MANEUVER_LENGTH = 2;
const EARLY_COMBAT_LENGTH = 12;
const AFTERMATH_LENGTH = 3;

class Day {
    public day = 0;

    // initial day values
    public strength = 0; // real amount of units in battle
    public remaining = 0; // remaining from previous day - died from previous day (rounded down deaths)

    // simulation values
    public attackPower = 0;
    public pursuitPower = 0;
    public screenPower = 0;
    public health = 0;

    // after simulation values
    public killed = 0; // total killed
    public lost = 0; // total casualties
    public routed = 0; // soft casualties
    public died = 0; // hard casualties

    // aftermath phase values
    public killedPursuit = 0; // personally killed units during pursuit
    public diedPursuit = 0; // died from pursuing units
    public killedLeftBehind = 0; // kills from units that were left behind
    public diedleftBehind = 0; // died from being left behind
}

class ArmyUnit {
    public army: Army | null = null;
    readonly unit: Unit;
    //stationing?: Holding,

    // Values per day of battle
    readonly days: Day[] = [];

    day(day: number) { return this.days[day]; }
    get yesterday() { return this.days[this.days.length - 2]; }
    get today() { return this.days[this.days.length - 1]; }
    get aftermath() { return this.days[this.army!.battle!.aftermath]; }
    get tomorrow() { this.days.push(new Day()); return this.today; }

    constructor(unit: Unit, strength: number) {
        this.unit = unit;
        const tomorrow = this.tomorrow;
        tomorrow.strength = strength;
        tomorrow.remaining = strength;
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

    screenPower(day: number) {
        let screen = this.unit.screen;  // 1 total defense per screen
        screen *= this.days[day].strength;
        return screen;
    }

    finalToughness(): number { return this.unit.toughness; }
}

export class Army {
    public battle: Battle | null = null;
    readonly commander: null;
    readonly units: ArmyUnit[] = [];

    // Values per day of battle
    readonly days: Day[] = [];


    day(day: number) { return this.days[day]; }
    get yesterday() { return this.days[this.days.length - 2]; }
    get today() { return this.days[this.days.length - 1]; }
    get aftermath() { return this.days[this.battle!.aftermath]; }
    get tomorrow() { this.days.push(new Day()); return this.today; }

    constructor(...units: [Unit, number][]) {
        this.commander = null;
        const tomorrow = this.tomorrow;
        for (const item of units) {
            const unit = new ArmyUnit(item[0], item[1]);
            unit.army = this;
            this.units.push(unit);
            tomorrow.strength += item[1];
            tomorrow.remaining += item[1];
        }
    }

    get isDead() { return (this.today.strength - this.today.lost) <= 0; }

    combatWidthMultiplier(day: number) {
        if (!this.battle) { return 1; }
        if (this.days[day].strength <= this.battle.combatWidth) { return 1; }
        return this.battle.combatWidth / this.days[day].strength;
    }
}

export class Battle {
    readonly left: Army;
    readonly right: Army;

    public days = 0; // days of battle
    public aftermath = 0; // starting day of aftermath
    readonly combatWidth; // 100 is the minimum combat width
    public leftWon: boolean = true; // 

    constructor(left: Army, right: Army) {
        this.left = left;
        this.right = right;
        this.left.battle = this;
        this.right.battle = this;
        this.combatWidth = Math.max(100, (this.left.today.strength + this.right.today.strength) / 2);
    }

    phase(day: number): string {
        // day starts at 0
        if (day < MANEUVER_LENGTH) { return PHASES.MANEUVER; } // 2 days
        if (day < MANEUVER_LENGTH + EARLY_COMBAT_LENGTH) { return PHASES.EARLY; } // 12 days
        if (this.aftermath && day >= this.aftermath) { return PHASES.AFTERMATH; }
        return PHASES.LATE;
    }


    // https://forum.paradoxplaza.com/forum/threads/combat-mechanics-explained.1434737/
    simulate() {
        console.clear();

        // first maneuver day is already filled
        const newManeuverDay = (army: Army) => {

            if (this.days == 0) { return; } // day 0 is already filled
            const armyTomorow = army.tomorrow;
            armyTomorow.day = this.days;
            for (const unit of army.units) {
                const unitToday = unit.today;
                const unitTomorow = unit.tomorrow;
                unitTomorow.day = this.days;

                unitTomorow.strength = unitToday.strength;
                armyTomorow.strength += unitTomorow.strength;

                unitTomorow.remaining = unitToday.remaining;
                armyTomorow.remaining += unitTomorow.remaining;
            }
        }

        // early and late combat phases
        const newMainDay = (army: Army) => {
            const armyTomorow = army.tomorrow;
            armyTomorow.day = this.days;
            for (const unit of army.units) {
                const unitToday = unit.today;
                const unitTomorow = unit.tomorrow;
                unitTomorow.day = this.days;

                unitTomorow.strength = Math.max(0, unitToday.strength - unitToday.lost);
                armyTomorow.strength += unitTomorow.strength;

                unitTomorow.remaining = unitToday.remaining - Math.floor(unitToday.died);
                armyTomorow.remaining += unitTomorow.remaining;

                unitTomorow.attackPower = unit.attackPower(unitTomorow.day);
                armyTomorow.attackPower += unitTomorow.attackPower;
            }
        }

        // aftermath phase
        const newPursuitDay = (army: Army) => {
            const armyLost = army.isDead;
            const armyToday = army.today;
            const armyTomorow = army.tomorrow;
            armyTomorow.day = this.days;

            for (const unit of army.units) {
                const unitToday = unit.today;
                const unitTomorow = unit.tomorrow;
                unitTomorow.day = this.days;

                unitTomorow.strength = Math.max(0, unitToday.strength - unitToday.lost);
                // set loser soft casualties to their strength
                if (armyLost && this.days == this.aftermath) { // aftermath setup
                    // loser routed units get attacked
                    unitTomorow.strength = unit.days.reduce((acc, day) => acc + day.routed, 0);
                }
                armyTomorow.strength += unitTomorow.strength;

                unitTomorow.remaining = unitToday.remaining - Math.floor(unitToday.died);
                armyTomorow.remaining += unitTomorow.remaining;

                unitTomorow.attackPower = unit.attackPower(unitTomorow.day);
                armyTomorow.attackPower += unitTomorow.attackPower;

                unitTomorow.pursuitPower = unit.pursuitPower(unitTomorow.day);
                armyTomorow.pursuitPower += unitTomorow.pursuitPower;

                unitTomorow.screenPower = unit.screenPower(unitTomorow.day);
                armyTomorow.screenPower += unitTomorow.screenPower;

                unitTomorow.health = unitTomorow.strength * unit.finalToughness();
                armyTomorow.health += unitTomorow.health;
            }
        }

        const combatMain = (attacker: Army, defender: Army) => { // Early and Late Battle Phase
            for (const unit of defender.units) {
                // receives ratio% of the damage
                const ratio = unit.today.strength ? unit.today.strength / defender.days[this.days].strength : 0;

                let lost = (ratio * attacker.today.attackPower) / unit.finalToughness();
                lost = Math.min(lost, unit.today.strength);
                unit.today.lost = lost;
                defender.today.lost += lost;

                const died = DEFINES.BASE_RATIO_CASUALTIES_CONVERSION * lost;
                unit.today.died = died;
                defender.today.died += died;
                attacker.today.killed += died;

                const routed = lost - died;
                unit.today.routed = routed;
                defender.today.routed += routed;
            }

            for (const unit of attacker.units) {
                // ratio% of damage gives ratio% of kills
                const ratio = unit.today.attackPower ? unit.today.attackPower / attacker.today.attackPower : 0;
                unit.today.killed = ratio * attacker.today.killed;
            }
        }

        const combatPursuit = (attacker: Army, defender: Army) => { // Aftermath Phase
            // silly paradox
            let actualPursuitDamage = attacker.today.pursuitPower;

            if (defender.today.strength) {
                // multiply pursuit damage by ratio of initial aftermath strength / today strength
                actualPursuitDamage *= defender.aftermath.strength / defender.today.strength;
            }

            // receive left behind damage based on initial aftermath health (not strength!)
            const leftBehindDamage = defender.aftermath.health * DEFINES.BASE_TOUGHNESS_TO_PURSUIT;
            actualPursuitDamage += leftBehindDamage;

            for (const unit of defender.units) {
                // yes, ratio uses health instead of strength (paradox???)
                const ratio = unit.aftermath.health ? unit.aftermath.health / defender.aftermath.health : 0;

                // total screen does not change from initial aftermath values
                const unitScreen = ratio * defender.aftermath.screenPower;

                // screen reduces damage up to this limit
                const minimalDamage = unit.aftermath.health * DEFINES.MINIMUM_PURSUIT_DAMAGE;

                // ratio% of total army receives ratio% of damage
                let unitPursuitDamage = ratio * actualPursuitDamage;

                unitPursuitDamage -= unitScreen;
                unitPursuitDamage = Math.max(unitPursuitDamage, minimalDamage);

                // damage is split over the length of the aftermath
                let died = unitPursuitDamage / (AFTERMATH_LENGTH * unit.finalToughness());
                died = Math.min(died, unit.today.strength);
                unit.today.lost = died;
                unit.today.died = died;
                defender.today.lost += died;
                defender.today.died += died;
                attacker.today.killed += died;

                // left behind damage this unit received
                const unitLeftBehindDamage = unit.aftermath.health * DEFINES.BASE_TOUGHNESS_TO_PURSUIT;

                // how much of the damage was from being left behind
                const leftBehindRatio = Math.min(1, unitLeftBehindDamage / unitPursuitDamage);
                const leftBehind = died * leftBehindRatio;
                unit.today.diedleftBehind = leftBehind;
                defender.today.diedleftBehind += leftBehind;
                attacker.today.killedLeftBehind += leftBehind;

                const diedFromPursuit = died - leftBehind;
                unit.today.diedPursuit = diedFromPursuit;
                defender.today.diedPursuit += diedFromPursuit;
                attacker.today.killedPursuit += diedFromPursuit;
            }

            for (const unit of attacker.units) {
                // ratio% of pursuit power gives ratio% of pursuit kills
                const ratioPursuit = unit.today.pursuitPower ? unit.today.pursuitPower / attacker.today.pursuitPower : 0;
                unit.today.killedPursuit = ratioPursuit * attacker.today.killedPursuit;

                // ratio% of attack power gives ratio% of left behind kills
                const ratioLeftBehind = unit.today.attackPower ? unit.today.attackPower / attacker.today.attackPower : 0;
                unit.today.killedLeftBehind = ratioLeftBehind * attacker.today.killedLeftBehind;

                unit.today.killed = unit.today.killedPursuit + unit.today.killedLeftBehind;
            }
        }

        while (this.days < DEFINES.MAX_DAYS_OF_COMBAT) {
            if (this.aftermath && this.days == this.aftermath + AFTERMATH_LENGTH) { break; }
            const phase = this.phase(this.days);

            if (phase == PHASES.MANEUVER) {
                newManeuverDay(this.left);
                newManeuverDay(this.right);
            }

            if (phase == PHASES.EARLY || phase == PHASES.LATE) {
                // an army was defeated
                if (this.left.isDead || this.right.isDead) {
                    this.leftWon = this.right.isDead;
                    if (phase == PHASES.EARLY) { // all loser soft casualties turn into hard casualties
                        // TODO: HANDLE THIS
                        console.log("early loss");
                        break;
                    } else if (phase == PHASES.LATE) { // goes into aftermath phase
                        this.aftermath = this.days;
                        continue; // back to the start
                    }
                } else {
                    newMainDay(this.left);
                    newMainDay(this.right);
                    combatMain(this.left, this.right);
                    combatMain(this.right, this.left);
                }
            }

            if (phase == PHASES.AFTERMATH) {
                newPursuitDay(this.left);
                newPursuitDay(this.right);
                combatPursuit(this.leftWon ? this.left : this.right, this.leftWon ? this.right : this.left);
            }

            this.days += 1;
        }

        console.log(this.left.days[0].strength - this.right.today.strength, this.left.today.remaining - Math.floor(this.left.today.died));
        console.log(this.right.days[0].strength - this.right.today.strength, this.right.today.remaining - Math.floor(this.right.today.died));
    }
}