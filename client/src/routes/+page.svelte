<script lang="ts">
    import { onMount } from "svelte";
    import ShatsBoard from "$lib/components/ShatsBoard.svelte";

    let socket: WebSocket;

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
                const moveEvent = new CustomEvent("move", { detail: { fromRow, fromCol, toRow, toCol } });
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
        }
    ]

    onMount(() => {
        socket = new WebSocket("ws://localhost:48828");

        socket.onmessage = (event) => {
            const content = event.data;
            for (const protocol of protocols) {
                if (content.startsWith(protocol.prefix + "\t")) {
                    const args = content.split("\t").slice(1);
                    protocol.handler(socket, args);
                    break;
                }
            }
        };

        socket.onopen = () => {
            socket.send('load')
        };
    });
</script>

<ShatsBoard {socket} />
