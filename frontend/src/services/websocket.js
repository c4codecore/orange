const WS_URL = 'ws://192.168.1.4:8001/ws';

class WebSocketService {
    constructor() {
        this.ws = null;
        this.token = null;
        this.listeners = {};
        this.reconnectTimer = null;
        this.shouldReconnect = false;
    }

    connect(token) {
        this.token = token;
        this.shouldReconnect = true;
        this._connect();
    }

    _connect() {
        if (this.ws) {
            this.ws.close();
        }

        this.ws = new WebSocket(`${WS_URL}?token=${this.token}`);

        this.ws.onopen = () => {
            console.log('WebSocket connected');
            // Ping every 25s to keep connection alive
            this._startPing();
        };

        this.ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                this._emit(message.type, message);
            } catch (e) {
                // ignore
            }
        };

        this.ws.onclose = () => {
            console.log('WebSocket disconnected');
            this._stopPing();
            if (this.shouldReconnect) {
                // 3 second baad reconnect karo
                this.reconnectTimer = setTimeout(() => this._connect(), 3000);
            }
        };

        this.ws.onerror = () => {
            this.ws.close();
        };
    }

    disconnect() {
        this.shouldReconnect = false;
        this._stopPing();
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
        if (this.ws) this.ws.close();
        this.ws = null;
        this.listeners = {};
    }

    on(event, callback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
        return () => this.off(event, callback); // unsubscribe function return karo
    }

    off(event, callback) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }

    _emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => cb(data));
        }
    }

    _startPing() {
        this._stopPing();
        this.pingInterval = setInterval(() => {
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.ws.send('ping');
            }
        }, 25000);
    }

    _stopPing() {
        if (this.pingInterval) clearInterval(this.pingInterval);
    }
}

export const wsService = new WebSocketService();