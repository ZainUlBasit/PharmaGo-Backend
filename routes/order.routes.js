const OrderController = require("../controllers/Order-Controller");
const router = require("express").Router();

router.post("/add-to-cart", OrderController.addItemToCartController);
router.post("/add-details", OrderController.addDetailsToOrder);
router.patch("/add-address/:id", OrderController.addAddressToOrder);
router.patch("/add-shipping/:id", OrderController.addShippingToOrder);
router.get("/cart/:order_no", OrderController.GetUserCart);
router.get("/all", OrderController.GetAllOrder);
router.patch("/checkout/:id", OrderController.updateStatusToPlaced);
router.patch("/update-qty/:order_no", OrderController.updateQtyOfItems);
router.delete("/delete/:id", OrderController.deleteOrder);
router.patch("/update-status/:id", OrderController.updateOrderStatus);
router.post("/remove-item/:id", OrderController.removeItemFromCart);
router.post("/ensure-order-numbers", OrderController.ensureOrderNumbers);

module.exports = router;
