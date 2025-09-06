<script lang="ts">
    import BattleSummaryMainSide from "./BattleSummaryMainSide.svelte";
    import type { Battle } from "./Battle";

    const { battle }: { battle: Battle } = $props();
    const leftStrength = battle.left.days[0].strength;
    const rightStrength = battle.right.days[0].strength;

    const leftSideSlider = Math.round(
        (100 * leftStrength) / (leftStrength + rightStrength),
    );
    const rightSideSlider = 100 - leftSideSlider;
</script>

<div class="battleday">
    <div class="battledayInfo">
        <div style="width: 10%;">
            {battle.days - (battle.aftermath ? 5 : 2)} days of battle
        </div>
        <div style="width: 10%;">Main Combat Phase</div>
        <div
            style="flex-grow: {leftSideSlider}; background-color: lightsalmon"
        ></div>
        <div
            style="flex-grow: {rightSideSlider}; background-color: lightblue"
        ></div>
    </div>
    <div class="battledayContent">
        <BattleSummaryMainSide
            army={battle.left}
            color="pink"
            reverse={false}
        />
        <BattleSummaryMainSide
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
