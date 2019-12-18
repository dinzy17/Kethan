var helper = {}

//function to format data before sending it to frontend
helper.rError = function(msg) {
    return { status: "error", data: msg }
}

helper.rSuccess = function(data = null) {
    let res = { status: "success" }
    if (data) {
        res.data = data
    }
    return res
}


// for send error status code.
helper.rErrorWithStatusCode = function( statusCode, msg ) {
    return { status: "error", data: msg, statusCode: statusCode }
}

module.exports = helper
