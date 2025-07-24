"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeTransaction = executeTransaction;
exports.executeTransactionBatch = executeTransactionBatch;
exports.isInTransaction = isInTransaction;
async function executeTransaction(callback) {
    const mockQueryRunner = {
        manager: {
            save: jest.fn().mockImplementation((Entity, data) => {
                if (Array.isArray(data)) {
                    return Promise.resolve(data.map((item, index) => (Object.assign(Object.assign({}, item), { id: index + 1 }))));
                }
                return Promise.resolve(Object.assign(Object.assign({}, data), { id: 1 }));
            }),
            delete: jest.fn().mockResolvedValue({ affected: 1 }),
            update: jest.fn().mockImplementation((Entity, id, data) => {
                return Promise.resolve(Object.assign(Object.assign({}, data), { id }));
            })
        },
        connect: jest.fn().mockResolvedValue(undefined),
        startTransaction: jest.fn().mockResolvedValue(undefined),
        commitTransaction: jest.fn().mockResolvedValue(undefined),
        rollbackTransaction: jest.fn().mockResolvedValue(undefined),
        release: jest.fn().mockResolvedValue(undefined),
        isTransactionActive: true,
    };
    try {
        const result = await callback(mockQueryRunner);
        return result;
    }
    catch (error) {
        throw error;
    }
}
async function executeTransactionBatch(operations) {
    const results = [];
    const mockManager = {
        save: jest.fn().mockImplementation((Entity, data) => {
            if (Array.isArray(data)) {
                return Promise.resolve(data.map((item, index) => (Object.assign(Object.assign({}, item), { id: index + 1 }))));
            }
            return Promise.resolve(Object.assign(Object.assign({}, data), { id: 1 }));
        }),
        delete: jest.fn().mockResolvedValue({ affected: 1 }),
        update: jest.fn().mockImplementation((Entity, id, data) => {
            return Promise.resolve(Object.assign(Object.assign({}, data), { id }));
        }),
        findOne: jest.fn().mockImplementation(() => Promise.resolve(null)),
        find: jest.fn().mockImplementation(() => Promise.resolve([])),
        queryRunner: { isTransactionActive: true }
    };
    for (const operation of operations) {
        const result = await operation(mockManager);
        results.push(result);
    }
    return results;
}
function isInTransaction(manager) {
    return true;
}
//# sourceMappingURL=transaction-helper.js.map