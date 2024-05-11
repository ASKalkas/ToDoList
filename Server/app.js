const express = require('express')
const cookieParser=require('cookie-parser')
const http  = require('http')
const app = express()
const path  = require('path')
const listRouter = require("./Routes/listRoutes");
const userRouter = require("./Routes/userRoutes");
const authRouter = require("./Routes/authRoutes");
const authenticationMiddleware = require("./Middleware/authenticationMiddleware");
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

app.use("/api/v1", authRouter);
app.use(authenticationMiddleware);
app.use("/api/v1/list", listRouter);
// app.use("/api/v1/users", userRouter);

app.listen(3000, () => console.log('Server is running on http://localhost:3000'));