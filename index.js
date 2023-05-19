const fs = require('fs');
const puppeteer = require('puppeteer');
const { MongoClient } = require('mongodb');
const { default: mongoose } = require('mongoose');
const express = require('express');
const app = express();
const port= 3000;

app.listen(port,() => {
  console.log("server is running at port :" + port)
})

const url="mongodb://localhost:27017/nodeJS";

mongoose.connect(url,{})

const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false,
    userDataDir: './tmp',
  });

  const page = await browser.newPage();
  await page.goto(
    'https://www.amazon.com/s?i=computers-intl-ship&bbn=16225007011&rh=n%3A16225007011%2Cn%3A11036071%2Cp_36%3A1253503011&dc&fs=true&qid=1635596580&rnid=16225007011&ref=sr_pg_1'
  );

  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const database = client.db('nodeJS');
  const collection = database.collection('webScrapper');

  let isLastPage = false;
  while (!isLastPage) {
    await page.waitForSelector('[data-cel-widget="search_result_0"]');
    const productsHandles = await page.$$(
      'div.s-main-slot.s-result-list.s-search-results.sg-row > .s-result-item'
    );

    for (const producthandle of productsHandles) {
      let title = 'Null';
      let price = 'Null';
      let img = 'Null';

      //title
      try {
        const titleElement = await producthandle.$('h2 > a > span');
        if (titleElement) {
          title = await titleElement.evaluate((el) => el.textContent);
          console.log(title);
        } else {
          console.log('Title element not found for this product');
        }
      } catch (error) {}

      //price
      try {
        const priceElement = await producthandle.$('.a-price > .a-offscreen');
        if (priceElement) {
          price = await priceElement.evaluate((el) => el.textContent);
          console.log(price);
        } else {
          console.log('Price element not found for this product');
        }
      } catch (error) {}

      //img
      try {
        const imgElement = await producthandle.$('.s-image');
        if (imgElement) {
          img = await imgElement.evaluate((el) => el.getAttribute('src'));
          console.log(img);
        } else {
          console.log('Image element not found for this product');
        }
      } catch (error) {}

      if (title !== 'Null') {
        await collection.insertOne({ title, price, img });
      }
    }

    const nextButton = await page.$('ul.a-pagination > li.a-last > a');
    if (nextButton) {
      await Promise.all([
        page.evaluate((btn) => btn.click(), nextButton),
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
      ]);
    } else {
      isLastPage = true;
    }
  }

  await client.close();
  await browser.close();
})();
