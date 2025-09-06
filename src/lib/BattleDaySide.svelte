<script lang="ts">
    import { Army } from "./Battle";
    let {
        day,
        phase,
        army,
        color,
        reverse,
    }: {
        day: number;
        phase: string;
        army: Army;
        color: string;
        reverse: boolean;
    } = $props();
    let flex_direction = reverse ? "row-reverse" : "reverse";
    let text_alignment = reverse ? "right" : "left";
</script>

<ol style:background-color={color} style:flex-grow="1">
    <li>
        <ol style:flex-direction={flex_direction}>
            <li style:text-align={text_alignment}>Unit</li>
            <li style:text-align={text_alignment}>Fighting</li>
            <li style:text-align={text_alignment}>Routed</li>
            <li style:text-align={text_alignment}>Died</li>
            <li style:text-align={text_alignment}>Killed</li>
        </ol>
    </li>
    {#each army.units as unit}
        <li>
            <ol style:flex-direction={flex_direction}>
                <li style:text-align={text_alignment}>
                    {unit.unit.name}
                </li>
                <li style:text-align={text_alignment}>
                    {unit.days[day].strength}
                </li>
                <li style:text-align={text_alignment}>
                    {unit.days[day].routed}
                </li>
                <li style:text-align={text_alignment}>
                    {unit.days[day].died}
                </li>
                <li style:text-align={text_alignment}>
                    {unit.days[day].killed}
                </li>
            </ol>
        </li>
    {/each}
</ol>

<style>
    ol {
        width: 100%;
        padding: 0px;
        margin: 0px;
        border: 0px;
        list-style: none;
    }
    ol > li:first-child > ol > li {
        font-weight: bold;
    }
    ol > li > ol {
        display: flex;
        justify-content: space-between;
        text-align: center;
        > li {
            width: 15%;
        }
    }
</style>
