const express = require('express');
const router = express.Router();
const fs = require('fs');
const puppeteer = require('puppeteer');
const {connectDB}=require('../configurations')

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
                const product ={
                    title:"" , price:"" , img:""
                }
                // Title
                try {
                    const titleElement = await producthandle.$('h2 > a > span');
                    if (titleElement) {
                        product.title = await titleElement.evaluate(el => el.textContent);
                        console.log(product.title);
                    } else {
                        console.log('Title element not found for this product');
                    }
                } catch (error) {}

                // Price
                try {
                    const priceElement = await producthandle.$('.a-price > .a-offscreen');
                    if (priceElement) {
                        product.price = await priceElement.evaluate(el => el.textContent);
                        console.log(product.price);
                    } else {
                        console.log('Price element not found for this product');
                    }
                } catch (error) {}

                // Image
                try {
                    const imgElement = await producthandle.$('.s-image');
                    if (imgElement) {
                        product.img = await imgElement.evaluate(el => el.getAttribute("src"));
                        console.log(product.img);
                    } else {
                        console.log('Image element not found for this product');
                    }
                    
                } catch (error) {}

                if (product.title !== "Null") {
                  // connectDB('products', async (db) => {
                  //   await db.insertOne(product);
                  //   console.log('Product inserted:', product);
                  // });
                  
                    // fs.appendFile(
                    //     'results.csv',
                    //     `${product.title.replace(/,/g, ".")},${product.price},${product.img}\n`,
                    //     function (err) {
                    //         if (err) throw err;
                    //     }
                    // );
                    connectDB(async(db)=>{
                        
                        const item =await db.collection('products').insertOne(product)
                        console.log(item,product)               
                    }).then(data=> console.log(data)).catch(err=>console.log('err',err))
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
