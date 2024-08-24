import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import cookie from 'cookie';
import { IncomingMessage } from 'http';
import { queryPayload } from '../model/queryPayloadInterface';
import { handleMonitorRealTimeData } from '../services/parkManagementService';

const clients = new Map<WebSocket, string>();
const defaultPayload: queryPayload = {
  payload: {
    plateNumber: "",
    timeInLowerLimit : undefined ,
    timeInUpperLimit : undefined,
    lastVisibleId: "",
    operation: 'none',
    location: ''
  },
  type: 'default' ,
}
const setupWebSocketServer = (server: http.Server) => {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    console.log('WebSocket client connected');

    const cookies = req.headers.cookie || '';
    const parsedCookies = cookie.parse(cookies);
    const cookieValue = JSON.parse(parsedCookies.token);
    const location: string = cookieValue.location;
    try {
      if (location) {
        clients.set(ws, location);
        handleMonitorRealTimeData(ws, location, defaultPayload);
      } else {
        ws.send(JSON.stringify({ error: 'No location specified' }));
        ws.close();
      }
    } catch (error) {
      ws.send(JSON.stringify({ error: 'No location specified' }));
      ws.close();
    }

    ws.on('message', (message: string) => {
      const data: queryPayload = JSON.parse(message);
      handleMonitorRealTimeData(ws, location, data);
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      clients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  return wss;
};

export { setupWebSocketServer, clients };
