const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/')  // make sure this folder exists
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });

const userController = require("../Controllers/userController");

// * login
router.post("/login",userController.login );
// * register
router.post("/register", upload.single('photo'), userController.register);

module.exports = router;