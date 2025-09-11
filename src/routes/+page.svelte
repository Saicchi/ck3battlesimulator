<script lang="ts">
    import { UNITS } from "../lib/Defines";
    import { Army, Battle } from "../lib/Battle";
    import Day from "$lib/day/Day.svelte";

    // let left = new Army([UNITS.BOWMEN, 200]);
    // //let right = new Army([UNITS.LEVY, 1000], [UNITS.ARMORED_FOOTMEN, 100]);
    // let right = new Army([UNITS.ARMORED_FOOTMEN, 200], [UNITS.LEVY, 1000]);

    let left = new Army(
        [UNITS.LIGHT_HORSEMEN, 2300],
        [UNITS.ARMORED_FOOTMEN, 1100],
        [UNITS.PIKEMEN_UNIT, 1400],
        [UNITS.BOWMEN, 600],
    );

    let right = new Army(
        [UNITS.BOWMEN, 2200],
        [UNITS.LIGHT_HORSEMEN, 1300],
        [UNITS.ARMORED_FOOTMEN, 600],
        [UNITS.PIKEMEN_UNIT, 500],
    );

    let battle = new Battle(left, right);
    battle.simulate();

    const days = Array.from({ length: battle.days }, (_, index) => index);
</script>

<!-- <SummaryTotal {battle} />
<SummaryMain {battle} />
<SummaryPursuit {battle} /> -->
{#each days as day}
    <Day {day} {battle} />
{/each}

<style>
</style>
