<script lang="ts">
    import type { Army, Battle } from "../Battle";
    import DayContent from "./DayContent.svelte";

    const { day, battle }: { day: number; battle: Battle } = $props();
    const phase = battle.phase(day);

    const leftSideSlider = Math.round(
        (100 * battle.left.day(day).strength) /
            (battle.right.day(day).strength + battle.right.day(day).strength),
    );
    const rightSideSlider = 100 - leftSideSlider;
</script>

<div class="day">
    <div class="info">
        <div style="width: 10%;">Day {day}</div>
        <div style="width: 10%;">{phase} Phase</div>
        <div
            style="flex-grow: {leftSideSlider};
            background-color:  pink"
        ></div>
        <div
            style="flex-grow: {rightSideSlider};
            background-color: lightseagreen"
        ></div>
    </div>
    <div class="content">
        <DayContent {day} army={battle.left} />
        <DayContent {day} army={battle.right} />
    </div>
</div>

<style>
    .day {
        margin-top: 50px;
        background-color: red;
        display: flex;
        flex-flow: column;
    }

    .info {
        border-bottom: 3px solid black;
        background-color: aliceblue;
        display: flex;
    }

    .content {
        display: flex;
        flex-flow: row;
    }
</style>
