require("dotenv").config();

axios = require("axios");

const obj = {
  DEV: "https://qviple-development.s3.ap-south-1.amazonaws.com",
  PROD: "https://qviple-dev.s3.ap-south-1.amazonaws.com",
  OTHER: false,
};

const cdnDynamicImages = async (urlType, key = "", url = "") => {
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
module.exports = cdnDynamicImages;

