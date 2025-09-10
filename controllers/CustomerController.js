const Customer = require("../Models/Customer");
const User = require("../Models/User");
const bcrypt = require("bcrypt");

const cloudinary = require("cloudinary").v2; // Import Cloudinary
// Load environment variables
require("dotenv").config(); // Ensure this line is present

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

const { createError, successMessage } = require("../utils/ResponseMessage");
const Order = require("../Models/Order");

const getAllCustomers = async (req, res) => {
  try {
    const customer = await Customer.find({});
    console.log(customer);
    return successMessage(res, customer, "Customer successfully Retrieved!");
  } catch (error) {
    return createError(res, 500, "Internal server error!");
  }
};
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    console.log(customer);
    return successMessage(res, customer, "Customer successfully Retrieved!");
  } catch (error) {
    return createError(res, 500, "Internal server error!");
  }
};
const getCustomerOrdersById = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.params.id }).populate(
      "customer"
    );
    return successMessage(
      res,
      orders,
      "Customer Order successfully Retrieved!"
    );
  } catch (error) {
    return createError(res, 500, "Internal server error!");
  }
};
const addNewAddress = async (req, res) => {
  const { customer_id, address: newAddress } = req.body;
  if (!customer_id || !newAddress) {
    return createError(res, 400, "Customer Id and Address are required!");
  }
  try {
    const customer = await Customer.findById(customer_id);
    if (!customer) {
      return createError(res, 404, "Customer not found!");
    }
    customer.address.push(newAddress);
    await customer.save();
    return successMessage(res, 200, "Address added successfully!");
  } catch (error) {
    return createError(res, 500, "Internal server error!");
  }
};
const getAddress = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return createError(res, 400, "Customer Id and Address are required!");
  }
  try {
    const customer = await Customer.findById(id);
    if (!customer) {
      return createError(res, 404, "Customer not found!");
    }
    return successMessage(res, customer, "Address added Retrieved!");
  } catch (error) {
    return createError(res, 500, "Internal server error!");
  }
};

const ApprovedCustomers = async (req, res) => {
  const { id } = req.params;
  try {
    const customers = await Customer.findByIdAndUpdate(id, {
      is_approved: true,
    });
    return successMessage(res, customers, "Customers successfully Approved!");
  } catch (error) {
    return createError(res, 500, "Internal server error!");
  }
};

const RejectedCustomers = async (req, res) => {
  const { id } = req.params;
  try {
    const customers = await Customer.findByIdAndDelete(id);
    if (!customers) {
      return createError(res, 404, "Customer not found!");
    }
    const delUser = await User.findOneAndDelete({ cust_id: customers._id });
    if (!delUser) {
      return createError(res, 404, "User not found!");
    }
    return successMessage(res, customers, "Requests successfully Rejected!");
  } catch (error) {
    return createError(res, 500, "Internal server error!");
  }
};
const DeletedCustomer = async (req, res) => {
  const { id } = req.params;
  try {
    const customers = await Customer.findByIdAndDelete(id);
    if (!customers) {
      return createError(res, 404, "Customer not found!");
    }
    const delUser = await User.findOneAndDelete({ cust_id: customers._id });
    if (!delUser) {
      return createError(res, 404, "User not found!");
    }
    return successMessage(res, customers, "User successfully Deleted!");
  } catch (error) {
    return createError(res, 500, "Internal server error!");
  }
};

const UpdateCustomer = async (req, res) => {
  const { id } = req.params;
  const { name, phoneNumber, shopName, address, password } = req.body;
  try {
    const customers = await Customer.findByIdAndUpdate(
      id,
      {
        name,
        phoneNumber,
        shopName,
        ...(address && { "address.0": address }), // Updates address[0] if `address` is provided
      },
      { new: true } // Return the updated document
    );

    if (!customers) {
      return createError(res, 404, "Customer not found!");
    }

    let uBody;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      uBody = {
        name,
        phoneNumber,
        password: hashedPassword,
      };
    } else {
      uBody = {
        name,
        phoneNumber,
      };
    }
    const updateUser = await User.findOneAndUpdate(
      { cust_id: customers._id },
      uBody,
      { new: true } // Return the updated document
    );
    if (!updateUser) {
      return createError(res, 404, "User not found!");
    }
    return successMessage(res, customers, "User successfully Update!");
  } catch (error) {
    return createError(res, 500, "Internal server error!");
  }
};

const UpdateCustomerProfilePicture = async (req, res) => {
  const { id } = req.params;
  console.log(req.files);

  if (!req.files || req.files.length === 0) {
    return createError(res, 400, "No files uploaded!");
  }

  try {
    const uploadPromises = req.files.map((file) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "profile_pics" },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result.secure_url);
            }
          }
        );
        stream.end(file.buffer); // Pipe the buffer to the upload stream
      });
    });

    const uploadedImages = await Promise.all(uploadPromises);
    console.log(uploadedImages);

    const customers = await Customer.findByIdAndUpdate(
      id,
      {
        profile_pic: uploadedImages[0],
      },
      { new: true } // Return the updated document
    );

    if (!customers) {
      return createError(res, 404, "Customer not found!");
    }
    return successMessage(res, customers, "User successfully Update!");
  } catch (error) {
    return createError(res, 500, "Internal server error!");
  }
};
const ChangePassword = async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  if (!password) {
    return createError(res, 400, "Password required!");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const customers = await User.findOneAndUpdate(
      { cust_id: id },
      {
        password: hashedPassword,
      },
      { new: true } // Return the updated document
    );
    if (!customers) {
      return createError(res, 404, "User not found!");
    }
    return successMessage(res, customers, "User successfully Update!");
  } catch (error) {
    return createError(res, 500, "Internal server error!");
  }
};

module.exports = {
  addNewAddress,
  getAllCustomers,
  getCustomerById,
  getCustomerOrdersById,
  ApprovedCustomers,
  RejectedCustomers,
  getAddress,
  DeletedCustomer,
  UpdateCustomer,
  ChangePassword,
  UpdateCustomerProfilePicture,
};
