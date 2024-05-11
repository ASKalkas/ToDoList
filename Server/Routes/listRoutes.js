const express = require("express");
const router = express.Router();
const listController = require("../Conrtollers/listController");
// const authorizationMiddleware = require("../Middleware/authorizationMiddleware");


// * Create one product
router.post("/", listController.addItem);