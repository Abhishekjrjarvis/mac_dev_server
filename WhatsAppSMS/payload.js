const axios = require("axios");
const { dynamic_designation } = require("./designation");
var dLink =
  "https://play.google.com/store/apps/details?id=com.mithakalminds.qviple";

// "ADSIS" --> Add Direct Student From Institute Side
// "ASCAS" --> Add Student In Confirmed From Admission Side
// "ADMIS" --> Add Direct Mentor / Staff From Institute Side

const payload_type_content = (
  mob,
  sName,
  iName,
  cName,
  type,
  value,
  paid,
  remain,
  lang
) => {
  if (type === "ADSIS") {
    var text = `Hello, ${sName} Welcome to ${iName}. You are studying in class ${cName} . Login to your account with following below steps:
1. Download app 'Qviple Community To Learn' from play store click on the link: ${dLink}
2. Open App and enter your Mobile no. (${mob})
3. Verify Mobile no. with otp
4. Select your Existing account & proceed to login`;

    var hext = `नमस्कार, ${sName} ${iName} में आपका स्वागत है। आप कक्षा ${cName} में पढ़ रहे हैं। निम्नलिखित चरणों के साथ अपने खाते में प्रवेश करें:
1. प्ले स्टोर से ऐप 'क्विपल कम्युनिटी टू लर्न' डाउनलोड करें या डाउनलोड करने के लिए लिंक पर क्लिक करें: ${dLink}
2. ऐप खोलें और अपना मोबाइल नंबर (${mob}) दर्ज करें। 
3. मोबाइल नंबर OTP के साथ सत्यापित करें।
4. अपने मौजूदा खाते का चयन करें और आपको डैशबोर्ड पर भेज दिया जाएगा |`;

    var mext = `नमस्कार, ${sName} ${iName} मध्ये आपले स्वागत आहे. तुम्ही ${cName} वर्गात शिकत आहात. खालील चरणांसह तुमच्या खात्यात लॉग इन करा:
1. प्ले स्टोअरवरून 'Qviple Community To Learn' अॅप डाउनलोड करा लिंकवर क्लिक करा: ${dLink}
2. अॅप उघडा आणि तुमचा मोबाईल क्रमांक टाका. (${mob})
3. मोबाईल क्रमांक OTP सह सत्यापित करा. 
4. तुमचे खाते निवडा आणि लॉगिन करा.`;
    var message =
      lang === "en"
        ? text
        : lang === "hi"
        ? hext
        : lang === "mt" || lang === "mr"
        ? mext
        : "";
    if (value === "College/Polytechnic") {
      var content = "SMS_Assests/Add_Student_College.png";
      var extension = ".png";
    } else if (value === "School") {
      var content = "SMS_Assests/Add_Student_School.jpeg";
      var extension = ".jpeg";
    } else {
      var content = "";
      var extension = "";
    }
  } else if (type === "ASCAS") {
    var text = `Hello ${sName},
Welcome to ${iName}.
Your admission has been confirmed with fees of Rs.${paid}${
      remain > 0 ? ` Rs.${remain} is remaining` : ""
    }.
Login to your account with following below steps:
1. Download app 'Qviple Community To Learn' from play store click on the link: ${dLink}
2. Open App and enter your Mobile no. (${mob})
3. Verify Mobile no. with otp
4. Select your Existing account & proceed to login`;

    var hext = `नमस्कार ${sName},
${iName} में आपका स्वागत है।
रु.${paid} के शुल्क के साथ आपके प्रवेश की पुष्टि हो गई है ${
      remain > 0 ? ` रु.${remain} शेष है` : ""
    }.
निम्नलिखित चरणों के साथ अपने खाते में प्रवेश करें:
1. प्ले स्टोर से ऐप 'क्विपल कम्युनिटी टू लर्न' डाउनलोड करें या डाउनलोड करने के लिए लिंक पर क्लिक करें: ${dLink}
2. ऐप खोलें और अपना मोबाइल नंबर (${mob}) दर्ज करें। 
3. मोबाइल नंबर OTP के साथ सत्यापित करें।
4. अपने मौजूदा खाते का चयन करें और आपको डैशबोर्ड पर भेज दिया जाएगा |`;

    var mext = `नमस्कार ${sName},
    ${iName} मध्ये आपले स्वागत आहे.
    तुमचा प्रवेश Rs.${paid} च्या शुल्कासह निश्चित झाला आहे ${
      remain > 0 ? ` Rs.${remain} बाकी आहे` : ""
    }.
    खालील चरणांसह तुमच्या खात्यात लॉग इन करा:
1. प्ले स्टोअरवरून 'Qviple Community To Learn' अॅप डाउनलोड करा लिंकवर क्लिक करा: ${dLink}
2. अॅप उघडा आणि तुमचा मोबाईल क्रमांक टाका. (${mob})
3. मोबाईल क्रमांक OTP सह सत्यापित करा. 
4. तुमचे खाते निवडा आणि लॉगिन करा.`;
    var message =
      lang === "en"
        ? text
        : lang === "hi"
        ? hext
        : lang === "mt" || lang === "mr"
        ? mext
        : "";
    if (value === "College/Polytechnic") {
      var content = "SMS_Assests/Add_Student_College.png";
      var extension = ".png";
    } else if (value === "School") {
      var content = "SMS_Assests/Add_Student_School.jpeg";
      var extension = ".jpeg";
    } else {
      var content = "";
      var extension = "";
    }
  } else if (type === "ADMIS") {
    var text = `Hello, ${sName} Welcome to ${iName}. Login to your account with following below steps:
1. Download app 'Qviple Community To Learn' from play store click on the link: ${dLink}
2. Open App and enter your Mobile no. (${mob})
3. Verify Mobile no. with otp
4. Select your Existing account & proceed to login`;

    var hext = `नमस्कार, ${sName} ${iName} में आपका स्वागत है। नीचे दिए गए चरणों का पालन करके अपने खाते में प्रवेश करें.
1. प्ले स्टोर से ऐप 'क्विपल कम्युनिटी टू लर्न' डाउनलोड करें या डाउनलोड करने के लिए लिंक पर क्लिक करें: ${dLink}
2. ऐप खोलें और अपना मोबाइल नंबर (${mob}) दर्ज करें। 
3. मोबाइल नंबर OTP के साथ सत्यापित करें।
4. अपने मौजूदा खाते का चयन करें और आपको डैशबोर्ड पर भेज दिया जाएगा |`;

    var mext = `नमस्कार, ${sName} ${iName} मध्ये आपले स्वागत आहे. खालील चरणांसह तुमच्या खात्यात लॉग इन करा.
1. प्ले स्टोअरवरून 'Qviple Community To Learn' अॅप डाउनलोड करा लिंकवर क्लिक करा: ${dLink}
2. अॅप उघडा आणि तुमचा मोबाईल क्रमांक टाका. (${mob})
3. मोबाईल क्रमांक OTP सह सत्यापित करा. 
4. तुमचे खाते निवडा आणि लॉगिन करा.`;
    var message =
      lang === "en"
        ? text
        : lang === "hi"
        ? hext
        : lang === "mt" || lang === "mr"
        ? mext
        : "";
    var content = "SMS_Assests/Institute_Add_Staff.jpeg";
    var extension = ".jpeg";
  }
  return { content: content, extension: extension, message: message };
};

const payload_type_content_email = (
  email,
  sName,
  iName,
  type,
  value,
  paid,
  remain,
  lang,
  mob
) => {
  if (type === "ADSIS") {
    var text = `Hello ${sName},
Qviple is ERP software of ${iName?.insName}.
You are requested to login to your account with your email ${email}.
Stay updated about your fees, exams, events and much more about your school/college.
        
Now know your classmates, teachers and institute to a profound level. And grow your network.
        
Login by Downloading app 'Qviple: Your College Online' from playstore
        
OR
        
Through link : https://play.google.com/store/apps/details?id=com.mithakalminds.qviple
        
Note: 
If you are not able to login or are facing difficulty in login reach out to us at: connect@qviple.com
        
If you have queries regarding your fees, profile information or other, reach out to your institute's appropriate authority or at: ${iName?.insEmail}

`;
    // var text = `Hi ${sName}.
    // "Qviple" is ERP Software of ${iName}.
    // You are requested to login to your account with your email id (On which this email is received) to stay updated about your fees, exams and events of your school or college.
    // Login by downloading app 'Qviple Community' from playstore or through link: https://play.google.com/store/apps/details?id=com.mithakalminds.qviple - From "Qviple"`;

    var hext = `नमस्कार ${sName}। 
    "क्यूवीपल" ${iName?.insName} का ईआरपी सॉफ्टवेयर है। 
    आपसे अनुरोध है कि अपने स्कूल या कॉलेज की फीस, परीक्षाओं और कार्यक्रमों के बारे में अद्यतन रहने के लिए अपने मोबाइल नंबर (जिस पर यह एसएमएस प्राप्त हुआ है) के साथ अपने खाते में प्रवेश करें। 
    Playstore से या लिंक के माध्यम से ऐप 'Qviple समुदाय' डाउनलोड करके लॉगिन करें: https://play.google.com/store/apps/details?id=com.mithakalminds.qviple - "Qviple" से`;

    var mext = `हाय ${sName}. 
    "Qviple" हे ${iName?.insName} चे ERP सॉफ्टवेअर आहे. 
    तुमच्‍या फी, परीक्षा आणि तुमच्‍या शाळा किंवा कॉलेजच्‍या इव्‍हेंटबद्दल अपडेट राहण्‍यासाठी तुम्‍हाला तुमच्‍या मोबाईल नंबरने (ज्यावर हा एसएमएस आला आहे) तुमच्‍या अकाउंटमध्‍ये लॉग इन करण्‍याची विनंती केली जाते. 
    प्लेस्टोअरवरून किंवा लिंकद्वारे 'Qviple कम्युनिटी' अॅप डाउनलोड करून लॉग इन करा: https://play.google.com/store/apps/details?id=com.mithakalminds.qviple - "Qviple" वरून `;
    var message =
      lang === "en"
        ? text
        : lang === "hi"
        ? hext
        : lang === "mt" || lang === "mr"
        ? mext
        : "";
    if (value === "College/Polytechnic") {
      var content = "SMS_Assests/Add_Student_College.png";
      var extension = ".png";
    } else if (value === "School") {
      var content = "SMS_Assests/Add_Student_School.jpeg";
      var extension = ".jpeg";
    } else {
      var content = "";
      var extension = "";
    }
  } else if (type === "ASCAS") {
    var text = `Hello ${sName},
Welcome to ${iName?.insName}.
Your admission has been confirmed with fees of Rs.${paid}${
      remain > 0 ? ` Rs.${remain} is remaining` : ""
    }.
Login to your account with following below steps:
1. Download app 'Qviple Community To Learn' from play store click on the link: ${dLink}
2. Open App and enter your Mobile no. (${email})
3. Verify Mobile no. with otp
4. Select your Existing account & proceed to login`;

    var hext = `नमस्कार ${sName},
${iName?.insName} में आपका स्वागत है।
रु.${paid} के शुल्क के साथ आपके प्रवेश की पुष्टि हो गई है ${
      remain > 0 ? ` रु.${remain} शेष है` : ""
    }.
निम्नलिखित चरणों के साथ अपने खाते में प्रवेश करें:
1. प्ले स्टोर से ऐप 'क्विपल कम्युनिटी टू लर्न' डाउनलोड करें या डाउनलोड करने के लिए लिंक पर क्लिक करें: ${dLink}
2. ऐप खोलें और अपना मोबाइल नंबर (${email}) दर्ज करें। 
3. मोबाइल नंबर OTP के साथ सत्यापित करें।
4. अपने मौजूदा खाते का चयन करें और आपको डैशबोर्ड पर भेज दिया जाएगा |`;

    var mext = `नमस्कार ${sName},
    ${iName?.insName} मध्ये आपले स्वागत आहे.
    तुमचा प्रवेश Rs.${paid} च्या शुल्कासह निश्चित झाला आहे ${
      remain > 0 ? ` Rs.${remain} बाकी आहे` : ""
    }.
    खालील चरणांसह तुमच्या खात्यात लॉग इन करा:
1. प्ले स्टोअरवरून 'Qviple Community To Learn' अॅप डाउनलोड करा लिंकवर क्लिक करा: ${dLink}
2. अॅप उघडा आणि तुमचा मोबाईल क्रमांक टाका. (${email})
3. मोबाईल क्रमांक OTP सह सत्यापित करा. 
4. तुमचे खाते निवडा आणि लॉगिन करा.`;
    var message =
      lang === "en"
        ? text
        : lang === "hi"
        ? hext
        : lang === "mt" || lang === "mr"
        ? mext
        : "";
    if (value === "College/Polytechnic") {
      var content = "SMS_Assests/Add_Student_College.png";
      var extension = ".png";
    } else if (value === "School") {
      var content = "SMS_Assests/Add_Student_School.jpeg";
      var extension = ".jpeg";
    } else {
      var content = "";
      var extension = "";
    }
  } else if (type === "ADMIS") {
    var text = `Hello ${sName},
Qviple is ERP software of ${iName?.insName}.
You are requested to login to your account with your email ${email}.
Stay updated about your fees, exams, events and much more about your school/college.
        
Now know your classmates, teachers and institute to a profound level. And grow your network.
        
Login by Downloading app 'Qviple: Your College Online' from playstore
        
OR
        
Through link : https://play.google.com/store/apps/details?id=com.mithakalminds.qviple
        
Note: 
If you are not able to login or are facing difficulty in login reach out to us at: connect@qviple.com
        
If you have queries regarding your fees, profile information or other, reach out to your institute's appropriate authority or at: ${iName?.insEmail}

`;

    var hext = `नमस्कार ${sName}। 
    "क्यूवीपल" ${iName?.insName} का ईआरपी सॉफ्टवेयर है। 
    आपसे अनुरोध है कि अपने स्कूल या कॉलेज की फीस, परीक्षाओं और कार्यक्रमों के बारे में अद्यतन रहने के लिए अपने मोबाइल नंबर (जिस पर यह एसएमएस प्राप्त हुआ है) के साथ अपने खाते में प्रवेश करें। 
    Playstore से या लिंक के माध्यम से ऐप 'Qviple समुदाय' डाउनलोड करके लॉगिन करें: https://play.google.com/store/apps/details?id=com.mithakalminds.qviple - "Qviple" से`;

    var mext = `हाय ${sName}. 
    "Qviple" हे ${iName?.insName} चे ERP सॉफ्टवेअर आहे. 
    तुमच्‍या फी, परीक्षा आणि तुमच्‍या शाळा किंवा कॉलेजच्‍या इव्‍हेंटबद्दल अपडेट राहण्‍यासाठी तुम्‍हाला तुमच्‍या मोबाईल नंबरने (ज्यावर हा एसएमएस आला आहे) तुमच्‍या अकाउंटमध्‍ये लॉग इन करण्‍याची विनंती केली जाते. 
    प्लेस्टोअरवरून किंवा लिंकद्वारे 'Qviple कम्युनिटी' अॅप डाउनलोड करून लॉग इन करा: https://play.google.com/store/apps/details?id=com.mithakalminds.qviple - "Qviple" वरून `;
    var message =
      lang === "en"
        ? text
        : lang === "hi"
        ? hext
        : lang === "mt" || lang === "mr"
        ? mext
        : "";
    var content = "SMS_Assests/Institute_Add_Staff.jpeg";
    var extension = ".jpeg";
  }
  return { content: content, extension: extension, message: message };
};

exports.whats_app_sms_payload = (
  margs,
  sargs,
  iargs,
  cargs,
  targs,
  vargs,
  pargs,
  rargs,
  largs
) => {
  try {
    const bool = process.env.IS_GLOBAL;
    if (bool) {
      const content = payload_type_content(
        margs,
        sargs,
        iargs,
        cargs,
        targs,
        vargs,
        pargs,
        rargs,
        largs
      );
      if (content.content && content.extension && content.message) {
        const url = `https://web-wapp.in/api/send.php?number=91${margs}&type=media&message=${content.message}&media_url=${process.env.CDN_LINK}${content.content}&filename=${process.env.SMS_FILE_TYPE}${content.extension}&instance_id=${process.env.SMS_INSTANCE_ID}&access_token=${process.env.SMS_INSTANCE_TOKEN}`;
        const encodeURL = encodeURI(url);
        axios
          .post(encodeURL)
          .then((res) => {
            console.log("Sended Successfully");
          })
          .catch((e) => {
            console.log("SMS API Bug", e.message);
          });
        return true;
      } else {
        return false;
      }
    } else {
      console.log("18 Dev");
    }
  } catch (e) {
    console.log(e);
  }
};

exports.designation_alarm = (mob, type, lang, name, title, cTitle) => {
  try {
    const bool = process.env.IS_GLOBAL;
    if (bool) {
      const value = dynamic_designation(name, title, cTitle);
      var valid = "";
      for (var val of value) {
        if (`${type}` === `${val?.type}`) {
          valid = val;
        }
      }
      var message =
        lang === "en"
          ? valid?.e_text
          : lang === "hi"
          ? valid?.h_text
          : lang === "mt" || lang === "mr"
          ? valid?.m_text
          : "";
      const url = `https://web-wapp.in/api/send.php?number=91${mob}&type=media&message=${message}&media_url=${process.env.CDN_LINK}${valid.content}&filename=${process.env.SMS_FILE_TYPE}${valid.extension}&instance_id=${process.env.SMS_INSTANCE_ID}&access_token=${process.env.SMS_INSTANCE_TOKEN}`;
      const encodeUrl = encodeURI(url);
      axios
        .post(encodeUrl)
        .then((res) => {
          console.log("Sended Successfully");
        })
        .catch((e) => {
          console.log("SMS API Bug", e.message);
        });
      return true;
    } else {
      console.log("18 Dev");
    }
  } catch (e) {
    console.log(e);
  }
};

exports.email_sms_payload_query = (
  margs,
  sargs,
  iargs,
  targs,
  vargs,
  pargs,
  rargs,
  largs
) => {
  try {
    const bool = process.env.IS_GLOBAL;
    if (bool) {
      const content = payload_type_content_email(
        margs,
        sargs,
        iargs,
        targs,
        vargs,
        pargs,
        rargs,
        largs
      );
      if (content.message) {
        const subject = "Qviple ERP Login Details";
        const message = `${content.message}`;
        const url = `https://transemail.dove-soft.com/v2/email/send?apikey=${process.env.EMAIL_API_KEY}&subject=${subject}&to=${margs}&bodyText=${message}&encodingType=0&from=connect@qviple.com&from_name=Qviple`;
        const encodeURL = encodeURI(url);
        axios
          .post(encodeURL)
          .then((res) => {
            console.log("Sended Successfully");
          })
          .catch((e) => {
            console.log("SMS API Bug", e.message);
          });
        return true;
      } else {
        return false;
      }
    } else {
      console.log("18 Dev");
    }
  } catch (e) {
    console.log(e);
  }
};

exports.email_sms_designation_alarm = (
  email,
  type,
  lang,
  name,
  title,
  cTitle
) => {
  try {
    const bool = process.env.IS_GLOBAL;
    if (bool) {
      const value = dynamic_designation(name, title, cTitle);
      var valid = "";
      for (var val of value) {
        if (`${type}` === `${val?.type}`) {
          valid = val;
        }
      }
      var message =
        lang === "en"
          ? valid?.e_text
          : lang === "hi"
          ? valid?.h_text
          : lang === "mt" || lang === "mr"
          ? valid?.m_text
          : "";
      const subject = "Qviple Designation";
      const url = `https://transemail.dove-soft.com/v2/email/send?apikey=${process.env.EMAIL_API_KEY}&subject=${subject}&to=${email}&bodyText=${message}&encodingType=0&from=connect@qviple.com&from_name=Qviple`;
      const encodeURL = encodeURI(url);
      axios
        .post(encodeURL)
        .then((res) => {
          console.log("Sended Successfully");
        })
        .catch((e) => {
          console.log("SMS API Bug", e.message);
        });
      return true;
    } else {
      console.log("18 Dev");
    }
  } catch (e) {
    console.log(e);
  }
};

exports.email_sms_designation_normal = (
  email,
  name,
  message,
  mobile,
  city,
  status,
  soln
) => {
  try {
    const bool = process.env.IS_GLOBAL;
    if (bool) {
      if (status === "Reviewed") {
        var message = `Your Enquiry has been Solved successfully.

        Solution - ${soln}

        - Thanks for having patience.
        `
      }
      else {
        var message = `Your Enquiry has been submitted successfully
      
        See Your Inquiry Details -
        ${name}
        ${mobile}
        ${email}
        ${city}
        inquiry - ${message}.

        - Admission Team will reach out you soon.
        `
      }
      const subject = "Qviple Inquiry Support";
      const url = `https://transemail.dove-soft.com/v2/email/send?apikey=${process.env.EMAIL_API_KEY}&subject=${subject}&to=${email}&bodyText=${message}&encodingType=0&from=connect@qviple.com&from_name=Qviple`;
      const encodeURL = encodeURI(url);
      axios
        .post(encodeURL)
        .then((res) => {
          console.log("Sended Successfully");
        })
        .catch((e) => {
          console.log("SMS API Bug", e.message);
        });
      return true;
    } else {
      console.log("18 Dev");
    }
  } catch (e) {
    console.log(e);
  }
};

exports.email_sms_designation_application = (
  email,
  name,
  appName,
  reason,
  insName
) => {
  try {
    const bool = process.env.IS_GLOBAL;
    if (bool) {
        var message = `Dear ${name}, Your admission application in ${insName} for ${appName} has been rejected due to following reason: - ${reason}
      
        Take action on given remarks and reapply for admission.
        
        Do Not Click on this below link (if click then further emails won't be delievered to you)`
      const subject = "Application Rejection";
      const url = `https://transemail.dove-soft.com/v2/email/send?apikey=${process.env.EMAIL_API_KEY}&subject=${subject}&to=${email}&bodyText=${message}&encodingType=0&from=connect@qviple.com&from_name=Qviple`;
      const encodeURL = encodeURI(url);
      axios
        .post(encodeURL)
        .then((res) => {
          console.log("Sended Successfully");
        })
        .catch((e) => {
          console.log("SMS API Bug", e.message);
        });
      return true;
    } else {
      console.log("18 Dev");
    }
  } catch (e) {
    console.log(e);
  }
};

exports.email_sms_designation_application_apply = (
  email,
  name,
  appName,
  login,
  file
) => {
  try {
    const bool = process.env.IS_GLOBAL;
    if (bool) {
      var message = `Dear ${name},
Your admission application for ${appName} have been filed successfully. Find attached herewith your admission application form and download the same.
Kindly wait till your application gets verified by admission authority.
Once your application is verified you will receive selection email on this email with applicable fees and required documents.
After selection email, visit institute with Required documents, applicable fees along with print out of admission application form attached herewith.

You can check your admission progress by logging into your account from site or Mobile Application: Qviple Your Institute Online : - For login use ${login} used while filing admission application.

View Your Admission Application Form Click here - https://qviple-dev.s3.ap-south-1.amazonaws.com/${file}
Stay updated for further updates.`
      const subject = "Application Rejection";
      const url = `https://transemail.dove-soft.com/v2/email/send?apikey=${process.env.EMAIL_API_KEY}&subject=${subject}&to=${email}&bodyText=${message}&encodingType=0&from=connect@qviple.com&from_name=Qviple`;
      const encodeURL = encodeURI(url);
      axios
        .post(encodeURL)
        .then((res) => {
          console.log("Sended Successfully");
        })
        .catch((e) => {
          console.log("SMS API Bug", e.message);
        });
      return true;
    } else {
      console.log("18 Dev");
    }
  } catch (e) {
    console.log(e);
  }
};





// console.log(designation_alarm(8787264007, "ADMISSION", "en", "", "", ""));

// const url = `https://web-wapp.in/api/send.php?number=917007023972&type=text&message=Hello&instance_id=63D7C834B820F&access_token=91e482f7e128d555b2eca66109b2ce29`;
