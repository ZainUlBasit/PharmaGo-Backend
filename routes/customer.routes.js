const CustomerController = require("../controllers/CustomerController");
const router = require("express").Router();
const multer = require("multer");

// Configure Multer (no need for local storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/add-address", CustomerController.addNewAddress);
router.get("/get-address/:id", CustomerController.getAddress);
router.patch("/update/:id", CustomerController.UpdateCustomer);
router.get("/orders/:id", CustomerController.getCustomerOrdersById);
router.get("/all", CustomerController.getAllCustomers);
router.get("/get/:id", CustomerController.getCustomerById);
router.patch("/approved/:id", CustomerController.ApprovedCustomers);
router.delete("/decline/:id", CustomerController.RejectedCustomers);
router.delete("/delete/:id", CustomerController.DeletedCustomer);
router.patch("/change-password/:id", CustomerController.ChangePassword);
router.patch(
  "/upload-profile-pciture/:id",
  upload.array("image", 2),
  CustomerController.UpdateCustomerProfilePicture
);

module.exports = router;
