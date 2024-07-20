const WebSocket = require('ws');
const express = require('express');
const http = require('http');

// Criar uma instância do Express
const app = express();
const server = http.createServer(app);

// Configurar o WebSocket para usar o servidor HTTP
const wss = new WebSocket.Server({ server });

let clients = [];

// Configurar a porta (Heroku define a variável de ambiente PORT)
const PORT = process.env.PORT || 8080;

// Gerenciar novas conexões WebSocket
wss.on('connection', (ws) => {
  clients.push(ws);
  console.log('New client connected');

  ws.on('message', (message) => {
    console.log('Received message:', message);
    broadcast(message);
  });

  ws.on('close', () => {
    clients = clients.filter(client => client !== ws);
    console.log('Client disconnected');
  });
});

// Função para transmitir mensagens para todos os clientes
function broadcast(message) {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Servir arquivos estáticos, se houver
app.use(express.static('public'));

// Iniciar o servidor HTTP
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
