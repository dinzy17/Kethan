var fs = require('fs');
var querystring = require('querystring');
var http = require('http');
var request = require('request')
const constants = require('./constants')

const apiKey = constants.watson.apiKey
const collectionID = constants.watson.collectionID

 const createCollection = async () => {
	try {
		const post_data = { "name":"kethan-test", "description":"Kethan test collection description." }
		let options = { 
			method: 'POST',
			url: 'https://gateway.watsonplatform.net/visual-recognition/api/v4/collections?version=2019-02-11',
			headers: { 'content-type': 'application/json' },
			body: post_data,
			json: true,
			auth: { user: 'apikey', pass: apiKey},
		}

		request(options, function (error, response, body) {
			if (error) {
				console.log(error)
			} else {
				console.log(body)
			}
		})
		
	} catch(e) {
		console.log(e)
	}
}

const listCollection = async () => {
	return new Promise((resolve, reject) => {
		try {
			let options = { 
				method: 'GET',
				url: 'https://gateway.watsonplatform.net/visual-recognition/api/v4/collections?version=2019-02-11',
				headers: { 'content-type': 'application/json' },
				json: true,
				auth: { user: 'apikey', pass: apiKey},
			}

			request(options, function (error, response, body) {
				if (error) {
					reject({ status: "error", data: error })
				} else {
					console.log(body.collections[0])
					resolve({ status: "success", data: body })
				}
			})
			
		} catch(e) {
			reject({ status: "error", data: e })
		}
	})
}

const deleteCollection = async (collectionId) => {
	try {
		let options = { 
			method: 'DELETE',
			url: "https://gateway.watsonplatform.net/visual-recognition/api/v4/collections/"+collectionId+"?version=2019-02-11",
			headers: { 'content-type': 'application/json' },
			json: true,
			auth: { user: 'apikey', pass: apiKey},
		}

		request(options, function (error, response, body) {
			if (error) {
				console.log(error)
			} else {
				console.log(body)
			}
		})
		
	} catch(e) {
		console.log(e)
	}
}

const addImage = async (collectionId) => {
	try {
		const training_data = {"objects":[{"object": "depuy_synthes_cslp","location":{"left":200,"top":205,"width":104,"height":263}}
										]}
		const post_data = { "image_url" : "https://benchcrop.s3.us-east-2.amazonaws.com/kethan-demo/depuy_synthes_cslp/depuy_synthes_cslp+(9).jpg",
							"training_data" : JSON.stringify(training_data)
						  }

		let options = {
			method: 'POST',
			url: 'https://gateway.watsonplatform.net/visual-recognition/api/v4/collections/'+collectionId+'/images?version=2019-02-11',
			headers: { 'content-type': 'application/json' },
			formData: post_data,
			json: true,
			auth: { user: 'apikey', pass: apiKey},
		}

		request(options, function (error, response, body) {
			if (error) {
				console.log(error)
			} else {
				console.log(body)
				console.log(body.images[0].errors)
			}
		})
		
	} catch(e) {
		console.log(e)
	}
}

const listImages = async (collectionId) => {
	return new Promise((resolve, reject) => {
		try {
			let options = {
				method: 'GET',
				url: 'https://gateway.watsonplatform.net/visual-recognition/api/v4/collections/'+collectionId+'/images?version=2019-02-11',
				headers: { 'content-type': 'application/json' },
				json: true,
				auth: { user: 'apikey', pass: apiKey},
			}

			request(options, function (error, response, body) {
				if (error) {
					console.log(error)
					reject({ status: "error", data: error })
				} else {
					console.log(body)
					resolve({ status: "success", data: body })
					// console.log(body.images[0].errors)
				}
			})
			
		} catch(e) {
			reject({ status: "error", data: e })
		}
	})
}

const deleteImage = async (collectionId) => {
	try {
		let options = {
			method: 'DELETE',
			url: 'https://gateway.watsonplatform.net/visual-recognition/api/v4/collections/'+collectionId+'/images/Depuy_Skyline2_2f520487e710bc3373f7c120d821a517?version=2019-02-11',
			headers: { 'content-type': 'application/json' },
			json: true,
			auth: { user: 'apikey', pass: apiKey},
		}

		request(options, function (error, response, body) {
			if (error) {
				console.log(error)
			} else {
				console.log(body)
				// console.log(body.images[0].errors)
			}
		})
		
	} catch(e) {
		console.log(e)
	}
}

const trainCollection = async (collectionId) => {
	try {
		const post_data = { "apikey" : apiKey }
		let options = { 
			method: 'POST',
			url: 'https://gateway.watsonplatform.net/visual-recognition/api/v4/collections/'+collectionId+'/train?version=2019-02-11',
			headers: { 'content-type': 'application/json' },
			formData: post_data,
			json: true,
			auth: { user: 'apikey', pass: apiKey},
		}

		request(options, function (error, response, body) {
			if (error) {
				console.log(error)
			} else {
				console.log(body)
				// console.log(body.images[0].errors)
			}
		})
		
	} catch(e) {
		console.log(e)
	}
}

const analyzeImage = async (collectionId, imgUrl) => {
	return new Promise((resolve, reject) => {
		try {
			const post_data = { "features": "objects", "collection_ids": [ collectionId ], "image_url": imgUrl }
			let options = { 
				method: 'POST',
				url: 'https://gateway.watsonplatform.net/visual-recognition/api/v4/analyze?version=2019-02-11',
				headers: { 'content-type': 'application/json' },
				formData: post_data,
				json: true,
				auth: { user: 'apikey', pass: apiKey},
			}

			request(options, function (error, response, body) {
				if (error) {
					console.log(error)
					reject({ status: "error", data: error })
				} else {
					// console.log(body) // console.log(body.images[0].objects.collections[0].objects)  
					//  console.log(body.images[0].errors)
					resolve({ status: "success", data: body })
				}
			})
			
		} catch(e) {
			console.log(e)
			reject({ status: "error", data: e })
		}
	})
}
listCollection()
module.exports = { createCollection, listCollection, deleteCollection, addImage, listImages, deleteImage, trainCollection, analyzeImage }
// var collectionID = "85c5783a-c7fd-4f76-ad04-e0fde8b8b660"
// createCollection()

// deleteCollection(collectionID)
// addImage(collectionID)
listImages(collectionID)
// deleteImage(collectionID)
// trainCollection(collectionID)
// analyzeImage(collectionID)

