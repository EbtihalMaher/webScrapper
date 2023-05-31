const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');
const { connectDB } = require('../configurations');

const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

router.post('/', async (req, res, next) => {
    const { name, urlScrape, _id } = req.body;

    const web = {
        name,
        urlScrape,
        _id,
    };

    connectDB(async (db) => {
        const itemWeb = await db.collection('webs').insertOne(web);
        console.log('Inserted web ID:', itemWeb.insertedId);
        web._id = itemWeb.insertedId;
    })
        .then((data) => console.log(data))
        .catch((err) => console.log('err', err));

    try {
        const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: false,
            userDataDir: './tmp',
        });
        const page = await browser.newPage();

        await page.goto(urlScrape);

        let isLastPage = false;
        while (!isLastPage) {
            try {
                await page.waitForSelector('[data-cel-widget="search_result_0"]', {
                    timeout: 60000,
                });
            } catch (error) {
                console.error('Failed to locate the element. Retrying...');
                await page.waitForTimeout(2000);
                // Retry the operation
            }
            const productsHandles = await page.$$(
                'div.s-main-slot.s-result-list.s-search-results.sg-row > .s-result-item'
            );

            for (const producthandle of productsHandles) {
                const product = {
                    title: '',
                    price: '',
                    img: '',
                    webId: web._id,
                };
                // Title
                try {
                    const titleElement = await producthandle.$('h2 > a > span');
                    if (titleElement) {
                        product.title = await titleElement.evaluate(
                            (el) => el.textContent
                        );
                        console.log(product.title);
                    } else {
                        console.log('Title element not found for this product');
                    }
                } catch (error) { }

                // Price
                try {
                    const priceElement = await producthandle.$('.a-price > .a-offscreen');
                    if (priceElement) {
                        product.price = await priceElement.evaluate(
                            (el) => el.textContent
                        );
                        console.log(product.price);
                    } else {
                        console.log('Price element not found for this product');
                    }
                } catch (error) { }

                // Image
                try {
                    const imgElement = await producthandle.$('.s-image');
                    if (imgElement) {
                        product.img = await imgElement.evaluate((el) =>
                            el.getAttribute('src')
                        );
                        console.log(product.img);
                    } else {
                        console.log('Image element not found for this product');
                    }
                } catch (error) { }

                if (product.title !== 'Null') {
                    connectDB(async (db) => {
                        const item = await db.collection('products').insertOne(product);
                        console.log(item, product);
                    })
                        .then((data) => console.log(data))
                        .catch((err) => console.log('err', err));
                }
            }

            const nextButton = await page.$("ul.a-pagination > li.a-last > a");
            if (nextButton) {
                await Promise.all([
                    page.evaluate((btn) => btn.click(), nextButton),
                    page.waitForNavigation({ waitUntil: 'networkidle2' }),
                ]);
            } else {
                isLastPage = true;
            }
        }

        await browser.close();

        res.status(200).json({
            status: true,
            webId: web._id, // Include the webId in the response
            message: 'Scraping completed successfully.',
        });
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    const webId = req.params.id;

    try {
        connectDB(async (db) => {
            const products = await db
                .collection('products')
                .find({ webId: webId.toString() })
                .toArray();
            console.log(products); // Check if products are retrieved correctly
            res.status(200).json({
                status: true,
                products,
            });
        });
    } catch (error) {
        next(error);
    }
});


module.exports = router;
