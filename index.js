const WebSocket = require('ws');
const port = process.env.port;
const server = new WebSocket.Server({ port: 8080 });

let clients = [];

server.on('connection', (ws) => {
  clients.push(ws);
  console.log('New client connected');

  ws.on('message', (message) => {
    // Verificar se a mensagem é um buffer
    if (Buffer.isBuffer(message)) {
      // Converter o buffer para texto
      const textMessage = message.toString();
      console.log('Received message:', textMessage);
      broadcast(textMessage);
    } else {
      // Assumir que a mensagem já é uma string
      console.log('Received message:', message);
      broadcast(message);
    }
  });

  ws.on('close', () => {
    clients = clients.filter(client => client !== ws);
    console.log('Client disconnected');
  });
});

function broadcast(message) {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

console.log('WebSocket server is running on ws://localhost:8080');
