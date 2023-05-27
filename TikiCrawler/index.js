const axios = require('axios')
const cheerio = require('cheerio')
const createCsvWriter = require('csv-writer').createObjectCsvWriter

const url = 'https://www.yslbeautyus.com/skincare/' // Replace with the URL of the website you want to crawl
const csvWriter = createCsvWriter({
	path: 'eyesMakeUp.csv',
	header: [
		{id: 'name', title: 'Name'},
		{id: 'attribute', title: 'Attribute'},
		{id: 'price', title: 'Regular Price'},
		{id: 'img', title: 'Image'},
	],
})

axios.get(url)
	.then((response) => {
		const $ = cheerio.load(response.data)
		const products = []

		// Find all product items on the page
		$('.c-product-tile').each((index, element) => {
			const name = $(element).find('.c-product-tile__name a').text().trim()
			const price = $(element).find('.c-product-price__value').text().trim()
			const attribute = []

			// Find all categories for the product
			$(element)
				.find('ul.c-carousel__content li a')
				.each((index, element) => {
					const colourMain = $(element).attr('title')
					console.log(colourMain)
					attribute.push(colourMain)
				})

			const img = []
			$(element)
				.find('a.c-product-image img')
				.each((index, element) => {
					const imgMain = $(element).attr('src')
					if (imgMain.slice(0, 2) === 'htt') {
						let imgData = $(element).attr('src')
						console.log(imgData)
						img.push(imgData)
					} else {
						let imgData = $(element).attr('data-src')
						console.log(imgData)
						img.push(imgData)
					}
				})

			products.push({
				name,
				attribute: attribute.join(', '),
				price,
				img: img.join(', '),
			})
			console.log(products)
		})

		// Write products to CSV file
		csvWriter
			.writeRecords(products)
			.then(() => console.log('Products written to CSV file!'))
	})
	.catch((error) => console.log(error))