<script lang="ts">
    import { onMount } from 'svelte';
    import Grasoosha from "./Grasoosha.svelte";
    import { NONE, WHITE_NORMAL, YELLOW_NORMAL } from "$lib/consts";

    let content = [
        [NONE, WHITE_NORMAL, WHITE_NORMAL, WHITE_NORMAL, WHITE_NORMAL, WHITE_NORMAL, NONE],
        [WHITE_NORMAL, WHITE_NORMAL, WHITE_NORMAL, WHITE_NORMAL, WHITE_NORMAL, WHITE_NORMAL, WHITE_NORMAL],
        [NONE, NONE, NONE, NONE, NONE, NONE, NONE],
        [NONE, NONE, NONE, NONE, NONE, NONE, NONE],
        [NONE, NONE, NONE, NONE, NONE, NONE, NONE],
        [YELLOW_NORMAL, YELLOW_NORMAL, YELLOW_NORMAL, YELLOW_NORMAL, YELLOW_NORMAL, YELLOW_NORMAL, YELLOW_NORMAL],
        [NONE, YELLOW_NORMAL, YELLOW_NORMAL, YELLOW_NORMAL, YELLOW_NORMAL, YELLOW_NORMAL, NONE],
    ];

    let draggedFrom: { row: number; col: number } | null = null;
    let dragPosition = { x: 0, y: 0 };
    let isDragging = false;
    let draggedValue = '';
    let boardElement: HTMLElement;
    let movingPieceElement: HTMLElement | null = null;

    function handleDragStart(row: number, col: number, e: DragEvent) {
        draggedFrom = { row, col };
        draggedValue = content[row][col];
        isDragging = true;
        if (e.target) {
            const target = e.target as HTMLElement;
            target.style.opacity = '0.25';
            movingPieceElement = target;
        }

        // 드래그 이미지를 투명하게 설정
        if (e.dataTransfer) {
            const emptyImage = new Image();
            e.dataTransfer.setDragImage(emptyImage, 0, 0);
            e.dataTransfer.effectAllowed = "move";
        }
    }

    function handleWindowMouseMove(e: MouseEvent) {
        if (isDragging) {
            dragPosition = { x: e.clientX, y: e.clientY };
        }
    }

    function resetDragState() {
        draggedFrom = null;
        dragPosition = { x: 0, y: 0 };
        isDragging = false;
        draggedValue = '';
    }

    function handleWindowMouseUp(e: MouseEvent) {
        if (!isDragging || !draggedFrom) {
            resetDragState();
            return;
        }

        // 마우스 좌표를 기준으로 그리드 셀 찾기
        if (!boardElement) {
            resetDragState();
            return;
        }

        const boardRect = boardElement.getBoundingClientRect();
        const cellSize = 50; // 셀의 크기

        const x = e.clientX - boardRect.left;
        const y = e.clientY - boardRect.top;

        // 셀 위치 계산
        const toCol = Math.floor(x / cellSize);
        const toRow = Math.floor(y / cellSize);

        // 유효한 범위인지 확인
        if (toRow >= 0 && toRow < 7 && toCol >= 0 && toCol < 7) {
            const fromRow = draggedFrom.row;
            const fromCol = draggedFrom.col;

            // 같은 위치에 드롭하면 무시
            if (fromRow !== toRow || fromCol !== toCol) {
                // 드래그할 수 있는 위치인지 확인 (NONE이 아닌 경우만)
                if (content[fromRow][fromCol] !== NONE) {
                    // 말을 이동 (원래 위치는 비워짐)
                    content[toRow][toCol] = content[fromRow][fromCol];
                    content[fromRow][fromCol] = NONE;
                    content = content; // 반응성 업데이트
                }
            } else {
                if (movingPieceElement) {
                    movingPieceElement.style.opacity = '1';
                    movingPieceElement = null;
                }
            }
        }

        resetDragState();
    }

    onMount(() => {
        window.addEventListener('mousemove', handleWindowMouseMove);
        window.addEventListener('mouseup', handleWindowMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleWindowMouseMove);
            window.removeEventListener('mouseup', handleWindowMouseUp);
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