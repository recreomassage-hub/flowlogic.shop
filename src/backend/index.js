"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const express_1 = __importDefault(require("express"));
const serverless_http_1 = __importDefault(require("serverless-http"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = __importDefault(require("./api/routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./api/routes/userRoutes"));
const subscriptionRoutes_1 = __importDefault(require("./api/routes/subscriptionRoutes"));
const assessmentRoutes_1 = __importDefault(require("./api/routes/assessmentRoutes"));
const app = (0, express_1.default)();
// CORS middleware (критично для фронтенда)
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'https://flowlogic.shop',
    credentials: true, // Для httpOnly cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
// API Routes
app.use('/v1/auth', authRoutes_1.default);
app.use('/v1/users', userRoutes_1.default);
app.use('/v1/subscriptions', subscriptionRoutes_1.default);
app.use('/v1/assessments', assessmentRoutes_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found', message: 'Route not found' });
});
// Export for serverless
exports.handler = (0, serverless_http_1.default)(app);
// For local development
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
exports.default = app;
//# sourceMappingURL=index.js.map