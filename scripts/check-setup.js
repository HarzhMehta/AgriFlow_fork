#!/usr/bin/env node

/**
 * Setup Verification Script
 * Checks if all required environment variables and dependencies are configured
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking DeepSeek Chat App Setup...\n');

let hasErrors = false;

// Check 1: Node version
console.log('1️⃣  Checking Node.js version...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].slice(1));
if (majorVersion >= 18) {
    console.log(`   ✅ Node.js ${nodeVersion} (Required: 18+)\n`);
} else {
    console.log(`   ❌ Node.js ${nodeVersion} - Please upgrade to 18+\n`);
    hasErrors = true;
}

// Check 2: node_modules
console.log('2️⃣  Checking dependencies...');
if (fs.existsSync(path.join(__dirname, 'node_modules'))) {
    console.log('   ✅ node_modules folder exists\n');
} else {
    console.log('   ❌ node_modules not found - Run: npm install\n');
    hasErrors = true;
}

// Check 3: Environment file
console.log('3️⃣  Checking environment variables...');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    console.log('   ✅ .env file exists');
    
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const requiredVars = [
        'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
        'CLERK_SECRET_KEY',
        'SIGNING_SECRET',
        'MONGODB_URI',
        'GROQ_API_KEY'
    ];
    
    const optionalVars = [
        'GOOGLE_API_KEY'
    ];
    
    console.log('\n   Required variables:');
    requiredVars.forEach(varName => {
        const regex = new RegExp(`^${varName}=.+`, 'm');
        if (regex.test(envContent) && !envContent.includes(`${varName}=your_`)) {
            console.log(`   ✅ ${varName}`);
        } else {
            console.log(`   ❌ ${varName} - Not configured`);
            hasErrors = true;
        }
    });
    
    console.log('\n   Optional variables:');
    optionalVars.forEach(varName => {
        const regex = new RegExp(`^${varName}=.+`, 'm');
        if (regex.test(envContent) && !envContent.includes(`${varName}=your_`)) {
            console.log(`   ✅ ${varName} (Image processing enabled)`);
        } else {
            console.log(`   ⚠️  ${varName} - Not configured (Image processing disabled)`);
        }
    });
    
    console.log('');
} else {
    console.log('   ❌ .env not found');
    console.log('   📝 Run: cp .env.example .env\n');
    hasErrors = true;
}

// Check 4: Key directories
console.log('4️⃣  Checking project structure...');
const requiredDirs = ['app', 'components', 'models', 'config', 'context'];
let dirCheck = true;
requiredDirs.forEach(dir => {
    if (fs.existsSync(path.join(__dirname, dir))) {
        console.log(`   ✅ ${dir}/`);
    } else {
        console.log(`   ❌ ${dir}/ - Missing`);
        dirCheck = false;
        hasErrors = true;
    }
});
if (dirCheck) console.log('');

// Check 5: package.json
console.log('5️⃣  Checking package.json...');
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    const requiredDeps = [
        'next',
        'react',
        'mongoose',
        '@clerk/nextjs',
        'openai',
        '@google/generative-ai'
    ];
    
    let depsOk = true;
    requiredDeps.forEach(dep => {
        if (pkg.dependencies && pkg.dependencies[dep]) {
            console.log(`   ✅ ${dep}`);
        } else {
            console.log(`   ❌ ${dep} - Missing`);
            depsOk = false;
            hasErrors = true;
        }
    });
    
    if (depsOk) console.log('');
} else {
    console.log('   ❌ package.json not found\n');
    hasErrors = true;
}

// Final result
console.log('━'.repeat(50));
if (hasErrors) {
    console.log('\n❌ Setup incomplete! Please fix the issues above.');
    console.log('📖 See SETUP.md for detailed instructions\n');
    process.exit(1);
} else {
    console.log('\n✅ All checks passed! Your setup looks good.');
    console.log('🚀 Run: npm run dev');
    console.log('🌐 Open: http://localhost:3000\n');
    process.exit(0);
}
