const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

async function runTestSuite() {
  console.log("==================================================");
  console.log("   KAMPALA DIGITAL PATHWAYS - INTERACTION SUITE   ");
  console.log("==================================================\n");

  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  const dom = new JSDOM(html, {
    url: "http://localhost:8080/",
    runScripts: "dangerously",
    pretendToBeVisual: true
  });

  const { window } = dom;
  const { document, localStorage } = window;

  // Let DOMContentLoaded and initialization scripts execute
  await new Promise(r => setTimeout(r, 200));

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName} ${details ? '(' + details + ')' : ''}`);
      failed++;
    }
  }

  // --- 1. Navigation Links & Sections ---
  console.log("--- 1. Testing Navigation Links & Sections ---");
  const navLinks = document.querySelectorAll('.nav-menu .nav-link');
  assert(navLinks.length >= 6, `Navigation links exist (found ${navLinks.length})`);

  const expectedSections = ['home', 'quiz', 'dashboard', 'learn', 'videos', 'opportunities', 'careers', 'safety', 'about'];
  expectedSections.forEach(secId => {
    const secEl = document.getElementById(secId);
    assert(secEl !== null, `Section #${secId} is present in document`);
    const link = document.querySelector(`.nav-link[href="#${secId}"]`);
    if (link) {
      assert(link !== null, `Navigation link for #${secId} exists`);
    }
  });

  // --- 2. Theme Switcher (Dark / Light Mode) ---
  console.log("\n--- 2. Testing Theme Switcher (Dark / Light Mode) ---");
  const themeBtn = document.getElementById('theme-toggle');
  assert(themeBtn !== null, "Theme toggle button exists in header");

  const initialTheme = document.documentElement.getAttribute('data-theme');
  assert(initialTheme === 'light', `Initial theme is 'light' (got: ${initialTheme})`);

  // Click to switch to Dark Mode
  themeBtn.click();
  const darkTheme = document.documentElement.getAttribute('data-theme');
  const darkBtnText = themeBtn.textContent.trim();
  const savedDarkTheme = localStorage.getItem('kdp_theme');
  const logoSrcDark = document.querySelector('img.logo-icon').getAttribute('src');

  assert(darkTheme === 'dark', "HTML attribute data-theme switches to 'dark'");
  assert(darkBtnText === '☀️', "Theme button icon switches to Sun ('☀️')");
  assert(savedDarkTheme === 'dark', "Theme preference 'dark' saved to localStorage");
  assert(logoSrcDark.includes('logo-dark.svg'), "Logo dynamically updates to logo-dark.svg");

  // Click to switch back to Light Mode
  themeBtn.click();
  const lightTheme = document.documentElement.getAttribute('data-theme');
  const lightBtnText = themeBtn.textContent.trim();
  const savedLightTheme = localStorage.getItem('kdp_theme');
  const logoSrcLight = document.querySelector('img.logo-icon').getAttribute('src');

  assert(lightTheme === 'light', "HTML attribute data-theme switches back to 'light'");
  assert(lightBtnText === '🌙', "Theme button icon switches to Moon ('🌙')");
  assert(savedLightTheme === 'light', "Theme preference 'light' saved to localStorage");
  assert(logoSrcLight.includes('logo-light.svg'), "Logo dynamically updates to logo-light.svg");

  // --- 3. Interactive Career Matcher Quiz Flow ---
  console.log("\n--- 3. Testing Interactive Career Matcher Quiz Flow ---");
  const step1 = document.querySelector('.quiz-step[data-step="1"]');
  const step2 = document.querySelector('.quiz-step[data-step="2"]');
  const step3 = document.querySelector('.quiz-step[data-step="3"]');
  const quizResult = document.getElementById('quiz-result');
  const quizResTitle = document.getElementById('quiz-res-title');
  const quizResDesc = document.getElementById('quiz-res-desc');
  const quizRetakeBtn = document.getElementById('quiz-retake-btn');

  assert(step1 && step1.classList.contains('active'), "Quiz Step 1 is initially active");
  assert(step2 && !step2.classList.contains('active'), "Quiz Step 2 is initially inactive");
  assert(step3 && !step3.classList.contains('active'), "Quiz Step 3 is initially inactive");

  const step1Next = step1.querySelector('.quiz-next-btn');
  assert(step1Next.hasAttribute('disabled'), "Step 1 Next button is initially disabled");

  // Select option in Step 1
  const step1WebCard = step1.querySelector('.quiz-option-card[data-val="web"]');
  step1WebCard.click();
  assert(step1WebCard.classList.contains('selected'), "Step 1 'web' card is selected");
  assert(!step1Next.hasAttribute('disabled'), "Step 1 Next button is enabled after selection");

  // Advance to Step 2
  step1Next.click();
  assert(!step1.classList.contains('active'), "Step 1 is hidden");
  assert(step2.classList.contains('active'), "Step 2 is active");

  // Select option in Step 2
  const step2Card = step2.querySelector('.quiz-option-card[data-val="build"]');
  step2Card.click();
  const step2Next = step2.querySelector('.quiz-next-btn');
  assert(!step2Next.hasAttribute('disabled'), "Step 2 Next button enabled after selection");

  // Advance to Step 3
  step2Next.click();
  assert(!step2.classList.contains('active'), "Step 2 is hidden");
  assert(step3.classList.contains('active'), "Step 3 is active");

  // Select option in Step 3
  const step3Card = step3.querySelector('.quiz-option-card[data-val="freelance"]');
  step3Card.click();
  const step3Finish = step3.querySelector('.quiz-finish-btn');
  assert(!step3Finish.hasAttribute('disabled'), "Step 3 Finish button enabled after selection");

  // Finish Quiz
  step3Finish.click();
  assert(quizResult.style.display === 'block', "Quiz results card is revealed");
  assert(quizResTitle.textContent.includes('Junior Web'), `Result title matches Web track: "${quizResTitle.textContent}"`);
  assert(quizResDesc.textContent.length > 20, "Result description is populated");

  // Test Retake Quiz
  quizRetakeBtn.click();
  assert(quizResult.style.display === 'none', "Quiz results hidden on retake");
  assert(step1.classList.contains('active'), "Step 1 reactivated on retake");
  assert(!step1WebCard.classList.contains('selected'), "Step 1 cards deselected on retake");
  assert(step1.querySelector('.quiz-next-btn').hasAttribute('disabled'), "Next button reset to disabled");

  // --- 4. Opportunity Category Filters & Instant Search ---
  console.log("\n--- 4. Testing Opportunity Filters & Instant Search ---");
  const oppCards = document.querySelectorAll('.opp-card');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('opp-search-input');
  const clearSearchBtn = document.getElementById('clear-opp-search');
  const noResultsBox = document.getElementById('opp-no-results');

  assert(oppCards.length >= 5, `Opportunity cards loaded (${oppCards.length} cards found)`);
  assert(filterBtns.length >= 4, `Category filter buttons exist (${filterBtns.length} buttons)`);
  assert(searchInput !== null, "Opportunity search input exists");

  // Helper to count visible cards
  function getVisibleCardsCount() {
    return Array.from(oppCards).filter(c => c.style.display !== 'none').length;
  }

  assert(getVisibleCardsCount() === oppCards.length, `Initially all ${oppCards.length} cards visible`);

  // Filter by 'free'
  const freeFilterBtn = document.querySelector('.filter-btn[data-filter="free"]');
  freeFilterBtn.click();
  const freeCount = getVisibleCardsCount();
  assert(freeCount > 0 && freeCount < oppCards.length, `Filter '100% Free' correctly filters cards (${freeCount} visible)`);

  // Filter by 'laptop'
  const laptopFilterBtn = document.querySelector('.filter-btn[data-filter="laptop"]');
  laptopFilterBtn.click();
  const laptopCount = getVisibleCardsCount();
  assert(laptopCount === 1, `Filter 'Requires Laptop' filters to 1 hub (got: ${laptopCount})`);

  // Reset to 'all'
  const allFilterBtn = document.querySelector('.filter-btn[data-filter="all"]');
  allFilterBtn.click();
  assert(getVisibleCardsCount() === oppCards.length, "Filter 'All Programs' restores all cards");

  // Instant Search by keyword
  searchInput.value = 'kabalagala';
  searchInput.dispatchEvent(new window.Event('input'));
  const kabalagalaCount = getVisibleCardsCount();
  assert(kabalagalaCount === 2, `Search 'kabalagala' finds 2 matching cards (got: ${kabalagalaCount})`);
  assert(clearSearchBtn.style.display === 'block', "Clear search '✕' button becomes visible");

  // Search by keyword 'nakawa'
  searchInput.value = 'nakawa';
  searchInput.dispatchEvent(new window.Event('input'));
  const nakawaCount = getVisibleCardsCount();
  assert(nakawaCount === 1, `Search 'nakawa' finds UICT Nakawa (got: ${nakawaCount})`);

  // Search non-existent term
  searchInput.value = 'QuantumComputingHubXYZ';
  searchInput.dispatchEvent(new window.Event('input'));
  assert(getVisibleCardsCount() === 0, "Non-existent search term yields 0 cards");
  assert(noResultsBox.style.display === 'block', "'No matching opportunities' empty-state banner is displayed");

  // Click Clear Search button
  clearSearchBtn.click();
  assert(searchInput.value === '', "Search input cleared by clear button");
  assert(getVisibleCardsCount() === oppCards.length, "All cards restored after clearing search");
  assert(noResultsBox.style.display === 'none', "Empty-state banner hidden after clearing");

  // --- 5. Interactive Collapsible FAQ Accordion ---
  console.log("\n--- 5. Testing FAQ Accordion ---");
  const faqItems = document.querySelectorAll('.faq-item');
  const faqQuestions = document.querySelectorAll('.faq-question');
  assert(faqItems.length >= 4, `FAQ items exist (found ${faqItems.length})`);
  assert(faqItems[0].classList.contains('active'), "FAQ Item 1 is active/expanded by default");

  // Click Question 2 to expand it
  faqQuestions[1].click();
  assert(faqItems[1].classList.contains('active'), "FAQ Item 2 expands when clicked");
  assert(!faqItems[0].classList.contains('active'), "FAQ Item 1 collapses automatically");

  // Click Question 2 again to collapse
  faqQuestions[1].click();
  assert(!faqItems[1].classList.contains('active'), "FAQ Item 2 collapses when clicked again");

  // Click Question 3
  faqQuestions[2].click();
  assert(faqItems[2].classList.contains('active'), "FAQ Item 3 expands");

  // --- 6. User Auth Modal, Learning Progress & Certificate ---
  console.log("\n--- 6. Testing User Auth Modal, Progress & Certificate ---");
  const authModal = document.getElementById('auth-modal');
  const openAuthBtn = document.getElementById('open-auth-btn');
  const closeAuthBtn = document.getElementById('close-modal-btn');
  const authForm = document.getElementById('auth-form');
  const nameInput = document.getElementById('auth-name');
  const emailInput = document.getElementById('auth-email');
  const userBadge = document.getElementById('user-profile-badge');
  const userInitials = document.getElementById('user-avatar-initials');

  openAuthBtn.click();
  assert(authModal.classList.contains('active'), "Auth modal opens on button click");

  closeAuthBtn.click();
  assert(!authModal.classList.contains('active'), "Auth modal closes on close button click");

  // Submit Registration
  nameInput.value = 'Sarah Namubiru';
  emailInput.value = 'sarah@example.com';
  authForm.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));

  assert(userBadge.style.display === 'flex', "User badge appears in header");
  assert(userInitials.textContent === 'S', "User initials display 'S'");
  const savedUser = JSON.parse(localStorage.getItem('kdp_user'));
  assert(savedUser && savedUser.name === 'Sarah Namubiru', "User data saved to localStorage");

  // Learning Checklist progress
  const checkboxes = document.querySelectorAll('.task-checkbox');
  const progressBar = document.getElementById('progress-bar');
  const progressPercent = document.getElementById('progress-percent');
  const certBanner = document.getElementById('cert-unlock-banner');

  assert(checkboxes.length === 14, `Found 14 learning tasks (got: ${checkboxes.length})`);

  // Check first 7 tasks (50%)
  for (let i = 0; i < 7; i++) {
    checkboxes[i].checked = true;
    checkboxes[i].dispatchEvent(new window.Event('change'));
  }
  assert(progressPercent.textContent === '50%', `Progress reaches 50% (got: ${progressPercent.textContent})`);
  assert(certBanner.style.display === 'none', "Certificate remains locked at 50%");

  // Check all 14 tasks (100%)
  checkboxes.forEach(cb => {
    cb.checked = true;
    cb.dispatchEvent(new window.Event('change'));
  });
  assert(progressPercent.textContent === '100%', "Progress reaches 100%");
  assert(certBanner.style.display === 'flex', "Certificate banner unlocks at 100% completion!");

  // Certificate modal
  const openCertBtn = document.getElementById('open-cert-btn');
  const certModal = document.getElementById('cert-modal');
  const certDisplayName = document.getElementById('cert-display-name');

  openCertBtn.click();
  assert(certModal.classList.contains('active'), "Certificate modal opens");
  assert(certDisplayName.textContent === 'Sarah Namubiru', "Certificate displays student name 'Sarah Namubiru'");

  // Test Escape key close
  document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));
  assert(!certModal.classList.contains('active'), "Modal closes on Escape key press");

  // --- Summary ---
  console.log("\n==================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error("Test execution error:", err);
  process.exit(1);
});
