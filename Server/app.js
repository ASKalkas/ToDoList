const express = require('express')
const http  = require('http')
const app = express()
const path  = require('path')
var AWS = require('aws-sdk');
const listRouter = require("./Routes/listRoutes");
const userRouter = require("./Routes/userRoutes");
const authRouter = require("./Routes/authRoutes");
require('dotenv').config();

const cors = require("cors");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser())

app.use(
    cors({
      origin: process.env.ORIGIN,
      methods: ["GET", "POST", "DELETE", "PUT"],
      credentials: true,
    })
  );

AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamoDb = new AWS.DynamoDB.DocumentClient();

app.listen(3000, () => console.log('Server is running on http://localhost:3000'));