import { WebSocketServer, WebSocket } from 'ws';

interface ClientInfo {
  id: string;
  name: string;
  card?: string;
  ws: WebSocket;
}

const rooms: Record<string, ClientInfo[]> = {};

const lobbyClients = new Set<WebSocket>();

const broadcast = (roomId: string) => {
  const clients = rooms[roomId];
  if (!clients) return;

  const participants = rooms[roomId].map((client) => ({
    id: client.id,
    name: client.name,
    card: client.card,
  }));

  const sortedParticipants = participants.sort((a, b) => a.name.localeCompare(b.name));

  const payload = {
    type: 'state',
    payload: {
      participants: sortedParticipants,
    },
  };
  rooms[roomId].forEach((client) => client.ws.send(JSON.stringify(payload)));
};

const broadcastLobbyRooms = () => {
  const payload = JSON.stringify({
    type: 'rooms',
    payload: Object.keys(rooms),
  });
  for (const client of lobbyClients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
};

const wss = new WebSocketServer({ port: 8080 });

console.log('✅ WebSocket server is running ws://localhost:8080');

wss.on('connection', (ws, req) => {
  const path = req.url?.slice(1) || 'default';
  let client: ClientInfo | null = null;

  if (path === 'lobby') {
    console.log('🟢 Client has connected to Lobby');
    lobbyClients.add(ws);

    ws.send(
      JSON.stringify({
        type: 'rooms',
        payload: Object.keys(rooms),
      }),
    );

    ws.on('close', () => {
      lobbyClients.delete(ws);
      console.log('🔴 Lobby клиент отключился');
    });

    ws.on('error', (err) => {
      console.error('❌ WebSocket Error (lobby):', err);
    });

    return;
  }

  const roomId = path;
  console.log(`🟢 Client has connected to the room: ${roomId}`);
  rooms[roomId] ||= [];

  ws.on('message', (data) => {
    const { type, user, card } = JSON.parse(data.toString());

    switch (type) {
      case 'getRooms':
        ws.send(
          JSON.stringify({
            type: 'rooms',
            payload: Object.keys(rooms),
          }),
        );
        break;
      case 'join': {
        client = { ...user, ws };
        console.log('📥 JOIN:', user.id, user.name);

        const existing = rooms[roomId].find((c) => c.id === user.id);
        if (!existing) {
          rooms[roomId].push(client as ClientInfo);
        } else {
          existing.ws = ws;
        }
        broadcast(roomId);
        broadcastLobbyRooms();
        break;
      }
      case 'vote':
        if (client) client.card = card;
        broadcast(roomId);
        break;
      case 'reset':
        rooms[roomId].forEach((c) => delete c.card);
        broadcast(roomId);
        break;
      case 'quit':
        if (client) {
          rooms[roomId] = rooms[roomId].filter((c) => c.id !== client?.id);
        }
        if (rooms[roomId].length === 0) {
          delete rooms[roomId];
          console.log(`🗑️ Room ${roomId} is empty and has been deleted`);
        }
        broadcastLobbyRooms();
        broadcast(roomId);
        break;
    }
  });

  ws.on('close', (code, reason) => {
    console.log(`🔴 Connection is closed. Code: ${code}, Reason: ${reason.toString()}`);
    if (rooms[roomId]) {
      if (client) {
        rooms[roomId] = rooms[roomId].filter((c) => c.id !== client?.id);
      }
      console.log('🧹 Remove:', client?.id, client?.name);
      if (rooms[roomId].length === 0) {
        delete rooms[roomId];
        console.log(`🗑️ Room ${roomId} is empty and has been deleted`);
      }
    }
    broadcast(roomId);
    broadcastLobbyRooms();
  });

  ws.on('error', (err) => {
    console.error('❌ WebSocket Error:', err);
  });
});
