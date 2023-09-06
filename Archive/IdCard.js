const fs = require("fs");
const aws = require("aws-sdk");
const AdmZip = require("adm-zip");
const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;
const new_bucket = process.env.AWS_NEW_BUCKET_NAME;
var archiver = require("archiver");
const path = require("path");

async function createZipArchive(ins) {
  var output = fs.createWriteStream(`${ins}.zip`);
  var archive = archiver("zip");

  output.on("close", function () {
    console.log(archive.pointer() + " total bytes");
    console.log(
      "archiver has been finalized and the output file descriptor has closed."
    );
  });

  archive.on("error", function (err) {
    throw err;
  });

  archive.pipe(output);

  // append files from a sub-directory, putting its contents at the root of archive
  archive.directory("assets/", false);

  // append files from a sub-directory and naming it `new-subdir` within the archive
  archive.directory("subdir/", "new-subdir");

  archive.finalize();
}

exports.download_file = async (file, name, ins) => {
  const s3 = new aws.S3({ region, accessKeyId, secretAccessKey });
  var getParams = {
    Bucket: bucketName,
    Key: file,
  };
  s3.getObject(getParams, function (err, data) {
    if (err) {
      return err;
    }
    fs.writeFileSync("./assets/hello.png", data.Body);
  });
  var f_name = await createZipArchive(ins);
  var is_uploaded = await upload_folder(f_name);
  if (is_uploaded) {
    fs.rmSync(`${f_name}/`, { recursive: true, force: true });
  }
};

const upload_folder = async (folder_name) => {
  try {
    const distFolderPath = path.join(__dirname, `${folder_name}`);
    fs.readdir(distFolderPath, (err, files) => {
      if (!files || files.length === 0) {
        console.log(
          `provided folder '${distFolderPath}' is empty or does not exist.`
        );
        console.log("Make sure your project was compiled!");
        return;
      }

      // for each file in the directory
      for (const fileName of files) {
        // get the full path of the file
        const filePath = path.join(distFolderPath, fileName);

        // ignore if directory
        if (fs.lstatSync(filePath).isDirectory()) {
          continue;
        }

        // read file contents
        fs.readFile(filePath, (error, fileContent) => {
          // if unable to read file contents, throw exception
          if (error) {
            throw error;
          }

          // upload file to S3
          s3.putObject(
            {
              Bucket: config.s3BucketName,
              Key: fileName,
              Body: fileContent,
            },
            (res) => {
              console.log(`Successfully uploaded '${fileName}'!`);
            }
          );
        });
      }
    });
    return true;
  } catch (e) {
    console.log(e);
  }
};
