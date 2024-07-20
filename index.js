const WebSocket = require('ws');
const express = require('express');
const http = require('http');

// Create an instance of Express
const app = express();
const server = http.createServer(app);

// Configure WebSocket to use the HTTP server
const wss = new WebSocket.Server({ server });

let clients = [];

// Configure the port (Heroku provides the PORT environment variable)
const PORT = process.env.PORT || 8080;

// Handle new WebSocket connections
wss.on('connection', (ws) => {
  clients.push(ws);
  console.log('New client connected');

  ws.on('message', (message) => {
    // Check if the message is a buffer and convert to string
    let textMessage;
    if (Buffer.isBuffer(message)) {
      textMessage = message.toString('utf-8'); // Convert buffer to string
    } else {
      textMessage = message; // Assume it's already a string
    }
    console.log('Received message:', textMessage);
    broadcast(textMessage);
  });

  ws.on('close', () => {
    clients = clients.filter(client => client !== ws);
    console.log('Client disconnected');
  });
});

// Function to broadcast messages to all clients
function broadcast(message) {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message); // Send as string
    }
  });
}

// Serve static files if any
app.use(express.static('public'));

// Start the HTTP server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
