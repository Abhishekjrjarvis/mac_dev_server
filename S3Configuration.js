require("dotenv").config();
const S3 = require("aws-sdk/clients/s3");
const fs = require("fs");
const sharp = require("sharp");
const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;
const new_bucket = process.env.AWS_NEW_BUCKET_NAME;

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
});

const sharpify = async (file, width, height) => {
  try {
    const image = sharp(file.path);
    const meta = await image.metadata();
    const { format } = meta;

    const config = {
      jpeg: { quality: 100 },
      jpg: { quality: 100 },
      webp: { quality: 100 },
      png: { quality: 100 },
      svg: { quality: 100 },
    };

    const newFile = await image[format](config[format])
      .resize({
        width: width,
        height: height,
      })
      .toFormat("jpeg", { mozjpeg: true });
    return newFile;
  } catch (err) {
    throw new Error(err);
  }
};
//upload afile to s3
async function uploadFile(file, width, height) {
  // const fileStream = fs.createReadStream(file.path);
  // console.log("This is without compress", file);
  const newFile = await sharpify(file, width, height);
  // console.log("This is with compress", newFile);

  const uploadParams = {
    Bucket: bucketName,
    Body: newFile,
    Key: file.filename,
    ContentType: file.mimetype,
  };
  return s3.upload(uploadParams).promise();
}
exports.uploadFile = uploadFile;

//upload afile to s3
async function uploadVideo(file) {
  const fileStream = fs.createReadStream(file.path);
  // var extension = "";
  // if (file?.mimetype === "video/mp4") {
  //   extension = "mp4";
  // } else if (file?.mimetype === "video/quicktime") {
  //   extension = "mov";
  // }
  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: file?.originalname,
    ContentType: file?.mimetype,
  };
  return s3.upload(uploadParams).promise();
}
exports.uploadVideo = uploadVideo;

const sharpifyPost = async (file) => {
  try {
    const image = sharp(file.path);
    const meta = await image.metadata();
    const { format } = meta;
    const config = {
      jpeg: { quality: 100 },
      jpg: { quality: 100 },
      webp: { quality: 100 },
      png: { quality: 100 },
      svg: { quality: 100 },
    };

    const newFile = await image[format](config[format])
      // .resize({
      //   width: width,
      //   height: height,
      // })
      .toFormat("jpeg", {
        mozjpeg: true,
      });
    return newFile;
  } catch (err) {
    throw new Error(err);
  }
};

//upload post image file to s3
async function uploadPostImageFile(file) {
  const newFile = await sharpifyPost(file);
  const uploadParams = {
    Bucket: bucketName,
    Body: newFile,
    Key: file.filename,
    ContentType: file.mimetype,
  };
  return s3.upload(uploadParams).promise();
}
exports.uploadPostImageFile = uploadPostImageFile;

//upload afile of docs to s3
function uploadDocFile(file) {
  const fileStream = fs.createReadStream(file.path);
  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: file.originalname,
    ContentType: file.mimetype,
  };
  return s3.upload(uploadParams).promise();
}
exports.uploadDocFile = uploadDocFile;

//download a file from s3
function getFileStream(fileKey) {
  const downloadParams = {
    Key: fileKey,
    Bucket: bucketName,
  };
  return s3
    .getObject(downloadParams)
    .createReadStream()
    .on("error", (err) => {});
}

exports.getFileStream = getFileStream;

//for delete a file from s3
function deleteFile(fileKey) {
  const params = {
    Bucket: bucketName,
    Key: fileKey,
  };
  return s3.deleteObject(params).promise();
}
exports.deleteFile = deleteFile;

exports.simple_object = async (fileKey) => {
  const query_params = {
    Bucket: bucketName,
    Key: fileKey,
  };
  let file = await s3.getObject(query_params).promise();
  return file;
};

exports.uploadExcelFile = async (fileName) => {
  var file = `./export/${fileName}`;
  var value = `export-file/${fileName}`;
  fs.readFile(file, (err, data) => {
    if (err) throw err;
    const params_query = {
      Bucket: new_bucket,
      Key: `export-file/${fileName}`,
      Body: data,
    };
    s3.upload(params_query, function (s3Err, data) {
      if (s3Err) throw s3Err;
      fs.unlink(file, (err, data) => {
        if (err) throw err;
      });
    });
  });
  return value;
};

exports.uploadReceiptFile = async (fileName) => {
  var file = `./outputs/${fileName}`;
  var value = `receipt-file/${fileName}`;
  fs.readFile(file, (err, data) => {
    if (err) throw err;
    const params_query = {
      Bucket: new_bucket,
      Key: `receipt-file/${fileName}`,
      Body: data,
    };
    s3.upload(params_query, function (s3Err, data) {
      if (s3Err) throw s3Err;
      fs.unlink(file, (err, data) => {
        if (err) throw err;
      });
    });
  });
  return value;
};

//upload afile of docs to s3
function uploadOneDocFile(file) {
  const fileStream = fs.createReadStream(file.path);
  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: `chat-document/${file.filename}`,
    ContentType: file.mimetype,
  };
  return s3.upload(uploadParams).promise();
}
exports.uploadOneDocFile = uploadOneDocFile;

function uploadDocsFile(file) {
  const fileStream = fs.createReadStream(file.path);
  const uploadParams = {
    // Bucket: bucketName,
    Bucket: new_bucket,
    Body: fileStream,
    Key: file.filename,
    ContentType: file.mimetype,
  };
  return s3.upload(uploadParams).promise();
}
exports.uploadDocsFile = uploadDocsFile;

exports.rename_objects = async (ele, name) => {
  try {
    const copyObjectRequest = {
      Bucket: bucketName,
      CopySource: `/${bucketName}/${ele}`,
      Key: `${name}.jpg`,
      ContentType: "image/jpg",
    };
    var status;
    s3.copyObject(copyObjectRequest, (err, data) => {
      if (err) {
        console.log(err.message);
      } else {
        console.log("The object was renamed successfully", data);
        status = true;
        return status;
      }
    });
  } catch (e) {
    console.log(e);
  }
};
