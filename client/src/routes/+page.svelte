<script lang="ts">
  import { onMount } from "svelte";
  import ShatsBoard from "$lib/components/ShatsBoard.svelte";

  let socket: WebSocket | null = null;

  const protocols = [
    {
      prefix: "move",
      handler: (connection: WebSocket, args: string[]) => {
        const [rawFromRow, rawFromCol, rawToRow, rawToCol] = args;
        const fromRow = parseInt(rawFromRow);
        const fromCol = parseInt(rawFromCol);
        const toRow = parseInt(rawToRow);
        const toCol = parseInt(rawToCol);

        // Handle the move logic here
        const moveEvent = new CustomEvent("move", {
          detail: {
            fromRow,
            fromCol,
            toRow,
            toCol,
          },
        });
        window.dispatchEvent(moveEvent);
      },
    },
    {
      prefix: "board",
      handler: (connection: WebSocket, args: string[]) => {
        const [rawBoard] = args;
        const board = JSON.parse(rawBoard);

        // Handle the board update logic here
        const boardEvent = new CustomEvent("board", {
          detail: {
            board,
          },
        });
        window.dispatchEvent(boardEvent);
      },
    },
  ];

  function resetBoard() {
    if (!socket) return;

    const confirmation = window.confirm(
      "정말로 보드를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
    );
    if (!confirmation) return;

    socket.send("reset");
  }

  onMount(() => {
    try {
      socket = new WebSocket("ws://sch.shtelo.org:48828");

      socket.onmessage = (event) => {
        const content = event.data;
        for (const protocol of protocols) {
          if (content.startsWith(protocol.prefix + "\t")) {
            const args = content.split("\t").slice(1);
            protocol.handler(socket!, args);
            break;
          }
        }
      };

      socket.onopen = () => {
        socket!.send("load");
      };

      socket.onerror = () => {
        console.log("소켓 연결 실패. 오프라인 모드로 작동합니다.");
        socket = null;
      };
    } catch (error) {
      console.log("소켓 연결 실패. 오프라인 모드로 작동합니다.");
      socket = null;
    }
  });
</script>

<div class="page-container">
  <div class="sidebar">Hello, world!</div>
  <ShatsBoard {socket} />
  <div class="sidebar">
    <button on:click={resetBoard}>Reset</button>
  </div>
</div>

<style>
  .page-container {
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .sidebar {
    border: 2px solid #19191e;
    height: 350px;
    margin: 0 12px;
  }
</style>
