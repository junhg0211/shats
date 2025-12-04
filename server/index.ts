import { server as WebSocketServer } from "websocket";
import http from "http";

const PORT = 8080;

// create an http server
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("WebSocket server is running\n");
});

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
    if (message.type === "utf8") {
      console.log("Received Message: " + message.utf8Data);
      // echo the message back to the client
      connection.sendUTF(message.utf8Data);
    }
  });

  connection.on("close", (reasonCode, description) => {
    console.log(
      `WebSocket connection closed: ${reasonCode} - ${description}`
    );
  });
});