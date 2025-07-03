/**
 * Diagnostic script to detect file encoding issues and invisible characters
 * that might be causing JSX syntax errors
 */

const fs = require('fs');
const path = require('path');

// File to diagnose
const targetFile = path.join(__dirname, '..', 'app', 'dashboard', '[teamId]', 'inventory', 'purchasing', 'purchase-order', 'page.tsx');

console.log('🔍 Diagnosing file encoding issues...');
console.log('Target file:', targetFile);
console.log('=' .repeat(60));

try {
  // Check if file exists
  if (!fs.existsSync(targetFile)) {
    console.log('❌ File does not exist:', targetFile);
    process.exit(1);
  }

  // Read file as buffer to check for BOM and invisible characters
  const buffer = fs.readFileSync(targetFile);
  const content = fs.readFileSync(targetFile, 'utf8');
  
  console.log('📊 File Statistics:');
  console.log('- File size (bytes):', buffer.length);
  console.log('- Content length (chars):', content.length);
  console.log('- Encoding detected:', buffer.length === Buffer.byteLength(content, 'utf8') ? 'UTF-8' : 'Non-UTF-8');
  
  // Check for BOM (Byte Order Mark)
  console.log('\n🔍 BOM Detection:');
  if (buffer.length >= 3 && buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
    console.log('❌ UTF-8 BOM detected at start of file!');
    console.log('   This can cause JSX parsing issues.');
  } else {
    console.log('✅ No UTF-8 BOM detected');
  }
  
  // Check for other BOMs
  if (buffer.length >= 2) {
    if ((buffer[0] === 0xFF && buffer[1] === 0xFE) || (buffer[0] === 0xFE && buffer[1] === 0xFF)) {
      console.log('❌ UTF-16 BOM detected!');
    }
  }
  
  // Check for invisible/problematic characters
  console.log('\n🔍 Invisible Character Detection:');
  const lines = content.split('\n');
  let foundIssues = false;
  
  // Common problematic characters
  const problematicChars = {
    '\u200B': 'Zero Width Space',
    '\u200C': 'Zero Width Non-Joiner',
    '\u200D': 'Zero Width Joiner',
    '\u2060': 'Word Joiner',
    '\uFEFF': 'Zero Width No-Break Space (BOM)',
    '\u00A0': 'Non-Breaking Space',
    '\u2028': 'Line Separator',
    '\u2029': 'Paragraph Separator'
  };
  
  lines.forEach((line, lineIndex) => {
    Object.entries(problematicChars).forEach(([char, name]) => {
      if (line.includes(char)) {
        console.log(`❌ Line ${lineIndex + 1}: Found ${name} (${char.charCodeAt(0).toString(16)})`);
        console.log(`   Content: "${line.substring(Math.max(0, line.indexOf(char) - 10), line.indexOf(char) + 10)}"`);
        foundIssues = true;
      }
    });
  });
  
  if (!foundIssues) {
    console.log('✅ No common invisible characters detected');
  }
  
  // Check specific line 38 (the problematic line)
  console.log('\n🎯 Line 38 Analysis:');
  if (lines.length >= 38) {
    const line38 = lines[37]; // 0-indexed
    console.log('Line 38 content:', JSON.stringify(line38));
    console.log('Line 38 length:', line38.length);
    console.log('Line 38 char codes:', line38.split('').map(c => c.charCodeAt(0)).join(', '));
    
    // Check for non-ASCII characters
    const nonAscii = line38.split('').filter(c => c.charCodeAt(0) > 127);
    if (nonAscii.length > 0) {
      console.log('❌ Non-ASCII characters found:', nonAscii.map(c => `${c} (${c.charCodeAt(0)})`));
    } else {
      console.log('✅ All characters are ASCII');
    }
  } else {
    console.log('❌ File has fewer than 38 lines');
  }
  
  // Check for mixed line endings
  console.log('\n🔍 Line Ending Analysis:');
  const crlfCount = (content.match(/\r\n/g) || []).length;
  const lfCount = (content.match(/(?<!\r)\n/g) || []).length;
  const crCount = (content.match(/\r(?!\n)/g) || []).length;
  
  console.log('- CRLF (\\r\\n):', crlfCount);
  console.log('- LF (\\n):', lfCount);
  console.log('- CR (\\r):', crCount);
  
  if (crlfCount > 0 && lfCount > 0) {
    console.log('❌ Mixed line endings detected! This can cause parsing issues.');
  } else {
    console.log('✅ Consistent line endings');
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('🏁 Diagnosis complete!');
  
  if (foundIssues || (crlfCount > 0 && lfCount > 0)) {
    console.log('\n💡 Recommended actions:');
    console.log('1. Remove BOM if present');
    console.log('2. Remove invisible characters');
    console.log('3. Normalize line endings to LF');
    console.log('4. Re-save file with UTF-8 encoding (no BOM)');
  }
  
} catch (error) {
  console.error('❌ Error during diagnosis:', error.message);
  process.exit(1);
}