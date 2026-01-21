import { exec } from 'child_process';

console.log('Running database migration...');

exec('npx prisma migrate dev --name "feat-financial-module-refactor"', (error, stdout, stderr) => {
  if (error) {
    console.error(`Migration failed: ${error.message}`);
    // Also log stderr if it contains useful information
    if (stderr) {
        console.error(`Stderr: ${stderr}`);
    }
    return;
  }
  
  if (stderr) {
    // Sometimes prisma outputs warnings or other info to stderr on success
    console.warn(`Migration stderr: ${stderr}`);
  }
  
  console.log(`Migration successful: ${stdout}`);
});
