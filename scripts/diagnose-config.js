/**
 * Diagnostic script to check TypeScript and Next.js configuration issues
 * that might be causing JSX syntax errors
 */

const fs = require('fs');
const path = require('path');

// Project root directory
const projectRoot = path.join(__dirname, '..');

console.log('🔧 Diagnosing TypeScript and Next.js configuration...');
console.log('Project root:', projectRoot);
console.log('=' .repeat(60));

try {
  // Check package.json dependencies
  console.log('📦 Package Dependencies Analysis:');
  const packageJsonPath = path.join(projectRoot, 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Key dependencies to check
    const keyDeps = {
      'next': 'Next.js framework',
      'react': 'React library',
      'react-dom': 'React DOM',
      'typescript': 'TypeScript compiler',
      '@types/react': 'React type definitions',
      '@types/react-dom': 'React DOM type definitions',
      '@types/node': 'Node.js type definitions'
    };
    
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    Object.entries(keyDeps).forEach(([dep, description]) => {
      if (allDeps[dep]) {
        console.log(`✅ ${dep}: ${allDeps[dep]} (${description})`);
      } else {
        console.log(`❌ ${dep}: Missing! (${description})`);
      }
    });
    
    // Check for potential conflicting dependencies
    console.log('\n🔍 Potential Conflicts:');
    const conflicts = [
      { name: '@babel/core', reason: 'May conflict with Next.js built-in Babel' },
      { name: 'webpack', reason: 'May conflict with Next.js built-in Webpack' },
      { name: 'eslint-config-next', reason: 'Should be present for Next.js projects' }
    ];
    
    conflicts.forEach(({ name, reason }) => {
      if (allDeps[name]) {
        console.log(`⚠️  ${name}: ${allDeps[name]} - ${reason}`);
      } else if (name === 'eslint-config-next') {
        console.log(`❌ ${name}: Missing - ${reason}`);
      } else {
        console.log(`✅ ${name}: Not present - ${reason}`);
      }
    });
  } else {
    console.log('❌ package.json not found!');
  }
  
  // Check tsconfig.json
  console.log('\n📝 TypeScript Configuration Analysis:');
  const tsconfigPath = path.join(projectRoot, 'tsconfig.json');
  
  if (fs.existsSync(tsconfigPath)) {
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    
    console.log('✅ tsconfig.json found');
    
    // Check critical compiler options
    const compilerOptions = tsconfig.compilerOptions || {};
    const criticalOptions = {
      'jsx': 'Should be "preserve" for Next.js',
      'target': 'Should be ES5 or higher',
      'lib': 'Should include DOM and ES6+',
      'allowJs': 'Should be true for mixed JS/TS',
      'skipLibCheck': 'Should be true to avoid type conflicts',
      'esModuleInterop': 'Should be true for better module compatibility',
      'moduleResolution': 'Should be "node" or "bundler"',
      'resolveJsonModule': 'Should be true for JSON imports',
      'isolatedModules': 'Should be true for Next.js',
      'incremental': 'Should be true for faster builds'
    };
    
    Object.entries(criticalOptions).forEach(([option, recommendation]) => {
      const value = compilerOptions[option];
      console.log(`- ${option}: ${JSON.stringify(value)} (${recommendation})`);
    });
    
    // Check include/exclude patterns
    console.log('\nFile inclusion patterns:');
    console.log('- include:', JSON.stringify(tsconfig.include || 'not specified'));
    console.log('- exclude:', JSON.stringify(tsconfig.exclude || 'not specified'));
    
  } else {
    console.log('❌ tsconfig.json not found!');
  }
  
  // Check next.config.js/mjs
  console.log('\n⚙️  Next.js Configuration Analysis:');
  const nextConfigPaths = [
    path.join(projectRoot, 'next.config.js'),
    path.join(projectRoot, 'next.config.mjs'),
    path.join(projectRoot, 'next.config.ts')
  ];
  
  let nextConfigFound = false;
  nextConfigPaths.forEach(configPath => {
    if (fs.existsSync(configPath)) {
      console.log(`✅ Found: ${path.basename(configPath)}`);
      nextConfigFound = true;
      
      try {
        const configContent = fs.readFileSync(configPath, 'utf8');
        
        // Check for common configuration issues
        const checks = [
          { pattern: /experimental.*swcMinify/, name: 'SWC Minification' },
          { pattern: /experimental.*esmExternals/, name: 'ESM Externals' },
          { pattern: /typescript.*ignoreBuildErrors/, name: 'TypeScript Build Errors Ignored' },
          { pattern: /eslint.*ignoreDuringBuilds/, name: 'ESLint Ignored During Builds' }
        ];
        
        checks.forEach(({ pattern, name }) => {
          if (pattern.test(configContent)) {
            console.log(`⚠️  ${name}: Detected in config`);
          }
        });
        
      } catch (error) {
        console.log(`❌ Error reading ${path.basename(configPath)}:`, error.message);
      }
    }
  });
  
  if (!nextConfigFound) {
    console.log('ℹ️  No Next.js config file found (using defaults)');
  }
  
  // Check for .babelrc or babel.config.js (potential conflicts)
  console.log('\n🔍 Babel Configuration Check:');
  const babelConfigs = [
    path.join(projectRoot, '.babelrc'),
    path.join(projectRoot, '.babelrc.js'),
    path.join(projectRoot, '.babelrc.json'),
    path.join(projectRoot, 'babel.config.js'),
    path.join(projectRoot, 'babel.config.json')
  ];
  
  let babelConfigFound = false;
  babelConfigs.forEach(configPath => {
    if (fs.existsSync(configPath)) {
      console.log(`⚠️  Found: ${path.basename(configPath)} - May conflict with Next.js built-in Babel`);
      babelConfigFound = true;
    }
  });
  
  if (!babelConfigFound) {
    console.log('✅ No custom Babel config found (good for Next.js)');
  }
  
  // Check Node.js version
  console.log('\n🟢 Runtime Environment:');
  console.log('- Node.js version:', process.version);
  console.log('- Platform:', process.platform);
  console.log('- Architecture:', process.arch);
  
  // Check for lock files
  console.log('\n🔒 Package Lock Files:');
  const lockFiles = [
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml'
  ];
  
  lockFiles.forEach(lockFile => {
    const lockPath = path.join(projectRoot, lockFile);
    if (fs.existsSync(lockPath)) {
      console.log(`✅ Found: ${lockFile}`);
    }
  });
  
  console.log('\n' + '=' .repeat(60));
  console.log('🏁 Configuration diagnosis complete!');
  
  console.log('\n💡 Common fixes for JSX syntax errors:');
  console.log('1. Ensure TypeScript jsx option is "preserve"');
  console.log('2. Update @types/react to latest version');
  console.log('3. Remove custom Babel config if present');
  console.log('4. Clear .next cache: rm -rf .next');
  console.log('5. Reinstall dependencies: npm ci');
  console.log('6. Check for TypeScript version conflicts');
  
} catch (error) {
  console.error('❌ Error during configuration diagnosis:', error.message);
  process.exit(1);
}