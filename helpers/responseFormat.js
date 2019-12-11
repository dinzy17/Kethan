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

// for not register user while sign in for social media account.
helper.rErrorNotRegister = function(msg) {
    return { status: "notRegister", data: msg }
}

module.exports = helper
