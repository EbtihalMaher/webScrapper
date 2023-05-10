const fs = require("fs");
const { Cluster } = require("puppeteer-cluster");

const urls = [
  "https://www.amazon.com/s?k=amazonbasics&pd_rd_r=03e5e33c-4faf-452d-8173-4a34efcf3524&pd_rd_w=EQNRr&pd_rd_wg=PygJX&pf_rd_p=9349ffb9-3aaa-476f-8532-6a4a5c3da3e7&pf_rd_r=8RYH7VRZ4HSKWWG0NEX3&ref=pd_gw_unk",
  "https://www.amazon.com/s?k=oculus&i=electronics-intl-ship&pd_rd_r=03e5e33c-4faf-452d-8173-4a34efcf3524&pd_rd_w=iMBhG&pd_rd_wg=PygJX&pf_rd_p=5c71b8eb-e4c7-4ea1-bf40-b57ee72e089f&pf_rd_r=8RYH7VRZ4HSKWWG0NEX3&ref=pd_gw_unk",
];

(async () => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: 100,
    monitor: true,
    puppeteerOptions: {
      headless: false,
      defaultViewport: false,
      userDataDir: "./tmp",
    },
  });

  cluster.on("taskerror", (err, data) => {
    console.log(`Error crawling ${data}: ${err.message}`);
  });

  await cluster.task(async ({ page, data: url }) => {
    await page.goto(url);

    let isLastPage = false;
    while (!isLastPage) {
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
  });

  for (const url of urls) {
    await cluster.queue(url);
  }

  await cluster.idle();
  await cluster.close();
})();