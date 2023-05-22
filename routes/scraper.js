const express = require('express');
const router = express.Router();
const fs = require('fs');
const puppeteer = require('puppeteer');

const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

router.post('/', async (req, res, next) => {

    const {urlScrape}=req.body
    try {
        const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: false,
            userDataDir: "./tmp",
        });
        const page = await browser.newPage();

        await page.goto(urlScrape);

        let isLastPage = false;
        while (!isLastPage) {
            await page.waitForSelector('[data-cel-widget="search_result_0"]');
            const productsHandles = await page.$$('div.s-main-slot.s-result-list.s-search-results.sg-row > .s-result-item');

            for (const producthandle of productsHandles) {
                let title = "Null";
                let price = "Null";
                let img = "Null";

                // Title
                try {
                    const titleElement = await producthandle.$('h2 > a > span');
                    if (titleElement) {
                        title = await titleElement.evaluate(el => el.textContent);
                        console.log(title);
                    } else {
                        console.log('Title element not found for this product');
                    }
                } catch (error) {}

                // Price
                try {
                    const priceElement = await producthandle.$('.a-price > .a-offscreen');
                    if (priceElement) {
                        price = await priceElement.evaluate(el => el.textContent);
                        console.log(price);
                    } else {
                        console.log('Price element not found for this product');
                    }
                } catch (error) {}

                // Image
                try {
                    const imgElement = await producthandle.$('.s-image');
                    if (imgElement) {
                        img = await imgElement.evaluate(el => el.getAttribute("src"));
                        console.log(img);
                    } else {
                        console.log('Image element not found for this product');
                    }
                } catch (error) {}

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

            const nextButton = await page.$("ul.a-pagination > li.a-last > a");
            if (nextButton) {
                await Promise.all([
                    page.evaluate((btn) => btn.click(), nextButton),
                    page.waitForNavigation({ waitUntil: "networkidle2" }),
                ]);
            } else {
                isLastPage = true;
            }
        }

        await browser.close();

        res.status(200).json({
            status: true,
            message: 'Scraping completed successfully.',
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
