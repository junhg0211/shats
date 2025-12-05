import { connection, server as WebSocketServer } from "websocket";
import http from "http";
import { WHITE_NORMAL, YELLOW_NORMAL, NONE } from "../consts";

const PORT = 48828;

const board = [
  [NONE, WHITE_NORMAL, WHITE_NORMAL, WHITE_NORMAL, WHITE_NORMAL, WHITE_NORMAL, NONE],
  [WHITE_NORMAL, WHITE_NORMAL, WHITE_NORMAL, WHITE_NORMAL, WHITE_NORMAL, WHITE_NORMAL, WHITE_NORMAL],
  [NONE, NONE, NONE, NONE, NONE, NONE, NONE],
  [NONE, NONE, NONE, NONE, NONE, NONE, NONE],
  [NONE, NONE, NONE, NONE, NONE, NONE, NONE],
  [YELLOW_NORMAL, YELLOW_NORMAL, YELLOW_NORMAL, YELLOW_NORMAL, YELLOW_NORMAL, YELLOW_NORMAL, YELLOW_NORMAL],
  [NONE, YELLOW_NORMAL, YELLOW_NORMAL, YELLOW_NORMAL, YELLOW_NORMAL, YELLOW_NORMAL, NONE],
];

// create an http server
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("WebSocket server is running\n");
});

function announce(message: string) {
  wsServer.connections.forEach((connection) => {
    connection.sendUTF(message);
  });
}

// define protocols
const protocols = [
  {
    prefix: "move",
    handler: (connection: connection, args: string[]) => {
      const [rawFromRow, rawFromCol, rawToRow, rawToCol] = args;
      const fromRow = parseInt(rawFromRow);
      const fromCol = parseInt(rawFromCol);
      const toRow = parseInt(rawToRow);
      const toCol = parseInt(rawToCol);

      if (fromRow < 0 || fromRow >= 7 || fromCol < 0 || fromCol >= 7) return;
      if (toRow < 0 || toRow >= 7 || toCol < 0 || toCol >= 7) return;
      if (board[fromRow][fromCol] === NONE) return;

      board[toRow][toCol] = board[fromRow][fromCol];
      board[fromRow][fromCol] = NONE;
      
      announce(`move\t${fromRow}\t${fromCol}\t${toRow}\t${toCol}`);
    }
  }
]

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

// create a websocket server
const wsServer = new WebSocketServer({
  httpServer: server,
});

// handle websocket requests
wsServer.on("request", (request) => {
  const connection = request.accept(null, request.origin);
  console.log("WebSocket connection accepted");

  connection.on("message", (message) => {
    if (message.type !== "utf8") return;

    console.log(`Received Message: ${message.utf8Data}`);

    const args = message.utf8Data.split(/\t/g);
    const prefix = args.shift();
    for (const protocol of protocols) {
      if (prefix !== protocol.prefix) continue;
      protocol.handler(connection, args);
      break;
    }
  });

  connection.on("close", (reasonCode, description) => {
    console.log(
      `WebSocket connection closed: ${reasonCode} - ${description}`
    );
  });
});