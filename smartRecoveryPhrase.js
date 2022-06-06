const CryptoJS = require('crypto-js')

const smartPhrase = () =>{

    var random_phrase_1 = ['Hamster', 'still']
    var random_phrase_2 = ['Game', 'peanuts']
    var random_phrase_3 = ['Mind', 'looking']
    var random_phrase_4 = ['Cons', 'natural']
    var random_phrase_5 = ['Punches', 'working']
    var random_phrase_6 = ['Down', 'believe']
    var random_phrase_7 = ['Thing', 'mjolnir']
    var random_phrase_8 = ['Wheel', 'marvelous']
    var random_phrase_9 = ['Shoulder', 'location']
    var random_phrase_10 = ['Tech', 'beauty']
    var random_phrase_11 = ['City', 'brain']
    var random_phrase_12 = ['Orient', 'power']

    var ph_1 = Math.floor(Math.random() * 2) 
    var ph_2 = Math.floor(Math.random() * 2) 
    var ph_3 = Math.floor(Math.random() * 2) 
    var ph_4 = Math.floor(Math.random() * 2) 
    var ph_5 = Math.floor(Math.random() * 2) 
    var ph_6 = Math.floor(Math.random() * 2) 
    var ph_7 = Math.floor(Math.random() * 2) 
    var ph_8 = Math.floor(Math.random() * 2) 
    var ph_9 = Math.floor(Math.random() * 2) 
    var ph_10 = Math.floor(Math.random() * 2) 
    var ph_11 = Math.floor(Math.random() * 2) 
    var ph_12 = Math.floor(Math.random() * 2) 

    var complete = `${random_phrase_1[ph_1]} ${random_phrase_2[ph_2]} ${random_phrase_3[ph_3]} ${random_phrase_4[ph_4]} ${random_phrase_5[ph_5]} ${random_phrase_6[ph_6]} ${random_phrase_7[ph_7]} ${random_phrase_8[ph_8]} ${random_phrase_9[ph_9]} ${random_phrase_10[ph_10]} ${random_phrase_11[ph_11]} ${random_phrase_12[ph_12]}`
    var result = encrypt(complete)
    return complete
}


const encrypt = (text) => {
    return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(text));
    // decrypt(`${CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(text))}`)
};
  
const decrypt = (data) => {
    return CryptoJS.enc.Base64.parse(data).toString(CryptoJS.enc.Utf8);
};


module.exports = smartPhrase
