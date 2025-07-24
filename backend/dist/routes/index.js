"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRoutes = void 0;
const express_1 = require("express");
require("reflect-metadata");
const auth_routes_1 = require("./auth.routes");
const router = (0, express_1.Router)();
router.use('/auth', auth_routes_1.authRoutes);
const setupRoutes = (app) => {
    app.use('/api', router);
};
exports.setupRoutes = setupRoutes;
exports.default = router;
//# sourceMappingURL=index.js.map