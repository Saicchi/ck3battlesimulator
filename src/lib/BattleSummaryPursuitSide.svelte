<script lang="ts">
    import { Army } from "./Battle";
    let {
        army,
        color,
        reverse,
    }: {
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
            <li style:text-align={text_alignment}>Initial</li>
            <li style:text-align={text_alignment}>Survived</li>
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
                    {unit.days[unit.days.length - 3].strength}
                </li>
                <li style:text-align={text_alignment}>
                    {unit.days[unit.days.length - 1].remaining}
                </li>
                <li style:text-align={text_alignment}>
                    {unit.days
                        .slice(unit.days.length - 3)
                        .reduce((acc, day) => acc + day.lost, 0)}
                </li>
                <li style:text-align={text_alignment}>
                    {unit.days
                        .slice(unit.days.length - 3)
                        .reduce((acc, day) => acc + day.killed, 0)}
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
