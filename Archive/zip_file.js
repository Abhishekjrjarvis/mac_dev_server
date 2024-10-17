const AWS = require("aws-sdk");
const fs = require("fs");
const archiver = require("archiver");
const express = require("express");
const app = express();
const path = require("path");
var bucketName = process.env.AWS_BUCKET_NAME;
var region = process.env.AWS_BUCKET_REGION;
var accessKeyId = process.env.AWS_ACCESS_KEY;
var secretAccessKey = process.env.AWS_SECRET_KEY;
var new_bucket = process.env.AWS_NEW_BUCKET_NAME;
const Student = require("../models/Student");
const InstituteAdmin = require("../models/InstituteAdmin");

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY, // Your AWS access key
  secretAccessKey: process.env.AWS_SECRET_KEY, // Your AWS secret key
  region: process.env.AWS_BUCKET_REGION, // Your AWS region
});

const s3 = new AWS.S3();

const downloadFileFromS3 = async (bucketName, key) => {
  const params = {
    Bucket: bucketName,
    Key: key,
  };

  return new Promise((resolve, reject) => {
    s3.getObject(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.Body); // This is the file's data
      }
    });
  });
};

const createZipOfFiles = async (bucketName, fileKeys, zipFilePath) => {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    output.on("close", () => {
      //   console.log(`Zip file size: ${archive.pointer()} bytes`);
      resolve(zipFilePath);
    });

    archive.on("error", (err) => {
      reject(err);
    });

    archive.pipe(output);
    Promise.all(
      fileKeys.map(async (key) => {
        const fileData = await downloadFileFromS3(bucketName, key?.old_key);
        archive.append(fileData, { name: `${key?.new_key}.jpg` });
      })
    )
      .then(() => {
        archive.finalize();
      })
      .catch((error) => {
        reject(error);
      });
  });
};
const uploadFileToS3 = async (filePath, bucketName, key) => {
  const fileContent = fs.readFileSync(filePath);

  const params = {
    Bucket: bucketName,
    Key: key,
    Body: fileContent,
    ContentType: "application/zip",
  };

  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

const key_exists = async (key, bucketName) => {
  try {
    const params = {
      Bucket: bucketName,
      Key: key,
    };
    await s3.headObject(params).promise();
    // console.log(`The key "${key}" exists in the bucket "${bucketName}".`);
    return true;
  } catch (error) {
    if (error.code === "NotFound") {
      console.log(
        `The key "${key}" does not exist in the bucket "${bucketName}".`
      );
    } else {
      console.error("An error occurred while checking the key:", error);
    }
    return false;
  }
};

exports.download_zip_file = async (req, res) => {
  try {
    const { id } = req?.params;
    const { request } = req?.body;
    var bucketName = process.env.AWS_BUCKET_NAME;
    const ins = await InstituteAdmin.findById({
      _id: id,
    }).select("insName export_collection export_collection_count");
    const all_student = await Student.find({
      studentClass: { $in: request },
    }).select(
      "studentProfilePhoto studentFirstName studentMiddleName studentFatherName studentLastName studentGRNO"
    );

    const zipFileName = `${ins?.insName}-photo-${new Date().getTime()}.zip`;
    const zipFilePath = path.join(__dirname, zipFileName);

    res.status(200).send({
      message: "Explore All Student Profile Photo",
      // uploadResult
    });
    let fileKeys = [];
    for (let ele of all_student) {
      console.log(ele?._id);
      if (ele?.studentProfilePhoto) {
        let value = await key_exists(ele?.studentProfilePhoto, bucketName);
        if (value) {
          fileKeys.push({
            old_key: ele?.studentProfilePhoto,
            new_key: `${ele?.studentFirstName} ${
              ele?.studentMiddleName ?? ele?.studentFatherName
            } ${ele?.studentLastName}_${ele?.studentGRNO}`,
          });
        } else {
        }
      }
    }

    await createZipOfFiles(bucketName, fileKeys, zipFilePath);

    const uploadKey = `zipped/${zipFileName}`;
    const uploadResult = await uploadFileToS3(
      zipFilePath,
      bucketName,
      uploadKey
    );
    // console.log(uploadResult);
    if (uploadResult?.Key) {
      ins.export_collection.push({
        excel_file: uploadResult?.Key,
        excel_file_name: zipFileName,
      });
      ins.export_collection_count += 1;
      await ins.save();
    }

    if (uploadResult?.Key) {
      fs.unlink(zipFilePath, (err) => {
        if (err) {
          console.error(`Error removing file: ${err}`);
        } else {
        }
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("An error occurred while downloading the file.");
  }
};
