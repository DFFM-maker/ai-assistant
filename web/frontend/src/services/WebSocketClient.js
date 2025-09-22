export default function createWebSocket() {
    // Usa il proxy nginx, quindi niente ":3000"
    return new WebSocket('wss://ai-assistant.dffm.it/ws');
}