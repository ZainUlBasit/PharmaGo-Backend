const ProductController = require("../controllers/Product-Controller");
const router = require("express").Router();
const multer = require("multer");

// Configure Multer (no need for local storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// const upload = multer();

router.post(
  "/create",
  upload.array("images", 10),
  ProductController.createProduct
);
router.get("/all", ProductController.getAllProducts);
router.get("/:id", ProductController.getProductById);
router.patch(
  "/update/:id",
  upload.array("images", 10),
  ProductController.updateProduct
);
router.post(
  "/update-images",
  upload.array("images", 10),
  ProductController.updateProductImages
);
router.patch("/update-status/:id", ProductController.updateProductStatus);
router.delete("/delete/:id", ProductController.deleteProduct);

module.exports = router;
