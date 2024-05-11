const express = require("express");
const router = express.Router();
const listController = require("../Controllers/listController");
const authorizationMiddleware = require("../Middleware/authorizationMiddleware");


// * Create one product
router.post("/",  authorizationMiddleware(['admin','user']), listController.addItem);
router.get("/", authorizationMiddleware(['admin','user']), listController.getAll);
module.exports = router;