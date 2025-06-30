import { WebSocketServer, WebSocket } from 'ws';

interface ClientInfo {
  id: string;
  name: string;
  card?: string;
  ws: WebSocket;
}

const rooms: Record<string, ClientInfo[]> = {};

const voteTimers: Record<string, NodeJS.Timeout> = {};
const voteStarted: Record<string, boolean> = {};

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
      console.log('🔴 Client has left Lobby');
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
      case 'vote': {
        if (client) {
          client.card = card;
        }

        if (!voteStarted[roomId] && rooms[roomId].length > 1) {
          console.log(`Vote started in room: ${roomId} by user ${client?.id}`);

          voteStarted[roomId] = true;
          const endTime = Date.now() + 10000;

          const countdownMsg = JSON.stringify({
            type: 'countdown',
            payload: { endTime },
          });

          rooms[roomId].forEach((c) => c.ws.send(countdownMsg));

          broadcast(roomId);

          voteTimers[roomId] = setTimeout(() => {
            rooms[roomId]?.forEach((c) => {
              if (!c.card) c.card = '?';
            });
            broadcast(roomId);
            console.log('Coundown finished for room:', roomId);

            rooms[roomId].forEach((c) => {
              c.ws.send(JSON.stringify({ type: 'countdown', payload: { endTime: 0 } }));
            });
            delete voteTimers[roomId];
            voteStarted[roomId] = false;
          }, 10000);
        } else {
          const everyoneVoted = rooms[roomId].every((c) => typeof c.card === 'string');
          console.log('Everyone voted:', everyoneVoted);
          broadcast(roomId);

          if (everyoneVoted) {
            clearTimeout(voteTimers[roomId]);
            rooms[roomId].forEach((c) => {
              c.ws.send(JSON.stringify({ type: 'countdown', payload: { endTime: 0 } }));
            });
            delete voteTimers[roomId];
            voteStarted[roomId] = false;
            broadcast(roomId);
          }
        }

        break;
      }
      case 'reset':
        rooms[roomId].forEach((c) => {
          c.ws.send(JSON.stringify({ type: 'countdown', payload: { endTime: null } }));
          c.card = undefined;
          delete c.card;
        });
        broadcast(roomId);
        break;
      case 'quit':
        if (client) {
          rooms[roomId] = rooms[roomId].filter((c) => c.id !== client?.id);
          if (rooms[roomId].length === 0) {
            delete rooms[roomId];
            console.log(`🗑️ Room ${roomId} is empty and has been deleted`);
          }
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
