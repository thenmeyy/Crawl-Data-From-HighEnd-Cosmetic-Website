
const request = require('request');
const axios = require("axios");
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;


const url = 'hhttps://www.shiseido.com/us/en/skincare/serums-and-treatments/';

request(url, (error, response, html) => {
  if (!error && response.statusCode == 200) {
    const $ = cheerio.load(html);
    const productLinks = [];

    $('a.thumb-link').each((index, element) => {
      const link = $(element).attr('href');
        // const prefix = 'https://www.gucci.com';

        // // Using the concat() method
        // const productUrl = prefix.concat(link);
        // console.log(productUrl);
      if (link.substring(1, 3) === 'us') {
        const prefix = 'https://www.shiseido.com';
        const productUrl = prefix.concat(link);
        productLinks.push(productUrl);
      } 
      else {
        productLinks.push(link);
      }

    });

    const products = [];

    (async () => {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      page.setDefaultNavigationTimeout( 80000);


      for (let i = 0; i < productLinks.length; i++) {
        const productUrl = productLinks[i];
        console.log(productUrl)
        
        await page.goto(productUrl);

        const name = await page.$eval('h1.product-name', element => element.textContent.trim());
        console.log(name)

        // Lấy giá
        // const name = await page.$eval('span.SellBlockProductSummary__title', element => element.textContent.trim());
        const price = await page.$eval('span.price-sales', element => element.textContent.trim());
        console.log(price)

        //Lấy short description
        const description = await page.$eval('.product-description', element => element.textContent.trim());
        console.log(description)

        //Lấy full description
        const longDescription = await page.$eval('.pdp-content-inner p', element => element.textContent.replace(/\n/g, '').trim());
        console.log(longDescription)
        // let description = '';
        // axios.get(productUrl)
        // .then(response => {
        //   const $ = cheerio.load(response.data);
        //   const myDiv = $("section.pdp-content-section");
        //   const htmlString = myDiv.html();

          
        //   const $$ = cheerio.load(htmlString);
        //   const parentDiv = $$(".pdp-content-inner");
        //   const secondDiv = parentDiv.children().eq(2);
        //   description = secondDiv.text().trim();

        //   console.log(description);
        // })
        // .catch(error => {
        //   console.log(error);
        // });

      
        //Lấy ảnh
        const images = await page.$$eval('.slick-track button', (buttons) =>
          buttons.map((button) => button.getAttribute('data-zoomimg'))
        );

        //Lấy bảng màu
        const attributes = await page.$$eval('select.variation-select option', (attribute) =>
          attribute.map((option) => option.textContent.replace(/\n/g, '').trim())
        );


        // const attributes = [];
        // await page.goto(productUrl);

        // console.log(productUrl)

        // axios.get(productUrl)
        // .then(response => {
        //   console.log(productUrl)

        //   const html = response.data;
        //   const $$ = cheerio.load(html);

        //   $$('.product-variations').each((i, el) => {
        //     // const variantName = $(el).find('.variant-selector-label').text().trim();
        //     // const variantValues = [];
        //     $$(el).find('li.selectable a.swatchanchor img').each((j, option) => {
        //       const attribute = $$(option).attr('alt');
        //       console.log(attribute)
        //       attributes.push(attribute);
        //     });
        //     // variants.push({ values: variantValues });
        //   });

        // })
        // .catch(error => {
        //   console.error(error);
        // });


        // for (let j = 0; j < categories.length; j++) {
        //   const categoriesMain = await categories[j].$eval('.c-select__panel-list li span.c-select__text', element => element.textContent.trim());
        // const attributes = [];
        // $('.c-select__panel-list li span.c-select__text').each((index, element) => {
        //   const attribute = $(element).text();
        //   attributes.push(attribute);
        // });

        // const descriptions = [];
        // $('.subsection_wrapper p.subsection_content').each((index, element) => {
        //   const description = $(element).text();
        //   descriptions.push(description);
        // });

        // const images = [];
        // $('li.c-carousel__item img').each((index, element) => {
        //   const image = $(element).attr('src');
        //   images.push(image);
        // });

        
        //   const product = {
        //     name: name,
        //     price: price,
        //     categoriesMain: categoriesMain,
        //   };

        //   products.push(product);
        // }

        products.push({
          name,
          price,
          description,
          longDescription,
          attributes: attributes.join(', '),
          images: images.join(', '),
        })
        console.log(products)
      }

      const csvWriter = createCsvWriter({
        path: 'ShisheidoMakeUpFace.csv',
        header: [
          { id: 'name', title: 'Name' },
          { id: 'price', title: 'Regular price' },
          { id: 'attributes', title: 'Attribute name' },
          { id: 'images', title: 'Images' },
          { id: 'description', title: 'Product description' },
          { id: 'longDescription', title: 'Long description' }

        ]
      });

      csvWriter.writeRecords(products)
        .then(() => {
          console.log('Data written to CSV file');
        });

      await browser.close();
    })();
  }
});