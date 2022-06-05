const nodemailer = require('nodemailer')


const sendAnEmail = (name, email) => {

const transporter = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
        user: 'connect@qviple.com',
        pass: 'host_pass'
    }
})


const options = {
    from: 'connect@qviple.com',
    to: `${email}`,
    subject: 'Get In Touch Data',
    text: 'Successfully Updated',
    html: `<div style="background-color: #1a5db4; padding: 10px; text-align: left;"><h3>Welcome to the Qviple, ${name}</h3></div>`
}

transporter.sendMail(options, function(err, data){
    if(err){
        console.log(err.message)
        return
    }
    console.log('Send Email')
})

}

module.exports = sendAnEmail