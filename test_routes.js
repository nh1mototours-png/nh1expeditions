const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8000/routes.html', {waitUntil: 'networkidle0'});
  const visibility = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.route-card'));
    return cards.map(c => ({
      classes: c.className,
      opacity: window.getComputedStyle(c).opacity,
      display: window.getComputedStyle(c).display,
      height: c.getBoundingClientRect().height
    }));
  });
  console.log(JSON.stringify(visibility, null, 2));
  await browser.close();
})();
