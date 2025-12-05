<script lang="ts">
    import { onMount } from 'svelte';
    import Grasoosha from "./Grasoosha.svelte";
    import { NONE, WHITE_JATSHIE, WHITE_NORMAL, YELLOW_NORMAL, YELLOW_JATSHIE } from "../../../../consts";
    import nema1 from "$lib/assets/wav/nema1.wav";
    import nema2 from "$lib/assets/wav/nema2.wav";
    import nema3 from "$lib/assets/wav/nema3.wav";
    import nema4 from "$lib/assets/wav/nema4.wav";
    import nema5 from "$lib/assets/wav/nema5.wav";

    export let socket: WebSocket;

    let sounds: HTMLAudioElement[] = [];

    let content = [
        [NONE, NONE, NONE, NONE, NONE, NONE, NONE],
        [NONE, NONE, NONE, NONE, NONE, NONE, NONE],
        [NONE, NONE, NONE, NONE, NONE, NONE, NONE],
        [NONE, NONE, NONE, NONE, NONE, NONE, NONE],
        [NONE, NONE, NONE, NONE, NONE, NONE, NONE],
        [NONE, NONE, NONE, NONE, NONE, NONE, NONE],
        [NONE, NONE, NONE, NONE, NONE, NONE, NONE],
    ];

    function moveGrasoosha(fromRow: number, fromCol: number, toRow: number, toCol: number) {
        if (content[fromRow][fromCol] !== NONE) {
            content[toRow][toCol] = content[fromRow][fromCol];
            content[fromRow][fromCol] = NONE;
            content = content;
        }

        for (let i = 1; i < 7; i++) {
            for (let j = 0; j < 7; j++) {
                if (content[i][j] === NONE) continue;

                const color = (content[i][j] === WHITE_NORMAL || content[i][j] === WHITE_JATSHIE) ? 'W' : 'Y';

                let diagonalNeighbors = 0;
                const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
                for (const [dx, dy] of directions) {
                    const ni = i + dx;;
                    const nj = j + dy;
                    if (ni < 0 || ni >= 7 || nj < 0 || nj >= 7) continue;
                    if (content[ni][nj] === NONE) continue;
                    const neighborColor = (content[ni][nj] === WHITE_NORMAL || content[ni][nj] === WHITE_JATSHIE) ? 'W' : 'Y';
                    if (neighborColor !== color) continue;
                    diagonalNeighbors++;
                }

                if (diagonalNeighbors >= 3) {
                    content[i][j] = color === 'W' ? WHITE_JATSHIE : YELLOW_JATSHIE;
                } else {
                    content[i][j] = color === 'W' ? WHITE_NORMAL : YELLOW_NORMAL;
                }
            }
        }
    }

    let draggedFrom: { row: number; col: number } | null = null;
    let dragPosition = { x: 0, y: 0 };
    let isDragging = false;
    let draggedValue = '';
    let boardElement: HTMLElement;
    let movingPieceElement: HTMLElement | null = null;

    function handleDragStart(row: number, col: number, e: DragEvent) {
        const target = e.target as HTMLElement;
        target.style.opacity = '0.25';
        movingPieceElement = target;

        draggedFrom = { row, col };
        draggedValue = content[row][col];
        isDragging = true;

        if (!e.dataTransfer) return;

        const emptyImage = new Image();
        e.dataTransfer.setDragImage(emptyImage, 0, 0);
        e.dataTransfer.effectAllowed = "move";
    }

    function handleWindowMouseMove(e: MouseEvent) {
        if (!isDragging) return;

        dragPosition = { x: e.clientX, y: e.clientY };
    }

    function resetDragState() {
        draggedFrom = null;
        dragPosition = { x: 0, y: 0 };
        isDragging = false;
        draggedValue = '';
    }

    function handleWindowMouseUp(e: MouseEvent) {
        if (!isDragging) return resetDragState();
        if (!draggedFrom) return resetDragState();
        if (!boardElement) return resetDragState();

        const boardRect = boardElement.getBoundingClientRect();
        const cellSize = 50;

        const x = e.clientX - boardRect.left;
        const y = e.clientY - boardRect.top;

        const toCol = Math.floor(x / cellSize);
        const toRow = Math.floor(y / cellSize);

        if (!(toRow >= 0 && toRow < 7 && toCol >= 0 && toCol < 7)) return resetDragState();

        const fromRow = draggedFrom.row;
        const fromCol = draggedFrom.col;

        if ((fromRow !== toRow || fromCol !== toCol) && content[fromRow][fromCol] !== NONE) {
            socket.send(`move\t${fromRow}\t${fromCol}\t${toRow}\t${toCol}`);
        }

        movingPieceElement!.style.opacity = '1';
        movingPieceElement = null;

        resetDragState();
    }

    function handleMoveEvent(event: CustomEvent) {
        const { fromRow, fromCol, toRow, toCol } = event.detail;

        if (content[fromRow][fromCol] !== NONE) {
            moveGrasoosha(fromRow, fromCol, toRow, toCol);

            const randomIndex = Math.floor(Math.random() * sounds.length);
            const sound = sounds[randomIndex];
            sound.currentTime = 0;
            sound.play();
        }
    }
    
    function handleBoardEvent(event: CustomEvent) {
        const { board } = event.detail;
        content = board;
    }

    onMount(() => {
        sounds = [new Audio(nema1), new Audio(nema2), new Audio(nema3), new Audio(nema4), new Audio(nema5)];
        for (const sound of sounds) {
            sound.preload = 'auto'
            sound.load();
        }
        
        window.addEventListener('mousemove', handleWindowMouseMove);
        window.addEventListener('mouseup', handleWindowMouseUp);
        window.addEventListener('move', handleMoveEvent as EventListener);
        window.addEventListener('board', handleBoardEvent as EventListener);

        return () => {
            window.removeEventListener('mousemove', handleWindowMouseMove);
            window.removeEventListener('mouseup', handleWindowMouseUp);
            window.removeEventListener('move', handleMoveEvent as EventListener);
            window.removeEventListener('board', handleBoardEvent as EventListener);
        };
    });
</script>

<div class="shats-board" bind:this={boardElement} role="presentation" style={isDragging ? 'cursor: grabbing;' : ''}>
{#each Array(7) as _, i}
    <div class="shats-row">
        {#each Array(7) as _, j}
            <div class="shats-cell {((i + j) % 2 === 0) ? 'shats-cell-yellow' : 'shats-cell-white'}">
                {#if content[i][j] !== NONE}
                    <Grasoosha value={content[i][j]} row={i} col={j} onDragStart={handleDragStart} />
                {/if}
            </div>
        {/each}
    </div>
{/each}

{#if isDragging && draggedFrom}
    <div class="floating-piece" style="left: {dragPosition.x}px; top: {dragPosition.y}px; --piece-type: {draggedValue}">
        <Grasoosha value={draggedValue} row={draggedFrom.row} col={draggedFrom.col} onDragStart={() => {}} />
    </div>
{/if}
</div>

<style>
    .shats-board {
        display: flex;
        flex-direction: column;
        border: 2px solid #19191e;
        width: max-content;
        margin: 20px auto;
        position: relative;
    }

    .shats-row {
        display: flex;
    }

    .shats-cell {
        width: 50px;
        height: 50px;
    }

    .shats-cell-yellow {
        background-color: #ffce00;
    }

    .shats-cell-white {
        background-color: #f7f7f9;
    }

    .floating-piece {
        position: fixed;
        width: 50px;
        height: 50px;
        pointer-events: none;
        transform: translate(-25px, -25px);
        z-index: 1000;
    }
</style>