const MediaConvertClient = require("@aws-sdk/client-mediaconvert");
// Set the account end point.
const ENDPOINT = {
  endpoint: `${process.env.AWS_MEDIA_CONVERT_ENDPOINT}`,
};
// Set the MediaConvert Service Object
const emcClient = new MediaConvertClient(ENDPOINT);
export { emcClient };
