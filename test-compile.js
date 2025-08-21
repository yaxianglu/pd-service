const { execSync } = require('child_process');

try {
  console.log('Testing TypeScript compilation...');
  const result = execSync('npx tsc --noEmit', { encoding: 'utf8', cwd: __dirname });
  console.log('✅ TypeScript compilation successful!');
  console.log(result);
} catch (error) {
  console.log('❌ TypeScript compilation failed:');
  console.log(error.stdout);
  console.log(error.stderr);
  process.exit(1);
}