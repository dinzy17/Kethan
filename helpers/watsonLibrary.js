var fs = require('fs')
var querystring = require('querystring')
var http = require('http')
var request = require('request')
const constants = require('./../config/constants')

const apiVersionUrl = constants.watson.apiVersionUrl
const apiKey = constants.watson.apiKey
const collectionID = constants.watson.collectionID

 const createCollection = async (collectionName, collectionDescription) => {
	return new Promise((resolve, reject) => {
    try {
  		const postData = { "name": collectionName, "description": collectionDescription }
  		let options = {
  			method: 'POST',
  			url: apiVersionUrl + '/collections?version=2019-02-11',
  			headers: { 'content-type': 'application/json' },
  			body: postData,
  			json: true,
  			auth: { user: 'apikey', pass: apiKey},
  		}

  		request(options, function (error, response, body) {
  			if (error) {
  				reject({ status: "error", data: error })
  			} else {
  				resolve({ status: "success", data: body })
  			}
  		})

  	} catch(e) {
  		reject({ status: "error", data: e })
  	}
  })
}

const listCollection = async () => {
	return new Promise((resolve, reject) => {
		try {
			let options = {
				method: 'GET',
				url: apiVersionUrl + '/collections?version=2019-02-11',
				headers: { 'content-type': 'application/json' },
				json: true,
				auth: { user: 'apikey', pass: apiKey},
			}

			request(options, function (error, response, body) {
				// console.log("response",response)
				if (error) {
          			console.log("request error:", error)
					reject({ status: "error", data: error })
				} else {
					console.log("request body error:", body)
					// console.log(body.collections[0])
					resolve({ status: "success", data: body })
				}
			})

		} catch(e) {
      console.log("exception:", e)
			reject({ status: "error", data: e })
		}
	})
}

const deleteCollection = async (collectionId) => {
	return new Promise((resolve, reject) => {
    try {
  		let options = {
  			method: 'DELETE',
  			url: apiVersionUrl + '/collections/' + collectionId + '?version=2019-02-11',
  			headers: { 'content-type': 'application/json' },
  			json: true,
  			auth: { user: 'apikey', pass: apiKey},
  		}

  		request(options, function (error, response, body) {
        if (error) {
  				reject({ status: "error", data: error })
  			} else {
  				resolve({ status: "success", data: body })
  			}
  		})

  	} catch(e) {
  		reject({ status: "error", data: e })
  	}
  })
}

const addImage = async (collectionId, objectName, location, imgPath) => {
  return new Promise((resolve, reject) => {
    try {
  		const trainingData = {"objects":[{"object": objectName,"location":{"left": location.left,"top":location.top,"width":location.width,"height":location.height}}
  										]}
  		const postData = { "image_url" : imgPath,
  							"training_data" : JSON.stringify(trainingData)
  						  }
      let options = {
  			method: 'POST',
  			url: apiVersionUrl + 'collections/'+collectionId+'/images?version=2019-02-11',
  			headers: { 'content-type': 'application/json' },
  			formData: postData,
  			json: true,
  			auth: { user: 'apikey', pass: apiKey},
  		}
      request(options, function (error, response, body) {
  			if (error) {
  				reject({ status: "error", data: error })
  			} else {
          // console.log("body", body)
          if(body.images && body.images[0].errors) {
            console.log("Image errors: ", body.images[0].errors)
          }
  				resolve({ status: "success", data: body })
  			}
  		})

  	} catch(e) {
  		reject({ status: "error", data: e })
  	}

  })
}

const listImages = async (collectionId) => {
	return new Promise((resolve, reject) => {
		try {
			let options = {
				method: 'GET',
				url: apiVersionUrl + '/collections/'+collectionId+'/images?version=2019-02-11',
				headers: { 'content-type': 'application/json' },
				json: true,
				auth: { user: 'apikey', pass: apiKey},
			}

			request(options, function (error, response, body) {
				if (error) {
					console.log("error", error)
					reject({ status: "error", data: error })
				} else {
					console.log("body", body)
					resolve({ status: "success", data: body })
				}
			})

		} catch(e) {
			reject({ status: "error", data: e })
		}
	})
}

const deleteImage = async (collectionId) => {
	return new Promise((resolve, reject) => {
    try {
  		let options = {
  			method: 'DELETE',
  			url: apiVersionUrl + '/collections/'+collectionId+'/images/Depuy_Skyline2_2f520487e710bc3373f7c120d821a517?version=2019-02-11',
  			headers: { 'content-type': 'application/json' },
  			json: true,
  			auth: { user: 'apikey', pass: apiKey},
  		}

      request(options, function (error, response, body) {
				if (error) {
				//	console.log(error)
					reject({ status: "error", data: error })
				} else {
				//	console.log(body)
					resolve({ status: "success", data: body })
				}
			})

		} catch(e) {
			reject({ status: "error", data: e })
		}
	})
}

const trainCollection = async (collectionId) => {
	return new Promise((resolve, reject) => {
    try {
  		const postData = { "apikey" : apiKey }
  		let options = {
  			method: 'POST',
  			url: apiVersionUrl + '/collections/'+collectionId+'/train?version=2019-02-11',
  			headers: { 'content-type': 'application/json' },
  			formData: postData,
  			json: true,
  			auth: { user: 'apikey', pass: apiKey},
  		}

      request(options, function (error, response, body) {
				if (error) {
					// console.log(error)
					reject({ status: "error", data: error })
				} else {
				//	console.log(body)
					resolve({ status: "success", data: body })
				}
			})

		} catch(e) {
			reject({ status: "error", data: e })
		}
	})
}

const analyzeImage = async (collectionId, imgUrl) => {
	return new Promise((resolve, reject) => {
		try {
			const postData = { "features": "objects", "collection_ids": [ collectionId ], "image_url": imgUrl }
			let options = {
				method: 'POST',
				url: apiVersionUrl + '/analyze?version=2019-02-11',
				headers: { 'content-type': 'application/json' },
				formData: postData,
				json: true,
				auth: { user: 'apikey', pass: apiKey},
			}

			request(options, function (error, response, body) {
				if (error) {
				//	console.log(error)
					reject({ status: "error", data: error })
				} else {
					console.log(body)
          // console.log(body.images[0].objects.collections[0].objects)
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

module.exports = { createCollection, listCollection, deleteCollection, addImage, listImages, deleteImage, trainCollection, analyzeImage }

listCollection(collectionID)
listImages(collectionID)