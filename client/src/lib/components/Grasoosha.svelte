<script lang="ts">
    import { WHITE_NORMAL, YELLOW_NORMAL, WHITE_JATSHIE, YELLOW_JATSHIE, NONE } from "../../../../consts";

    export let value: string;
    export let row: number;
    export let col: number;
    export let onDragStart: (row: number, col: number, e: DragEvent) => void = () => {};

    function handleDragStart(e: DragEvent) {
        if (value === NONE) return;
        onDragStart(row, col, e);
    }
</script>

<div class="grasoosha-container">
    {#if value !== NONE}
        <div
            class="grasoosha"
            class:white={value === WHITE_NORMAL || value === WHITE_JATSHIE}
            class:yellow={value === YELLOW_NORMAL || value === YELLOW_JATSHIE}
            class:jatshie={value === WHITE_JATSHIE || value === YELLOW_JATSHIE}
            draggable={true}
            on:dragstart={handleDragStart}
            role="button"
            tabindex="0"
        ></div>
    {/if}
</div>

<style>
    .grasoosha-container {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
    }

    .grasoosha {
        width: 35px;
        height: 35px;
        border-radius: 50%;
        border: 2px solid #19191e;
        box-sizing: border-box;
        cursor: grab;
    }

    .white {
        background-color: #f7f7f9;
    }

    .yellow {
        background-color: #ffce00;
    }

    .jatshie {
        border-radius: 0;
    }

    .jatshie {
        border-radius: 0;
    }
</style>