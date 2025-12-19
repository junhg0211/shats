<script lang="ts">
  import { onMount } from "svelte";
  import Grasoosha from "./Grasoosha.svelte";
  import { NONE } from "../../../../consts";
  import { checkRoles } from "../../../../shats";

  export let socket: WebSocket | null = null;

  let content = [
    [NONE, NONE, NONE, NONE, NONE, NONE, NONE],
    [NONE, NONE, NONE, NONE, NONE, NONE, NONE],
    [NONE, NONE, NONE, NONE, NONE, NONE, NONE],
    [NONE, NONE, NONE, NONE, NONE, NONE, NONE],
    [NONE, NONE, NONE, NONE, NONE, NONE, NONE],
    [NONE, NONE, NONE, NONE, NONE, NONE, NONE],
    [NONE, NONE, NONE, NONE, NONE, NONE, NONE],
  ];
  export let flipped = false;
  let roles: string[][][] = Array(7)
    .fill(null)
    .map(() => Array(7).fill([]));

  function flipBoard() {
    flipped = !flipped;

    const newContent = Array(7)
      .fill(null)
      .map(() => Array(7).fill(NONE));
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        newContent[6 - i][6 - j] = content[i][j];
      }
    }
    content = newContent;

    roles = checkRoles(content, roles, flipped);
  }

  function moveGrasoosha(
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number,
  ) {
    if (fromRow < 0 || fromRow >= 7 || fromCol < 0 || fromCol >= 7) return;
    if (toRow < 0 || toRow >= 7 || toCol < 0 || toCol >= 7) return;

    content[toRow][toCol] = content[fromRow][fromCol];
    content[fromRow][fromCol] = NONE;
    content = content;
    roles = checkRoles(content, roles, flipped);
  }

  let draggedFrom: { row: number; col: number } | null = null;
  let dragPosition = { x: 0, y: 0 };
  let isDragging = false;
  let draggedValue = "";
  let boardElement: HTMLElement;
  let movingPieceElement: HTMLElement | null = null;

  function handleDragStart(row: number, col: number, e: DragEvent) {
    const target = e.target as HTMLElement;
    target.style.display = "none";
    movingPieceElement = target;

    draggedFrom = { row, col };
    draggedValue = content[row][col];
    isDragging = true;

    if (!e.dataTransfer) return;

    const transparentPixel = new Image();
    transparentPixel.src =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9W3gU5kAAAAASUVORK5CYII=";
    e.dataTransfer.setDragImage(transparentPixel, 0, 0);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "dragging");
  }

  function handleWindowMouseMove(e: MouseEvent) {
    if (!isDragging) return;

    dragPosition = { x: e.clientX, y: e.clientY };
  }

  function handleWindowDragOver(e: DragEvent) {
    if (!isDragging) return;
    dragPosition = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  }

  function resetDragState() {
    draggedFrom = null;
    dragPosition = { x: 0, y: 0 };
    isDragging = false;
    draggedValue = "";
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

    if (!(toRow >= 0 && toRow < 7 && toCol >= 0 && toCol < 7))
      return resetDragState();

    const fromRow = draggedFrom.row;
    const fromCol = draggedFrom.col;

    if (
      (fromRow !== toRow || fromCol !== toCol) &&
      content[fromRow][fromCol] !== NONE
    ) {
      if (socket && socket.readyState === WebSocket.OPEN) {
        if (flipped) {
          socket.send(
            `move\t${6 - fromRow}\t${6 - fromCol}\t${6 - toRow}\t${6 - toCol}`,
          );
        } else {
          socket.send(`move\t${fromRow}\t${fromCol}\t${toRow}\t${toCol}`);
        }
      } else {
        // 오프라인 모드: 로컬에서만 이동
        if (flipped) {
          moveGrasoosha(6 - fromRow, 6 - fromCol, 6 - toRow, 6 - toCol);
        } else {
          moveGrasoosha(fromRow, fromCol, toRow, toCol);
        }
      }
    }

    if (movingPieceElement) {
      movingPieceElement.style.display = "block";
      movingPieceElement = null;
    }

    resetDragState();
  }

  // Ensure drag ends cleanly when the HTML5 DnD session finishes
  function handleWindowDragEnd(e: DragEvent) {
    // Use the last tracked position to finish the drag like mouseup
    const fakeMouseUp = new MouseEvent("mouseup", {
      clientX: dragPosition.x,
      clientY: dragPosition.y,
    });
    handleWindowMouseUp(fakeMouseUp);
  }

  function handleMoveEvent(event: CustomEvent) {
    const { fromRow, fromCol, toRow, toCol } = event.detail;
    const fromR = parseInt(fromRow);
    const fromC = parseInt(fromCol);
    const toR = parseInt(toRow);
    const toC = parseInt(toCol);

    if (flipped) return moveGrasoosha(6 - fromR, 6 - fromC, 6 - toR, 6 - toC);
    moveGrasoosha(fromR, fromC, toR, toC);
  }

  function handleBoardEvent(event: CustomEvent) {
    const { board } = event.detail;
    content = board;
    roles = checkRoles(content, roles, flipped);
  }

  function handleFlipChanged(e: CustomEvent<{ flipped: boolean }>) {
    e.detail.flipped !== flipped && flipBoard();
  }

  function handleResetEvent(e: CustomEvent) {}

  onMount(() => {
    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleWindowMouseUp);
    window.addEventListener("dragover", handleWindowDragOver);
    window.addEventListener("dragend", handleWindowDragEnd);
    window.addEventListener("move", handleMoveEvent as EventListener);
    window.addEventListener("board", handleBoardEvent as EventListener);
    window.addEventListener("flipchanged", handleFlipChanged as EventListener);
    window.addEventListener("reset", handleResetEvent as EventListener);

    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("dragover", handleWindowDragOver);
      window.removeEventListener("mouseup", handleWindowMouseUp);
      window.removeEventListener("dragend", handleWindowDragEnd);
      window.removeEventListener("move", handleMoveEvent as EventListener);
      window.removeEventListener("board", handleBoardEvent as EventListener);
      window.removeEventListener(
        "flipchanged",
        handleFlipChanged as EventListener,
      );
      window.removeEventListener("reset", handleResetEvent as EventListener);
    };
  });
</script>

<div
  class="shats-board no-select"
  bind:this={boardElement}
  role="presentation"
  style={isDragging ? "cursor: grabbing;" : ""}
>
  {#each Array(7) as _, i}
    <div class="shats-row">
      {#each Array(7) as _, j}
        <div
          class="shats-cell"
          class:shats-cell-yellow={(i + j) % 2 === 0}
          class:shats-cell-white={(i + j) % 2 === 1}
          class:shats-selected-yellow={draggedFrom &&
            draggedFrom.row === i &&
            draggedFrom.col === j &&
            (i + j) % 2 === 0}
          class:shats-selected-white={draggedFrom &&
            draggedFrom.row === i &&
            draggedFrom.col === j &&
            (i + j) % 2 === 1}
        >
          {#if content[i][j] !== NONE}
            <Grasoosha
              value={content[i][j]}
              row={i}
              col={j}
              onDragStart={handleDragStart}
              roles={roles[i][j]}
            />
          {/if}
        </div>
      {/each}
    </div>
  {/each}

  {#if isDragging && draggedFrom}
    <div
      class="floating-piece"
      style="left: {dragPosition.x}px; top: {dragPosition.y}px; --piece-type: {draggedValue}"
    >
      <Grasoosha
        value={draggedValue}
        row={draggedFrom.row}
        col={draggedFrom.col}
        onDragStart={() => {}}
      />
    </div>
  {/if}
</div>

<style>
  .shats-board {
    display: flex;
    flex-direction: column;
    border: 2px solid #19191e;
    width: max-content;
    position: relative;
    user-select: none;
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

  .shats-selected-yellow {
    background-color: #71d7d7 !important;
  }

  .shats-selected-white {
    background-color: #cefefe !important;
  }

  .floating-piece {
    position: fixed;
    width: 50px;
    height: 50px;
    pointer-events: none;
    transform: translate(-25px, -25px);
    z-index: 1000;
  }

  .no-select {
    user-select: none;
    -webkit-user-select: none; /* Safari */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* IE 10+ */
  }
</style>
