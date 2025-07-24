"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const config_1 = require("./config");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: config_1.config.database.host,
    port: config_1.config.database.port,
    username: config_1.config.database.username,
    password: config_1.config.database.password,
    database: config_1.config.database.database,
    synchronize: true,
    logging: false,
    entities: [`${__dirname}/models/*.{ts,js}`],
    migrations: [`${__dirname}/migrations/*.{ts,js}`],
    subscribers: [`${__dirname}/subscribers/*.{ts,js}`],
});
//# sourceMappingURL=data-source-new.js.map