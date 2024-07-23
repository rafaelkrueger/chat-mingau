const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const crypto = require('crypto');

// Create an instance of Express
const app = express();
const server = http.createServer(app);

// Configure WebSocket to use the HTTP server
const wss = new WebSocket.Server({ server });

let clients = [];
let clientColors = {};

// Configure the port (Heroku provides the PORT environment variable)
const PORT = process.env.PORT || 8080;

// Function to generate a random color
function getRandomColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

// Handle new WebSocket connections
wss.on('connection', (ws) => {
  // Assign a unique color to the new client
  const color = getRandomColor();
  const clientId = crypto.randomUUID();
  clients.push({ ws, clientId, color });
  clientColors[clientId] = color;
  console.log('New client connected with color:', color);

  // Send the client's unique color
  ws.send(JSON.stringify({ type: 'color', color }));

  updateClientCount();

  ws.on('message', (message) => {
    let textMessage;
    if (Buffer.isBuffer(message)) {
      textMessage = message.toString('utf-8');
    } else {
      textMessage = message;
    }
    console.log('Received message:', textMessage);
    broadcast(textMessage, clientId);
  });

  ws.on('close', () => {
    clients = clients.filter(client => client.ws !== ws);
    delete clientColors[clientId];
    console.log('Client disconnected');
    updateClientCount();
  });
});

// Function to broadcast messages to all clients
function broadcast(message, senderId) {
  clients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify({ type: 'message', text: message, senderId }));
    }
  });
}

// Function to update the number of connected clients
function updateClientCount() {
  const message = JSON.stringify({ type: 'count', count: clients.length });
  clients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  });
}

// Serve static files if any
app.use(express.static('public'));

// Start the HTTP server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
