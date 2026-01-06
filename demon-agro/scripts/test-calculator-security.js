/**
 * Test script pro ověření zabezpečení kalkulačky
 * 
 * Spustit: node scripts/test-calculator-security.js
 * 
 * Před spuštěním nastavit BASE_URL:
 * - Lokálně: http://localhost:3000
 * - Produkce: https://demonagro.cz
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Barvy pro console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEmailValidation() {
  log('\n📧 Test 1: Validace emailu', 'blue');
  
  const invalidEmails = [
    'a@a',
    'test@',
    '@test.com',
    'test@test',
    'test..test@test.com',
    'test@.com',
    '.test@test.com',
  ];
  
  const validEmails = [
    'uzivatel@example.com',
    'jan.novak@firma.cz',
    'test123@test-domain.co.uk',
  ];
  
  log('Testování neplatných emailů:', 'yellow');
  for (const email of invalidEmails) {
    try {
      const response = await fetch(`${BASE_URL}/api/calculator/check-usage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.status === 400 && data.reason === 'invalid_email') {
        log(`  ✅ ${email} - správně zamítnuto`, 'green');
      } else {
        log(`  ❌ ${email} - CHYBA: mělo být zamítnuto!`, 'red');
      }
    } catch (error) {
      log(`  ❌ ${email} - Chyba: ${error.message}`, 'red');
    }
  }
  
  log('\nTestování platných emailů:', 'yellow');
  for (const email of validEmails) {
    try {
      const response = await fetch(`${BASE_URL}/api/calculator/check-usage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        log(`  ✅ ${email} - správně přijato`, 'green');
      } else {
        log(`  ❌ ${email} - CHYBA: mělo být přijato! (${data.message})`, 'red');
      }
    } catch (error) {
      log(`  ❌ ${email} - Chyba: ${error.message}`, 'red');
    }
  }
}

async function testEmailRestriction() {
  log('\n🔒 Test 2: Omezení podle emailu', 'blue');
  
  const testEmail = `test-${Date.now()}@example.com`;
  
  log(`Používám testovací email: ${testEmail}`, 'yellow');
  
  // První použití - mělo by projít
  try {
    const response1 = await fetch(`${BASE_URL}/api/calculator/check-usage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });
    
    const data1 = await response1.json();
    
    if (data1.allowed) {
      log('  ✅ První použití - povoleno', 'green');
      
      // Zaznamenat použití
      await fetch(`${BASE_URL}/api/calculator/record-usage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: testEmail,
          calculationData: { test: true }
        }),
      });
      
      log('  ✅ Použití zaznamenáno', 'green');
      
      // Druhé použití - mělo by být zamítnuto
      const response2 = await fetch(`${BASE_URL}/api/calculator/check-usage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail }),
      });
      
      const data2 = await response2.json();
      
      if (!data2.allowed && data2.reason === 'email_used') {
        log('  ✅ Druhé použití - správně zamítnuto', 'green');
      } else {
        log('  ❌ Druhé použití - CHYBA: mělo být zamítnuto!', 'red');
      }
    } else {
      log('  ❌ První použití - CHYBA: mělo být povoleno!', 'red');
    }
  } catch (error) {
    log(`  ❌ Chyba: ${error.message}`, 'red');
  }
}

async function testRateLimiting() {
  log('\n⏱️  Test 3: Rate limiting podle IP', 'blue');
  log('  ⚠️  Tento test vyžaduje 3+ požadavky z jedné IP', 'yellow');
  log('  ⚠️  Může ovlivnit další testy - spouštět samostatně!', 'yellow');
  
  const emails = [
    `test-rate1-${Date.now()}@example.com`,
    `test-rate2-${Date.now()}@example.com`,
    `test-rate3-${Date.now()}@example.com`,
    `test-rate4-${Date.now()}@example.com`,
  ];
  
  for (let i = 0; i < emails.length; i++) {
    try {
      // Check
      const checkResponse = await fetch(`${BASE_URL}/api/calculator/check-usage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emails[i] }),
      });
      
      const checkData = await checkResponse.json();
      
      if (i < 3) {
        // První 3 by měly projít
        if (checkData.allowed) {
          log(`  ✅ Požadavek ${i + 1}/4 - povolen`, 'green');
          
          // Record
          await fetch(`${BASE_URL}/api/calculator/record-usage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              email: emails[i],
              calculationData: { test: true }
            }),
          });
        } else {
          log(`  ❌ Požadavek ${i + 1}/4 - CHYBA: měl být povolen!`, 'red');
        }
      } else {
        // 4. by měl být zamítnut
        if (!checkData.allowed && checkData.reason === 'rate_limit') {
          log(`  ✅ Požadavek ${i + 1}/4 - správně zamítnut (rate limit)`, 'green');
        } else {
          log(`  ❌ Požadavek ${i + 1}/4 - CHYBA: měl být zamítnut!`, 'red');
        }
      }
    } catch (error) {
      log(`  ❌ Požadavek ${i + 1}/4 - Chyba: ${error.message}`, 'red');
    }
  }
}

async function testAPIAvailability() {
  log('\n🌐 Test 0: Dostupnost API', 'blue');
  
  try {
    const response = await fetch(`${BASE_URL}/api/calculator/check-usage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }),
    });
    
    if (response.ok || response.status === 400) {
      log('  ✅ API endpoint je dostupný', 'green');
      return true;
    } else {
      log(`  ❌ API endpoint vrátil neočekávaný status: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`  ❌ API endpoint není dostupný: ${error.message}`, 'red');
    log(`  ℹ️  Ujistěte se, že aplikace běží na ${BASE_URL}`, 'yellow');
    return false;
  }
}

async function runAllTests() {
  log('═══════════════════════════════════════════════════════', 'blue');
  log('  🧪 Test zabezpečení kalkulačky', 'blue');
  log('═══════════════════════════════════════════════════════', 'blue');
  log(`\n🌐 Testování na: ${BASE_URL}\n`);
  
  const isAvailable = await testAPIAvailability();
  
  if (!isAvailable) {
    log('\n❌ API není dostupné. Ukončuji testy.', 'red');
    process.exit(1);
  }
  
  await testEmailValidation();
  await testEmailRestriction();
  
  log('\n⚠️  Chcete spustit test rate limiting? (ovlivní další testy)', 'yellow');
  log('   Pro spuštění přidejte parametr: --rate-limit', 'yellow');
  
  if (process.argv.includes('--rate-limit')) {
    await testRateLimiting();
  }
  
  log('\n═══════════════════════════════════════════════════════', 'blue');
  log('  ✅ Testy dokončeny', 'blue');
  log('═══════════════════════════════════════════════════════', 'blue');
}

// Spustit testy
runAllTests().catch(error => {
  log(`\n❌ Kritická chyba: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

