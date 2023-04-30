const puppeteer = require ('puppeteer');
(async () => {
const browser = await puppeteer.launch ({
    headless: false,
    defaultViewport: false,
    userDataDir: "./tmp",
}
);
const page = await browser. newPage ( );
await page.goto('https://www.amazon.com/b?node=16225016011&pf_rd_r=VQ9XYNPSETETN3JVEBRB&pf_rd_p=e5b0c85f-569c-4c90-a58f-0c0a260e45a0&pd_rd_r=3e40c258-be16-4132-a779-92037460e858&pd_rd_w=OHk7Y&pd_rd_wg=nTsU5&ref_=pd_gw_unk'); 

// await browser.close();
})();