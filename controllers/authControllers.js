const Joi = require("joi");
const bcrypt = require("bcrypt");
const User = require("../Models/User");
const jwt = require("jsonwebtoken");
const { createError, successMessage } = require("../utils/ResponseMessage");
const Customer = require("../Models/Customer");
const privateKey = process.env.ACCESS_SECRET_KEY;

function authControllers() {
  return {
    login: async (req, res) => {
      try {
        // validate the req
        const loginSchema = Joi.object({
          phoneNumber: Joi.string().required(),
          password: Joi.string().required(),
        });

        const { error } = loginSchema.validate(req.body);
        if (error) return createError(res, 422, error.message);

        // check useremail
        const { phoneNumber, password } = req.body;
        const user = await User.findOne({ phoneNumber }).populate("cust_id");
        if (!user) return createError(res, 422, "No such email registered!");

        if (user.role === 2) {
          const isCustomerApproved = user.cust_id.is_approved;
          if (!isCustomerApproved)
            return createError(res, 403, "Customer not approved!");
        }

        // check user password using bcrypt
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
          return createError(res, 403, "email or password doesn't match!");

        delete user.password;

        var token = await jwt.sign(
          {
            _id: user._id,
            role: user.role,
            user: user,
          },
          privateKey
        );

        res.cookie("userToken", token, {
          // maxAge: 60000000,
          httpOnly: true,
          sameSite: "none",
          secure: true,
        });

        return successMessage(res, { user, token }, "Successfully Logged In!");
      } catch (error) {
        return createError(res, error.status, error.message);
      }
    },
    // Handles user registration
    register: async (req, res) => {
      // Extracting user details from request body
      const { name, password, confirmPassword, role } = req.body;
      let registerSchema;
      if (role === 2) {
        registerSchema = Joi.object({
          name: Joi.string().required(), // Name is required
          password: Joi.string()
            .pattern(new RegExp("^[a-zA-Z0-9]{5,15}$")) // Password must include alphabets and numbers
            .required() // Password is required
            .min(8) // Minimum length of password is 8 characters
            .max(15) // Maximum length of password is 15 characters
            .messages({
              "string.pattern.base":
                "Password must include alphabets and numbers",
              "string.min": "Password must be minimum 8 character required",
              "string.max": "Password must be upto 15 characters ",
            }),
          confirmPassword: Joi.ref("password"), // Confirm password must match the password
          role: Joi.number().valid(1, 2).required(), // Role is required and must be either 1 or 2
          shopName: Joi.string().required(), // Shop name is required
          phoneNumber: Joi.string().required(), // Phone number is required
          address: Joi.string().required(), // Address is required
        });
      } else {
        registerSchema = Joi.object({
          name: Joi.string().required(), // Name is required
          phoneNumber: Joi.string().required(), // Phone number is required
          password: Joi.string()
            .pattern(new RegExp("^[a-zA-Z0-9]{5,15}$")) // Password must include alphabets and numbers
            .required() // Password is required
            .min(8) // Minimum length of password is 8 characters
            .max(15) // Maximum length of password is 15 characters
            .messages({
              "string.pattern.base":
                "Password must include alphabets and numbers",
              "string.min": "Password must be minimum 8 character required",
              "string.max": "Password must be upto 15 characters ",
            }),
          confirmPassword: Joi.ref("password"), // Confirm password must match the password
          role: Joi.number().valid(1, 2).required(), // Role is required and must be either 1 or 2
        });
      }
      // Validating the request body against the schema
      const { error } = registerSchema.validate(req.body);
      if (error) {
        return createError(res, 400, error.details[0].message);
      }

      // Checking if a user with the same email already exists
      const userExists = await User.exists({
        phoneNumber: req.body.phoneNumber,
      });
      if (userExists)
        return createError(res, 409, "Mobile Number already registered");
      // Checking if the password and confirm password match
      if (password !== confirmPassword)
        return createError(res, 422, "Password not matching");
      // Handling registration for admin role
      else if (role === 1) {
        // Hashing the password for security
        const hashedPassword = await bcrypt.hash(password, 10);
        // Creating a new admin user
        const createAdmin = new User({
          name,
          phoneNumber: req.body.phoneNumber,
          password: hashedPassword,
          role,
        });
        // Saving the admin user to the database
        const isAdminSaved = await createAdmin.save();
        if (!isAdminSaved)
          return createError(
            res,
            500,
            "Internal server error.Could not register user"
          );
        // Sending a success message if the admin user is saved successfully
        return successMessage(
          res,
          createAdmin,
          `${name} successfully registered!`
        );
      } // Handling registration for customer role
      else if (role === 2) {
        // Extracting customer specific details from the request body
        const { name, shopName, phoneNumber, address } = req.body;
        // Creating a new customer
        const createCustomer = new Customer({
          name,
          shopName,
          phoneNumber,
          address: [address],
          signed_up_at: Math.floor(Date.now() / 1000),
        });
        // Saving the customer to the database
        const isCustomerCreated = await createCustomer.save();
        if (!isCustomerCreated)
          return createError(
            res,
            500,
            "Internal server error.Could not register user"
          );
        // Hashing the password for security
        const hashedPassword = await bcrypt.hash(password, 10);
        // Preparing the payload for the customer user
        const payload = role === 2 && {
          name,
          phoneNumber,
          password: hashedPassword,
          role,
          cust_id: createCustomer._id,
        };

        // Creating a new user for the customer
        const createCustomerUser = new User(payload);
        // Saving the customer user to the database
        const isCustomerUserSaved = await createCustomerUser.save();
        if (!isCustomerUserSaved)
          return createError(
            res,
            500,
            "Internal server error.Could not register user"
          );
        // Sending a success message if the customer user is saved successfully
        return successMessage(
          res,
          createCustomerUser,
          `${name} successfully registered!`
        );
      } else {
        // Handling invalid role
        return createError(res, 400, "Invalid role");
      }
    },
    updateProfile: async (req, res) => {
      try {
        const { id } = req.params;
        const { name, phoneNumber, password, confirmPassword, shipping } =
          req.body;
        const user = await User.findById(id);
        if (!user) return createError(res, 404, "User not found");
        user.name = name;
        user.phoneNumber = phoneNumber;
        if (password) {
          const hashedPassword = await bcrypt.hash(password, 10);
          user.password = hashedPassword;
        }
        user.shipping = shipping;
        await user.save();
        return successMessage(res, user, "Profile updated successfully");
      } catch (error) {
        return createError(res, error.status, error.message);
      }
    },
    getProfile: async (req, res) => {
      try {
        const { id } = req.params;
        console.log(id);

        let user;
        if (id === "undefined" || id === undefined) {
          user = await User.findOne({ role: 1 });
        } else if (id && (id !== "undefined" || id !== undefined)) {
          user = await User.findById(id);
        } else {
          user = await User.findOne({ role: 1 });
        }

        return successMessage(res, user, "Profile fetched successfully");
      } catch (error) {
        console.log(error);
        return createError(res, error.status, error.message);
      }
    },
    getFacialData: async (req, res) => {
      try {
        console.log("Checking Data..............");
        console.log(req.body);
        console.log(
          "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
        );

        return successMessage(res, "Facial data fetched successfully");
      } catch (error) {
        return createError(res, error.status, error.message);
      }
    },
  };
}

module.exports = authControllers;
