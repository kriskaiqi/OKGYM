"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config");
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
})(LogLevel || (LogLevel = {}));
class Logger {
    constructor() {
        var _a;
        this.level = this.getLogLevelFromString(((_a = config_1.config.logger) === null || _a === void 0 ? void 0 : _a.level) || 'info');
    }
    getLogLevelFromString(level) {
        switch (level.toLowerCase()) {
            case 'debug': return LogLevel.DEBUG;
            case 'info': return LogLevel.INFO;
            case 'warn': return LogLevel.WARN;
            case 'error': return LogLevel.ERROR;
            default: return LogLevel.INFO;
        }
    }
    formatLog(level, message, meta) {
        const timestamp = new Date().toISOString();
        let formattedMeta = '';
        if (meta) {
            try {
                formattedMeta = JSON.stringify(meta);
            }
            catch (e) {
                formattedMeta = '[Unserializable data]';
            }
        }
        return `[${timestamp}] [${level}] ${message}${meta ? ' ' + formattedMeta : ''}`;
    }
    debug(message, meta) {
        if (this.level <= LogLevel.DEBUG) {
            console.log(this.formatLog('DEBUG', message, meta));
        }
    }
    info(message, meta) {
        if (this.level <= LogLevel.INFO) {
            console.log(this.formatLog('INFO', message, meta));
        }
    }
    warn(message, meta) {
        if (this.level <= LogLevel.WARN) {
            console.warn(this.formatLog('WARN', message, meta));
        }
    }
    error(message, meta) {
        if (this.level <= LogLevel.ERROR) {
            console.error(this.formatLog('ERROR', message, meta));
        }
    }
    setLevel(level) {
        this.level = this.getLogLevelFromString(level);
    }
}
exports.default = new Logger();
//# sourceMappingURL=logger.js.map