const fs = require("fs");
const puppeteer = require ('puppeteer');

const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

(async () => {
    const browser = await puppeteer.launch ({
        headless: false,
        defaultViewport: false,
        userDataDir: "./tmp",
    }
    );
    const page = await browser. newPage( );
    await page.goto('https://www.amazon.com/s?i=computers-intl-ship&bbn=16225007011&rh=n%3A16225007011%2Cn%3A11036071%2Cp_36%3A1253503011&dc&fs=true&qid=1635596580&rnid=16225007011&ref=sr_pg_1'); 

    // const productsHandles = await page.$$('div.s-main-slot.s-result-list.s-search-results.sg-row > .s-result-item')

    // for (const producthandle of productsHandles){

    //     const title = await page.evaluate (el => el.querySelector("h2 > a > span").textContent, producthandle)
    //     console.log(title)
    // }

    let isBtnDisabled = false;
    while (!isBtnDisabled) {
        await page.waitForSelector('[data-cel-widget="search_result_0"]');
        const productsHandles = await page.$$('div.s-main-slot.s-result-list.s-search-results.sg-row > .s-result-item');
        
        for (const producthandle of productsHandles) {
            let title = "Null";
            let price = "Null";
            let img = "Null";

            //title
            try {
            const titleElement = await producthandle.$('h2 > a > span');
            if (titleElement) {
                title = await titleElement.evaluate(el => el.textContent);
                console.log(title);
            } else {
                console.log('Title element not found for this product');
            }
            }catch (error) {}

            //price
            try {
                const priceElement = await producthandle.$('.a-price > .a-offscreen');
                if (priceElement) {
                    price = await priceElement.evaluate(el => el.textContent);
                    console.log(price);
                } else {
                    console.log('Price element not found for this product');
                }
            }catch (error) {}

            //img
            try {
                const imgElement = await producthandle.$('.s-image');
                if (imgElement) {
                    img = await imgElement.evaluate(el => el.getAttribute("src"));
                    console.log(img);
                } else {
                    console.log('Image element not found for this product');
                }
            }catch (error) {}

            if (title !== "Null") {
                fs.appendFile(
                    'results.csv',
                    `${title.replace(/,/g, ".")},${price},${img}\n`,
                    function (err) {
                    if (err) throw err;
                    }
                );
            }

        }
        await page.waitForSelector('svg[aria-disabled="true"]', { visible: true , timeout: 120000});
        const is_disabled = (await page.$('svg[focusable="false"]')) !== null;
        isBtnDisabled = is_disabled;
        if (!is_disabled) {
            await Promise.all([
            page.click('svg[focusable="false"]'),
            page.waitForNavigation({ waitUntil: "networkidle2" }),
            ]);
        }
        // await page.waitForSelector("span.s-pagination-item.s-pagination-next", { visible: true });
        // const is_disabled = (await page.$("span.s-pagination-item.s-pagination-next.s-pagination-disabled")) !== null;

        // isBtnDisabled = is_disabled;
        // if (!is_disabled) {
        // await Promise.all([
        //     page.click("span.s-pagination-item.s-pagination-next"),
        //     page.waitForNavigation({ waitUntil: "networkidle2" }),
        // ]);
        // }

    }


    // await browser.close();
})();

