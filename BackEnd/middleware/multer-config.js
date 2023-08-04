const multer = require("multer");
const SharpMulter = require("sharp-multer");

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};


const newFilenameFunction = (og_filename, options) => {
  const extension = options.fileFormat;
  const name = og_filename.split(' ').join('_').split(".")[0];
  return name + Date.now() + '.' + extension;
};

const storage = SharpMulter({
  destination: (req, file, callback) => callback(null, "images"),

  imageOptions: {
    fileFormat: "png",
    quality: 100,
    resize: { width: 500, height: 500, resizeMode: "contain" },
  },
  // watermarkOptions:  {
  //     input:  "./images/logo.png",
  //     location:  "top-right",
  //     },
  filename: newFilenameFunction, 
});


module.exports = multer({ storage: storage }).single('image');