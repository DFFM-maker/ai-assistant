"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const gitlabAuth_1 = __importDefault(require("./gitlabAuth"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'https://ai-assistant.dffm.it'],
    credentials: true
}));
// ...altre API...
// Auth routes
app.use('/api', gitlabAuth_1.default);
// ...altre API...
app.listen(4000, () => {
    console.log('Backend listening on port 4000');
});
//# sourceMappingURL=index.js.map