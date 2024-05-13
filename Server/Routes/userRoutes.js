const express = require("express");
const router = express.Router();
const authorizationMiddleware = require("../Middleware/authorizationMiddleware");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "uploads/"); // make sure this folder exists
	},
	filename: function (req, file, cb) {
		cb(
			null,
			file.fieldname + "-" + Date.now() + path.extname("file.originalname")
		);
	},
});

const upload = multer({ storage: storage });
const userController = require("../Controllers/userController");

// logout
router.delete(
	"/logout",
	authorizationMiddleware(["admin", "user"]),
	userController.logout
);
// getProfile
router.get(
	"/profile",
	authorizationMiddleware(["admin", "user"]),
	userController.getProfile
);
// updateProfile
router.put(
	"/profile",
	authorizationMiddleware(["admin", "user"]),
	userController.updateProfile
);
// updateProfilePicture
router.put(
	"/profilePicture",
	authorizationMiddleware(["admin", "user"]),
	upload.single("photo"),
	userController.updateProfilePicture
);
// getUsers
router.get(
	"/",
	authorizationMiddleware(["admin"]),
	userController.getUsers
);
// deleteUser
router.delete(
	"/",
	authorizationMiddleware(["admin"]),
	userController.deleteUser
);

module.exports = router;
