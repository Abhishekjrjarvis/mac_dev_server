const nodemailer = require("nodemailer");

const sendAnEmail = (name, email) => {
  const transporter = nodemailer.createTransport({
    service: "Godaddy",
    host: "smtpout.secureserver.net",
    secureConnection: true,
    port: 465,
    auth: {
      user: `email`,
      pass: `pass`,
    },
  });

  const options = {
    from: `email`,
    to: `${email}`,
    subject: "Thanks for Get In Touch",
    text: `Welcome To The Qviple, ${name}`,
    html: `<div style="padding: 10px; text-align: left; color: lightGray">
    <div style="display: flex; justify-content: center">
    <img src="cid:qvipleLogoImage"/>
    </div>
    <div><h1 style="letter-spacing: 1px">Welcome to the Qviple, ${name}</h1></div>
    <div><p style="letter-spacing: 1px; font-weight: 600; margin-top: 50px; line-height: '1px">
    Your form has been submitted successfully. 
    Stay tuned for future updates, 
    we will get back to within 48 hours.
    Till then Explore our site. <a href="http://qviple.com/">Qviple</a>
    </p>
    <p style="margin-top: auto; font-weight: 600;">Team Qviple <br/>
    Nashik, Maharashtra
    </p></div></div>`,
    attachments: [
      {
        filename: "logo-icon.png",
        path: `${__dirname}/logo-icon.png`,
        cid: "qvipleLogoImage", //same cid value as in the html img src
      },
    ],
  };

  transporter.sendMail(options, function (err, data) {
    if (err) {
      console.log(err.message);
      return;
    }
    console.log("Send Email");
  });
};

module.exports = sendAnEmail;
