const { App } = require("@slack/bolt");
const puppeteer = require("puppeteer");
require('dotenv').config();


const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET
});

async function monitorPageSpeed(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    const performance = JSON.parse(
        await page.evaluate(() => JSON.stringify(window.performance))
    );

    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    const pageSize = (await page.content()).length / 1024; 

    await browser.close();

    return { loadTime, pageSize };
}

app.message('monitor', async ({ message, say }) => {
    const url = message.text.split(' ').slice(1).join(' ');
    const { loadTime, pageSize } = await monitorPageSpeed(url);
    await say(`Page Speed Monitoring for ${url}: Load Time: ${loadTime} ms Page Size: ${pageSize.toFixed(2)} KB`); 
});

(async () => {
    await app.start(process.env.PORT || 3000);
    console.log('Bolt app is running'); 
})();
