
axios = require("axios");
const sharp = require("sharp");
const fetchImage = async (id) => {
  const image = await axios.get(
    `http://3.88.27.4/api/api/v1/all-images/${id}`,
    {
      responseType: "arraybuffer",
    }
  );
  return image.data;
};
module.exports = fetchImage;
