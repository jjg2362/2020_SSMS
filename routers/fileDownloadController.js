//fileDownload controller

//use path
var path = require('path');

var fs = require('fs');
var rimraf = require('rimraf')
//file download
exports.getFileDownload = (req, res) => {
  var fileFolder = req.params.fileFolder;
  var fileName = req.params.fileName;

  res.download('public/' + '/' + fileFolder + '/' + fileName, fileName);
};


//file download
exports.getFileDownloadWant = (req, res) => {
    const fileFolder = req.params.fileFolder;
    const fileName = req.params.fileName;
    let fullPath = 'public/' + '/' + fileFolder + '/' + fileName;
    
    res.download(fullPath, fileName.substring(14), function(err) {
        if(err) {
            fullPath = "/2018ssmsdata/ssms/" + fullPath;
            res.download(fullPath, fileName.substring(14));
        } else {
            console.log(fullPath);
        }        
    });
};

exports.getFileDownloadWantTest = (req, res) => {
    let firstFolder = req.params.firstFolder;
    var fileFolder = req.params.fileFolder;
    var fileName = req.params.fileName;
    let fullPath = firstFolder + '/' + fileFolder + '/' + fileName;
    if(firstFolder === 'ssmsdata')
        fullPath = '/' + fullPath;
console.log(fullPath);
    res.download(fullPath, fileName.substring(14));
};

exports.getFileDownloadTransferedFile = (req, res) => {
  console.log('download transfer file')
    var fileFolder = req.params.fileFolder;
    var fileName = req.params.fileName;
    var zipPath = '/home/dev/sd/public/'+fileFolder+'/'+fileName;
    var dirPath = zipPath.split('.zip')[0]

    // var file = fs.createWriteStream(zipPath);
    // file.pipe(res)
    // file.on('finish',function(){
    //   console.log('delete files');
    //   fs.unlink(zipPath);
    //   fs.unlink(dirPath);
    //   file.close(cb);
    // });
    //
    res.on('finish',function(){
        console.log('delete transfered file')
        if(fs.existsSync(zipPath)){
            fs.unlinkSync(zipPath);
            rimraf(dirPath, function () { console.log('done'); });
        }
    })

    res.download('public/' + '/' + fileFolder + '/' + fileName, fileName);



};
