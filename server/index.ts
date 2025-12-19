import { connection, server as WebSocketServer } from "websocket";
import http from "http";
import { WHITE_NORMAL, YELLOW_NORMAL, NONE, YELLOW_JATSHIE } from "../consts";
import { checkRole, isLegalMove } from "../shats.js";

const PORT = 48828;

const board = [
  [
    NONE,
    WHITE_NORMAL,
    WHITE_NORMAL,
    WHITE_NORMAL,
    WHITE_NORMAL,
    WHITE_NORMAL,
    NONE,
  ],
  [
    WHITE_NORMAL,
    WHITE_NORMAL,
    WHITE_NORMAL,
    WHITE_NORMAL,
    WHITE_NORMAL,
    WHITE_NORMAL,
    WHITE_NORMAL,
  ],
  [NONE, NONE, NONE, NONE, NONE, NONE, NONE],
  [NONE, NONE, NONE, NONE, NONE, NONE, NONE],
  [NONE, NONE, NONE, NONE, NONE, NONE, NONE],
  [
    YELLOW_NORMAL,
    YELLOW_NORMAL,
    YELLOW_NORMAL,
    YELLOW_NORMAL,
    YELLOW_NORMAL,
    YELLOW_NORMAL,
    YELLOW_NORMAL,
  ],
  [
    NONE,
    YELLOW_NORMAL,
    YELLOW_NORMAL,
    YELLOW_NORMAL,
    YELLOW_NORMAL,
    YELLOW_NORMAL,
    NONE,
  ],
];

const moves = [];
let lastMove = {}; // [role, fromCol, fromRow, toCol, toRow, capturedPiece, check, checkmate]

// create an http server
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("WebSocket server is running\n");
});

function announce(message: string) {
  wsServer.connections.forEach((connection) => {
    connection.sendUTF(message);
  });
  console.log(`Announce: ${message}`);
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

      const fromColor =
        board[fromRow][fromCol] === YELLOW_NORMAL ||
        board[fromRow][fromCol] === YELLOW_JATSHIE
          ? "Y"
          : board[fromRow][fromCol] === NONE
          ? "N"
          : "W";
      const toColor =
        board[toRow][toCol] === YELLOW_NORMAL ||
        board[toRow][toCol] === YELLOW_JATSHIE
          ? "Y"
          : board[toRow][toCol] === NONE
          ? "N"
          : "W";
      if (fromColor === toColor) return;

      const roles = checkRole(board, fromRow, fromCol, false);
      let legalBy = null;
      for (const role of roles) {
        if (isLegalMove(role, fromRow, fromCol, toRow, toCol, board)) {
          legalBy = role;
          break;
        }
      }

      if (!legalBy) return;

      lastMove = {
        role: legalBy,
        fromCol,
        fromRow,
        toCol,
        toRow,
        capturedPiece: board[toRow][toCol],
      };
      moves.push(lastMove);

      board[toRow][toCol] = board[fromRow][fromCol];
      board[fromRow][fromCol] = NONE;

      announce(`move\t${fromRow}\t${fromCol}\t${toRow}\t${toCol}`);
      announce(`lastmove\t${JSON.stringify(lastMove)}`);
    },
  },
  {
    prefix: "load",
    handler: (connection: connection, args: string[]) => {
      connection.sendUTF(`board\t${JSON.stringify(board)}`);
      connection.sendUTF(`lastmove\t${JSON.stringify(lastMove)}`);
    },
  },
  {
    prefix: "reset",
    handler: (connection: connection, args: string[]) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          board[r][c] = NONE;
        }
      }
      board[0][1] = WHITE_NORMAL;
      board[0][2] = WHITE_NORMAL;
      board[0][3] = WHITE_NORMAL;
      board[0][4] = WHITE_NORMAL;
      board[0][5] = WHITE_NORMAL;

      board[1][0] = WHITE_NORMAL;
      board[1][1] = WHITE_NORMAL;
      board[1][2] = WHITE_NORMAL;
      board[1][3] = WHITE_NORMAL;
      board[1][4] = WHITE_NORMAL;
      board[1][5] = WHITE_NORMAL;
      board[1][6] = WHITE_NORMAL;

      board[5][0] = YELLOW_NORMAL;
      board[5][1] = YELLOW_NORMAL;
      board[5][2] = YELLOW_NORMAL;
      board[5][3] = YELLOW_NORMAL;
      board[5][4] = YELLOW_NORMAL;
      board[5][5] = YELLOW_NORMAL;
      board[5][6] = YELLOW_NORMAL;

      board[6][1] = YELLOW_NORMAL;
      board[6][2] = YELLOW_NORMAL;
      board[6][3] = YELLOW_NORMAL;
      board[6][4] = YELLOW_NORMAL;
      board[6][5] = YELLOW_NORMAL;

      moves.length = 0;
      lastMove = null;

      announce(`board\t${JSON.stringify(board)}`);
      announce(`lastmove\t${JSON.stringify(lastMove)}`);
    },
  },
];

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
    console.log(`WebSocket connection closed: ${reasonCode} - ${description}`);
  });
});
