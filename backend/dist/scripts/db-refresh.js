"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
console.log('Starting database refresh...');
async function runScript(scriptName) {
    return new Promise((resolve, reject) => {
        const nodePath = 'C:\\Users\\DELL\\miniconda3\\envs\\kaiqi\\node.exe';
        const tsNodePath = path.join(__dirname, '../../node_modules/ts-node/dist/bin.js');
        const scriptPath = path.join(__dirname, scriptName);
        console.log(`\nRunning ${scriptName}...`);
        console.log('====================================================');
        const child = (0, child_process_1.spawn)(nodePath, [tsNodePath, scriptPath], {
            stdio: 'inherit',
            shell: true
        });
        child.on('close', (code) => {
            if (code === 0) {
                console.log(`\n${scriptName} completed successfully.`);
                resolve();
            }
            else {
                console.error(`\n${scriptName} failed with code ${code}.`);
                reject(new Error(`Script ${scriptName} failed with code ${code}`));
            }
        });
    });
}
async function refreshDatabase() {
    try {
        await runScript('reset-all-data.ts');
        await runScript('seed-database.ts');
        console.log('\nDatabase refresh completed successfully!');
    }
    catch (error) {
        console.error('\nDatabase refresh failed:', error);
        process.exit(1);
    }
}
refreshDatabase();
//# sourceMappingURL=db-refresh.js.map