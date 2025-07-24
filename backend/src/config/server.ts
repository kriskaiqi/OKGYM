import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

export const SERVER_CONFIG = {
    port: process.env.PORT || 3001,
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000"
    },
    api: {
        prefix: "/api"
    }
}; 