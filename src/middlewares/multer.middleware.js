import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        //req - we get json data inside file
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
    //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    //   cb(null, file.fieldname + '-' + uniqueSuffix)
    // console.log(file)  
    cb(null, file.originalname) //simpler method(but not recommended)
    }
  })
  
  export const upload = multer({ 
    storage// storage: storage
})