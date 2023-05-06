// // filesystem is a node module that allows us to work with
// // the files that are stored on our pc
// const file_system = require('fs')

// // it is an npm package.this is to be required in our JS
// // file for the conversion of data to a zip file!
// const admz = require('adm-zip')

// // this is the name of specific folder which is to be
// // changed into zip file1
// var to_zip = file_system.readdirSync(__dirname + '/' + 'upload_data')

// // this is used to request the specific file and then print
// // the data in it!
// app.get('/', function (req, res) {
// 	res.sendFile(__dirname + '/' + 'index.html')

// 	// zp is created as an object of class admz() which
// 	// contains functionalities
// 	const zp = new admz();

// 	// this is the main part of our work!
// 	// here for loop check counts and passes each and every
// 	// file of our folder "upload_data"
// 	// and convert each of them to a zip!
// 	for (let k = 0; k < to_zip.length; k++) {
// 		zp.addLocalFile(__dirname + '/' + 'upload_data' + '/' + to_zip[k])
// 	}

// 	// here we assigned the name to our downloaded file!
// 	const file_after_download = 'downloaded_file.zip';

// 	// toBuffer() is used to read the data and save it
// 	// for downloading process!
// 	const data = zp.toBuffer();

// 	// this is the code for downloading!
// 	// here we have to specify 3 things:
// 	// 1. type of content that we are downloading
// 	// 2. name of file to be downloaded
// 	// 3. length or size of the downloaded file!

// 	res.set('Content-Type', 'application/octet-stream');
// 	res.set('Content-Disposition', `attachment; filename=${file_after_download}`);
// 	res.set('Content-Length', data.length);
// 	res.send(data);

// })
