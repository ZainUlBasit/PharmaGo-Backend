const CitiesController = require("../controllers/CitiesController");
const router = require("express").Router();

router.post("/create", CitiesController.createCities);
router.get("/all", CitiesController.getAllCities);
router.patch("/update/:id", CitiesController.updateCity);
router.delete("/delete/:id", CitiesController.deleteCity);

module.exports = router;
