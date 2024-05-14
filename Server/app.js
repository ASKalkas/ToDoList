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

const _dirname = path.dirname("")
const buildPath = path.join(_dirname  , "../Client/build");

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
app.use("/api/v1/users", userRouter);

app.use(express.static(buildPath))

app.get("/*", function(req, res){
  
  res.sendFile(
    path.join(__dirname, "../Client/build/index.html"),
    function (err) {
      if (err) {
        res.status(500).send(err);
      }
    }
  );
  
})

app.listen(3000, () => console.log('Server is running on http://localhost:3000'));