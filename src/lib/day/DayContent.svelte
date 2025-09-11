<script lang="ts">
    import { PHASES } from "$lib/Defines";
    import type { Army } from "../Battle";

    const { day, army }: { day: number; army: Army } = $props();

    const phase = army.battle!.phase(day);
    const isLeft = army == army.battle!.left;
    const color = isLeft ? "pink" : "lightseagreen";
    const flexDirection = isLeft ? "row" : "row-reverse";
    const textAlignment = isLeft ? "right" : "left";
</script>

<ol class="content-units" style:background-color={color} style:flex-grow="1">
    {#if phase == PHASES.MANEUVER}
        <li class="content-header">
            <ol style:flex-direction={flexDirection}>
                <li style:text-align={textAlignment}>Unit</li>
                <li style:text-align={textAlignment}>Fighting</li>
            </ol>
        </li>
        {#each army.units as unit}
            <li class="content-unit">
                <ol style:flex-direction={flexDirection}>
                    <li style:text-align={textAlignment}>
                        {unit.unit.name}
                    </li>
                    <li style:text-align={textAlignment}>
                        {unit.days[day].strength.toFixed(2)}
                    </li>
                </ol>
            </li>
        {/each}
        <li class="content-header">
            <ol style:flex-direction={flexDirection}>
                <li style:text-align={textAlignment}>Total</li>
                <li style:text-align={textAlignment}>
                    {army.days[day].strength.toFixed(2)}
                </li>
            </ol>
        </li>
    {:else if phase == PHASES.EARLY || phase == PHASES.LATE}
        <li class="content-header">
            <ol style:flex-direction={flexDirection}>
                <li style:text-align={textAlignment}>Unit</li>
                <li style:text-align={textAlignment}>Fighting</li>
                <li style:text-align={textAlignment}>Routed</li>
                <li style:text-align={textAlignment}>Died</li>
                <li style:text-align={textAlignment}>Killed</li>
            </ol>
        </li>
        {#each army.units as unit}
            <li class="content-unit">
                <ol style:flex-direction={flexDirection}>
                    <li style:text-align={textAlignment}>
                        {unit.unit.name}
                    </li>
                    <li style:text-align={textAlignment}>
                        {unit.days[day].strength.toFixed(2)}
                    </li>

                    <li style:text-align={textAlignment}>
                        {unit.days[day].routed.toFixed(2)}
                    </li>
                    <li style:text-align={textAlignment}>
                        {unit.days[day].died.toFixed(2)}
                    </li>
                    <li style:text-align={textAlignment}>
                        {unit.days[day].killed.toFixed(2)}
                    </li>
                </ol>
            </li>
        {/each}
        <li class="content-header">
            <ol style:flex-direction={flexDirection}>
                <li style:text-align={textAlignment}>Total</li>
                <li style:text-align={textAlignment}>
                    {army.days[day].strength.toFixed(2)}
                </li>

                <li style:text-align={textAlignment}>
                    {army.days[day].routed.toFixed(2)}
                </li>
                <li style:text-align={textAlignment}>
                    {army.days[day].died.toFixed(2)}
                </li>
                <li style:text-align={textAlignment}>
                    {army.days[day].killed.toFixed(2)}
                </li>
            </ol>
        </li>
    {:else if phase == PHASES.AFTERMATH}
        {#if isLeft && army.battle!.leftWon}
            <li class="content-header">
                <ol style:flex-direction={flexDirection}>
                    <li style:text-align={textAlignment}>Unit</li>
                    <li style:text-align={textAlignment}>Attacking</li>
                    <li style:text-align={textAlignment}>Pursuit Kills</li>
                    <li style:text-align={textAlignment}>Left Behind Kills</li>
                    <li style:text-align={textAlignment}>Total Kills</li>
                </ol>
            </li>
            {#each army.units as unit}
                <li class="content-unit">
                    <ol style:flex-direction={flexDirection}>
                        <li style:text-align={textAlignment}>
                            {unit.unit.name}
                        </li>
                        <li style:text-align={textAlignment}>
                            {unit.days[day].strength.toFixed(2)}
                        </li>
                        <li style:text-align={textAlignment}>
                            {unit.days[day].killedPursuit.toFixed(2)}
                        </li>
                        <li style:text-align={textAlignment}>
                            {unit.days[day].killedLeftBehind.toFixed(2)}
                        </li>
                        <li style:text-align={textAlignment}>
                            {unit.days[day].killed.toFixed(2)}
                        </li>
                    </ol>
                </li>
            {/each}
            <li class="content-header">
                <ol style:flex-direction={flexDirection}>
                    <li style:text-align={textAlignment}>Total</li>
                    <li style:text-align={textAlignment}>
                        {army.days[day].strength.toFixed(2)}
                    </li>
                    <li style:text-align={textAlignment}>
                        {army.days[day].killedPursuit.toFixed(2)}
                    </li>
                    <li style:text-align={textAlignment}>
                        {army.days[day].killedLeftBehind.toFixed(2)}
                    </li>
                    <li style:text-align={textAlignment}>
                        {army.days[day].killed.toFixed(2)}
                    </li>
                </ol>
            </li>
        {:else}
            <li class="content-header">
                <ol style:flex-direction={flexDirection}>
                    <li style:text-align={textAlignment}>Unit</li>
                    <li style:text-align={textAlignment}>Fleeing</li>
                    <li style:text-align={textAlignment}>Pursuit Deaths</li>
                    <li style:text-align={textAlignment}>Left Behind</li>
                    <li style:text-align={textAlignment}>Total Deaths</li>
                </ol>
            </li>
            {#each army.units as unit}
                <li class="content-unit">
                    <ol style:flex-direction={flexDirection}>
                        <li style:text-align={textAlignment}>
                            {unit.unit.name}
                        </li>
                        <li style:text-align={textAlignment}>
                            {unit.days[day].strength.toFixed(2)}
                        </li>
                        <li style:text-align={textAlignment}>
                            {unit.days[day].diedPursuit.toFixed(2)}
                        </li>
                        <li style:text-align={textAlignment}>
                            {unit.days[day].diedleftBehind.toFixed(2)}
                        </li>
                        <li style:text-align={textAlignment}>
                            {unit.days[day].lost.toFixed(2)}
                        </li>
                    </ol>
                </li>
            {/each}
            <li class="content-header">
                <ol style:flex-direction={flexDirection}>
                    <li style:text-align={textAlignment}>Total</li>
                    <li style:text-align={textAlignment}>
                        {army.days[day].strength.toFixed(2)}
                    </li>
                    <li style:text-align={textAlignment}>
                        {army.days[day].diedPursuit.toFixed(2)}
                    </li>
                    <li style:text-align={textAlignment}>
                        {army.days[day].diedleftBehind.toFixed(2)}
                    </li>
                    <li style:text-align={textAlignment}>
                        {army.days[day].lost.toFixed(2)}
                    </li>
                </ol>
            </li>
        {/if}
    {/if}
</ol>

<style>
    .content-units {
        padding: 0px;
        margin: 0px;
        border: 0px;
        list-style: none;

        > li > ol {
            display: flex;
            text-align: center;
            list-style: none;

            > li {
                width: 20%;
            }
        }
    }

    .content-header > ol {
        font-weight: bold;
    }

    .content-unit > ol {
        > li {
            width: 15%;
        }
    }
</style>
