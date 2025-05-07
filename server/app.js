const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const passportMiddleware = require("./middlewares/passport");
const { checkConnection } = require("./controllers/userController");
const passport = require("passport");
const cors = require("cors");

const app = express();

// config
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: "server/config/config.env" });
}

const corsOptions = {
  origin: "http://localhost:3000", // Only allow requests from this origin
  methods: "GET,POST", // Allow these HTTP methods
  allowedHeaders: "Content-Type, Authorization", // Allow these headers
};

// Use CORS with the specified options
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(passport.initialize());
passportMiddleware(passport);
checkConnection();

const user = require("./routes/userRoute");
const product = require("./routes/productRoute");
const order = require("./routes/orderRoute");
const payment = require("./routes/paymentRoute");

app.use("/api/v1", user);
app.use("/api/v1", product);
app.use("/api/v1", order);
app.use("/api/v1", payment);

// deployment
__dirname = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("Server is Running! 🚀");
  });
}

// error middleware
// app.use(errorMiddleware);

module.exports = app;
