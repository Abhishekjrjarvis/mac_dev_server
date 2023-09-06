const fs = require("fs");
const aws = require("aws-sdk");
const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;
var archiver = require("archiver");
const path = require("path");

var s3 = new aws.S3({ region, accessKeyId, secretAccessKey });

exports.createZipArchive = async (ins) => {
  var output = fs.createWriteStream(`${ins}.zip`);
  var archive = archiver("zip");

  output.on("close", function () {
    console.log(archive.pointer() + " total bytes");
  });

  archive.on("error", function (err) {
    throw err;
  });

  archive.pipe(output);
  archive.directory("assets/", false);
  archive.directory("subdir/", "new-subdir");

  archive.finalize();
  return `${ins}.zip`;
};

exports.download_file = async (file, name, ins) => {
  var getParams = {
    Bucket: bucketName,
    Key: file,
  };
  s3.getObject(getParams, function (err, data) {
    if (err) {
      return err;
    }
    fs.writeFileSync(`./assets/${name}.png`, data.Body);
  });
  // await createZipArchive(ins);
};

exports.next_call = async (f_name) => {
  var is_uploaded = await upload_folder(f_name);
};

exports.remove_call = async (f_name) => {
  const distFolderPath = path.join(__dirname, `../${f_name}`);
  fs.rmSync(distFolderPath, { recursive: true, force: true });
};

const upload_folder = async (folder_name) => {
  try {
    const readStream = fs.createReadStream(`${folder_name}`);
    s3.putObject(
      {
        Bucket: bucketName,
        Key: folder_name,
        Body: readStream,
      },
      (err, data) => {
        if (err) {
          console.log(err);
        } else {
          console.log("The zip file was uploaded successfully.");
          readStream.close();
          return true;
        }
      }
    );
  } catch (e) {
    console.log(e);
  }
};

exports.remove_assets = async () => {
  try {
    const directory = "assets";

    fs.readdir(directory, (err, files) => {
      if (err) throw err;

      for (const file of files) {
        fs.unlink(path.join(directory, file), (err) => {
          if (err) throw err;
        });
      }
    });
  } catch (e) {
    console.log(e);
  }
};
