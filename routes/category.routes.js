const CategoryController = require("../controllers/CategoryController");
const router = require("express").Router();

router.post("/create", CategoryController.createCategory);
router.get("/all", CategoryController.getAllCategories);
router.patch("/update/:id", CategoryController.updateCategory);
router.delete("/delete/:id", CategoryController.deleteCategory);

module.exports = router;
