import { spawn } from 'child_process';
import * as path from 'path';

console.log('Starting database refresh...');

/**
 * Run a script as a child process
 */
async function runScript(scriptName: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const nodePath = 'C:\\Users\\DELL\\miniconda3\\envs\\kaiqi\\node.exe';
        const tsNodePath = path.join(__dirname, '../../node_modules/ts-node/dist/bin.js');
        const scriptPath = path.join(__dirname, scriptName);
        
        console.log(`\nRunning ${scriptName}...`);
        console.log('====================================================');
        
        const child = spawn(nodePath, [tsNodePath, scriptPath], { 
            stdio: 'inherit',
            shell: true 
        });
        
        child.on('close', (code) => {
            if (code === 0) {
                console.log(`\n${scriptName} completed successfully.`);
                resolve();
            } else {
                console.error(`\n${scriptName} failed with code ${code}.`);
                reject(new Error(`Script ${scriptName} failed with code ${code}`));
            }
        });
    });
}

async function refreshDatabase() {
    try {
        // Step 1: Reset all data
        await runScript('reset-all-data.ts');
        
        // Step 2: Seed database
        await runScript('seed-database.ts');
        
        console.log('\nDatabase refresh completed successfully!');
    } catch (error) {
        console.error('\nDatabase refresh failed:', error);
        process.exit(1);
    }
}

// Execute the database refresh
refreshDatabase(); 