<script lang="ts">
    import BattleDaySide from "./BattleDaySide.svelte";
    import type { Battle } from "./Battle";

    const { day, battle }: { day: number; battle: Battle } = $props();
    const phase = battle.phase(day);
    const leftStrength = battle.left.days[day].strength;
    const rightStrength = battle.right.days[day].strength;

    const leftSideSlider = Math.round(
        (100 * leftStrength) / (leftStrength + rightStrength),
    );
    const rightSideSlider = 100 - leftSideSlider;
</script>

<div class="battleday">
    <div class="battledayInfo">
        <div style="width: 10%;">Day {day}</div>
        <div style="width: 10%;">{phase} Phase</div>
        <div
            style="flex-grow: {leftSideSlider}; background-color: lightsalmon"
        ></div>
        <div
            style="flex-grow: {rightSideSlider}; background-color: lightblue"
        ></div>
    </div>
    <div class="battledayContent">
        <BattleDaySide
            {day}
            {phase}
            army={battle.left}
            color="pink"
            reverse={false}
        />
        <BattleDaySide
            {day}
            {phase}
            army={battle.right}
            color="lightseagreen"
            reverse={true}
        />
    </div>
</div>

<style>
    .battleday {
        display: flex;
        flex-flow: column;
        margin-top: 50px;
        background-color: red;
    }

    .battledayInfo {
        display: flex;
        background-color: aliceblue;
    }

    .battledayContent {
        width: 100%;
        padding: 0px;
        margin: 0px;
        list-style: none;
        display: flex;
        justify-content: center;
    }
</style>
