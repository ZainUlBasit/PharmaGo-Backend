const authControllers = require("../controllers/authControllers");
const router = require("express").Router();

router.post("/login", authControllers().login);
router.post("/register", authControllers().register);
router.get("/get-profile/:id", authControllers().getProfile);
router.patch("/update-profile/:id", authControllers().updateProfile);
router.post("/get-facial-data", authControllers().getFacialData);

module.exports = router;
