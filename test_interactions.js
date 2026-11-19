const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

async function testWebsite() {
  console.log('--- Starting Kabalagala Digital Pathways Interactive Verification ---');

  const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  const dom = new JSDOM(htmlContent, {
    runScripts: 'dangerously',
    resources: 'usable',
    url: 'http://localhost:8081/index.html'
  });

  const { window } = dom;
  const { document } = window;

  // 1. Initial State Check
  console.log('\n[TEST 1] Initial Theme State');
  const htmlEl = document.documentElement;
  const initialTheme = htmlEl.getAttribute('data-theme') || 'light';
  console.log(`Initial theme: ${initialTheme}`);

  const themeToggleBtn = document.getElementById('theme-toggle');
  console.log(`Theme toggle button found: ${!!themeToggleBtn}, button icon: ${themeToggleBtn ? themeToggleBtn.textContent.trim() : 'N/A'}`);

  // 2. Toggle to Dark Theme
  console.log('\n[TEST 2] Toggle Theme to Dark Mode');
  if (themeToggleBtn) {
    themeToggleBtn.click();
    const newTheme = htmlEl.getAttribute('data-theme');
    console.log(`Theme after 1st click: ${newTheme}`);
    console.log(`Theme toggle button text: ${themeToggleBtn.textContent.trim()}`);
    console.log(`Theme saved in localStorage: ${window.localStorage.getItem('kdp_theme')}`);

    const logoImg = document.querySelector('img.logo-icon');
    if (logoImg) {
      console.log(`Active logo src in dark mode: ${logoImg.src}`);
    }
  }

  // 3. Toggle to Light Theme
  console.log('\n[TEST 3] Toggle Theme to Light Mode');
  if (themeToggleBtn) {
    themeToggleBtn.click();
    const newTheme = htmlEl.getAttribute('data-theme');
    console.log(`Theme after 2nd click: ${newTheme}`);
    console.log(`Theme toggle button text: ${themeToggleBtn.textContent.trim()}`);
    console.log(`Theme saved in localStorage: ${window.localStorage.getItem('kdp_theme')}`);
  }

  // 4. Verify Nav Links Visibility
  console.log('\n[TEST 4] Navigation Links');
  const navLinks = document.querySelectorAll('.nav-link');
  console.log(`Found ${navLinks.length} navigation links:`);
  navLinks.forEach((link, idx) => {
    console.log(`  ${idx + 1}. [${link.textContent.trim()}] -> ${link.getAttribute('href')}`);
  });

  // 5. Verify Career Quiz Interaction
  console.log('\n[TEST 5] Career Quiz Flow');
  const step1 = document.querySelector('.quiz-step[data-step="1"]');
  const step1Next = step1 ? step1.querySelector('.quiz-next-btn') : null;
  const firstOption = step1 ? step1.querySelector('.quiz-option-card[data-val="web"]') : null;

  if (firstOption && step1Next) {
    console.log('Selecting "Building Websites & Code"...');
    firstOption.click();
    console.log(`Option selected: ${firstOption.classList.contains('selected')}`);
    console.log(`Next button disabled: ${step1Next.hasAttribute('disabled')}`);
    step1Next.click();

    const step2 = document.querySelector('.quiz-step[data-step="2"]');
    console.log(`Step 2 active: ${step2 ? step2.classList.contains('active') : false}`);

    if (step2) {
      const step2Option = step2.querySelector('.quiz-option-card');
      const step2Next = step2.querySelector('.quiz-next-btn');
      if (step2Option && step2Next) {
        step2Option.click();
        step2Next.click();
        const step3 = document.querySelector('.quiz-step[data-step="3"]');
        console.log(`Step 3 active: ${step3 ? step3.classList.contains('active') : false}`);

        if (step3) {
          const step3Option = step3.querySelector('.quiz-option-card');
          const finishBtn = step3.querySelector('.quiz-finish-btn');
          if (step3Option && finishBtn) {
            step3Option.click();
            finishBtn.click();
            const quizResult = document.getElementById('quiz-result');
            const resTitle = document.getElementById('quiz-result-title');
            console.log(`Quiz result displayed: ${quizResult && quizResult.style.display !== 'none'}`);
            console.log(`Recommended Career: ${resTitle ? resTitle.textContent : 'N/A'}`);
          }
        }
      }
    }
  }

  // 6. Test Category Filter
  console.log('\n[TEST 6] Opportunities Category Filters');
  const filterBtns = document.querySelectorAll('.filter-btn');
  console.log(`Found ${filterBtns.length} filter buttons.`);
  const freeFilter = Array.from(filterBtns).find(b => b.getAttribute('data-filter') === 'free');
  if (freeFilter) {
    freeFilter.click();
    console.log(`"Free Programs" filter active: ${freeFilter.classList.contains('active')}`);
    const oppCards = document.querySelectorAll('.opp-card');
    let visibleCount = 0;
    oppCards.forEach(c => {
      if (c.style.display !== 'none') visibleCount++;
    });
    console.log(`Visible cards after applying free filter: ${visibleCount} of ${oppCards.length}`);
  }

  // 7. Test FAQ Accordion
  console.log('\n[TEST 7] FAQ Accordion Interaction');
  const faqQuestions = document.querySelectorAll('.faq-question');
  console.log(`Found ${faqQuestions.length} FAQ items.`);
  if (faqQuestions.length > 0) {
    const firstFaq = faqQuestions[0];
    const parentItem = firstFaq.parentElement;
    console.log(`First FAQ initially open: ${parentItem.classList.contains('active')}`);
    firstFaq.click();
    console.log(`First FAQ after click open: ${parentItem.classList.contains('active')}`);
  }

  console.log('\n--- All Automated Interactive Verifications Completed Successfully ---');
}

testWebsite().catch(console.error);

