"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeTransaction = executeTransaction;
exports.executeTransactionBatch = executeTransactionBatch;
exports.isInTransaction = isInTransaction;
const data_source_1 = require("../data-source");
const errors_1 = require("./errors");
const logger_1 = __importDefault(require("./logger"));
async function executeTransaction(callback) {
    const queryRunner = data_source_1.AppDataSource.createQueryRunner();
    try {
        await queryRunner.connect();
        await queryRunner.startTransaction();
        const result = await callback(queryRunner);
        await queryRunner.commitTransaction();
        return result;
    }
    catch (error) {
        if (queryRunner.isTransactionActive) {
            await queryRunner.rollbackTransaction();
        }
        logger_1.default.error('Transaction failed', {
            error: error instanceof Error ? error.message : String(error)
        });
        if (error instanceof errors_1.AppError) {
            throw error;
        }
        throw new errors_1.AppError(errors_1.ErrorType.TRANSACTION_ERROR, 'Transaction failed', 500, { originalError: error instanceof Error ? error.message : String(error) });
    }
    finally {
        await queryRunner.release();
    }
}
async function executeTransactionBatch(operations) {
    return executeTransaction(async (queryRunner) => {
        const results = [];
        const manager = queryRunner.manager;
        for (const operation of operations) {
            const result = await operation(manager);
            results.push(result);
        }
        return results;
    });
}
function isInTransaction(manager) {
    var _a;
    return ((_a = manager.queryRunner) === null || _a === void 0 ? void 0 : _a.isTransactionActive) || false;
}
//# sourceMappingURL=transaction-helper.js.map