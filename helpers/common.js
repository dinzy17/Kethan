const crypto = require('crypto');
var constants = require('./../config/constants')
var helper = {} ;

//function to decript password
helper.decryptPassword = function(encriptPassword) {
    const key = constants.passwordDecriptKey
    console.log('key', key)
    const iv = Buffer.from(encriptPassword, 'base64').slice(0, 16);
    const passwordStr = Buffer.from(encriptPassword, 'base64').slice(16);
    const password = decrypt(passwordStr, key, iv);
    return  password;
}
//decript password function.
const decrypt = (textBase64, keyBase64, ivBase64) => {
    const algorithm = 'aes-128-cbc';
    const ivBuffer = Buffer.from(ivBase64, 'base64');
    const keyBuffer = Buffer.from(keyBase64, 'base64');
    const decipher = crypto.createDecipheriv(algorithm, keyBuffer, ivBuffer);
    decipher.setAutoPadding(false);

    let decrypted = decipher.update(textBase64, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

module.exports = helper

