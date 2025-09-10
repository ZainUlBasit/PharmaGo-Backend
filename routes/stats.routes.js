const OrderController = require("../controllers/Order-Controller");
const router = require("express").Router();

router.get("/get-card-data", OrderController.GetCardData);

module.exports = router;
