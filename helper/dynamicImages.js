require("dotenv").config();

const axios = require("axios");
const obj = {
  DEV: "http://44.197.120.176/api/api/v1/all-images",
  PROD: "https://qviple-dev.s3.ap-south-1.amazonaws.com",
  OTHER: false,
};

const dynamicImages = async (urlType, key = "", url = "") => {
  try {
    const response = await axios.get(
      urlType ? `${obj[process.env.CONNECT_DB]}/${key}` : url,
      {
        responseType: "arraybuffer",
      }
    );
    return response?.data;
  } catch (e) {
    console.log(e);
  }
};
module.exports = dynamicImages;
