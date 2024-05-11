
axios = require("axios");
const sharp = require("sharp");
const fetchImage = async (id) => {
  const image = await axios.get(
    `https://d3dqpu54js2vfl.cloudfront.net/${id}`,
    {
      responseType: "arraybuffer",
    }
  );
  return image.data;
};
module.exports = fetchImage;
