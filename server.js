require("dotenv").config();
const express = require("express");
const port = process.env.PORT || 8000;
const cloudinary = require("cloudinary").v2;
const bodyParser = require("body-parser");
const http = require("http");
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

const app = express();
const server = http.createServer(app);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:5173",
      "http://localhost:5176",
      "http://localhost:5177",
      "http://localhost:5178",
      "https://admin-pharma-go.vercel.app",
      "https://pharma-go-frontend.vercel.app",
      "https://pharmago.com.pk",
      "https://www.pharmago.com.pk",
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

// Middleware to log headers and body
// app.use((req, res, next) => {
//   console.log("Request URL:", req.originalUrl);
//   console.log("Headers:", req.headers);
//   console.log("Body:", req.body);
//   next();
// });

// hike

// Database connection
mongoose
  .connect(process.env.mongooseUrl, { useUnifiedTopology: true })
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });

// Routes
const AuthRoutes = require("./routes/auth.routes");
const CitiesRoutes = require("./routes/cities.routes");
const CustomerRoutes = require("./routes/customer.routes");
const CategoryRoutes = require("./routes/category.routes");
const SubCategoryRoutes = require("./routes/subcategory.routes");
const OrderRoutes = require("./routes/order.routes");
const ProductRoutes = require("./routes/product.routes");
const StatsRoutes = require("./routes/stats.routes");
const TopSellingRoutes = require("./routes/topSelling.routes");

app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is working properly" });
});



app.use("/api/auth", AuthRoutes);
app.use("/api/cities", CitiesRoutes);
app.use("/api/customer", CustomerRoutes);
app.use("/api/category", CategoryRoutes);
app.use("/api/sub-category", SubCategoryRoutes);
app.use("/api/order", OrderRoutes);
app.use("/api/product", ProductRoutes);
app.use("/api/stats", StatsRoutes);
app.use("/api/top-selling", TopSellingRoutes);

// Server setup
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
