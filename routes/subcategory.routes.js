const SubCatController = require("../controllers/SubCatController");
const router = require("express").Router();

router.post("/create", SubCatController.createSubCategory);
router.get("/all", SubCatController.getAllSubCategories);
router.patch("/update/:id", SubCatController.updateSubCategory);
router.delete("/delete/:id", SubCatController.deleteSubCategory);

module.exports = router;
