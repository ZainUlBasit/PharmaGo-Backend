const { default: mongoose } = require("mongoose");
const Product = require("../Models/Product");
const { createError, successMessage } = require("../utils/ResponseMessage");
const fs = require("fs");
const path = require("path");
const { log } = require("console");
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

const createProduct = async (req, res) => {
  console.log("Received files:", req.files);

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No files uploaded!",
    });
  }

  const { name, cat_id, desc, video, cost, price, colors, qty } = req.body;

  // Validation
  if (!name || typeof name !== "string")
    return createError(res, 400, "Invalid or missing product name.");
  if (cat_id && !mongoose.Types.ObjectId.isValid(cat_id))
    return createError(res, 400, "Invalid cat_id.");
  if (!desc || typeof desc !== "string")
    return createError(res, 400, "Invalid or missing description.");
  if (video && typeof video !== "string")
    return createError(res, 400, "Invalid video format.");
  if (!cost || Number(cost) < 0)
    return createError(res, 400, "Invalid or missing cost.");
  if (!price || Number(price) < 0)
    return createError(res, 400, "Invalid or missing price.");
  if (!qty || Number(qty) < 0)
    return createError(res, 400, "Invalid or missing quantity.");
  let parsedColors;
  try {
    parsedColors = JSON.parse(colors);
    if (!Array.isArray(parsedColors))
      throw new Error("Colors should be an array.");
  } catch (err) {
    return createError(res, 400, "Invalid colors array.");
  }

  try {
    // Upload files to Cloudinary using buffer streams
    const uploadPromises = req.files.map((file) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "products" },
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

    const payload = {
      name,
      cat_id,
      desc,
      images: uploadedImages,
      video,
      cost: Number(cost),
      price: Number(price),
      colors: parsedColors,
      qty: Number(qty),
    };

    // Create a new product instance
    const product = new Product(payload);

    // Save the product to the database
    const savedProduct = await product.save();

    return successMessage(res, savedProduct, "Product created successfully.");
  } catch (error) {
    console.error("Error creating product:", error);
    return createError(res, 500, "Internal server error.");
  }
};

// Get all products or filter based on query params

const getAllProducts = async (req, res) => {
  try {
    // Build query filters dynamically
    const products = await Product.find({}).populate("cat_id");
    return successMessage(res, products, "Products fetched successfully.");
  } catch (error) {
    console.error("Error fetching products:", error);
    return createError(res, 500, "Error fetching products.");
  }
};

// Get a single product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return createError(res, 404, "Product not found.");
    }

    return successMessage(res, product, "Product fetched successfully.");
  } catch (error) {
    console.error("Error fetching product:", error);
    return createError(res, 500, "Error fetching product.");
  }
};

// Update a product by ID
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, cat_id, desc, video, cost, price, colors, qty } = req.body;

    // Validation
    if (name && typeof name !== "string")
      return createError(res, 400, "Invalid product name.");
    if (cat_id && !mongoose.Types.ObjectId.isValid(cat_id))
      return createError(res, 400, "Invalid cat_id.");
    if (desc && typeof desc !== "string")
      return createError(res, 400, "Invalid description.");
    if (video && typeof video !== "string")
      return createError(res, 400, "Invalid video format.");
    if (cost && Number(cost) < 0) return createError(res, 400, "Invalid cost.");
    if (price && Number(price) < 0)
      return createError(res, 400, "Invalid price.");
    if (qty && Number(qty) < 0)
      return createError(res, 400, "Invalid quantity.");

    const product = await Product.findById(id);
    if (!product) {
      return createError(res, 404, "Product not found.");
    }

    const { deletedImages } = req.body;
    const updatedImages = Array.isArray(deletedImages)
      ? product.images.filter((image) => !deletedImages.includes(image))
      : product.images.filter((image) => image !== deletedImages);
    console.log("updatedImages", updatedImages);

    // Build update payload
    const updatePayload = {};
    if (name) updatePayload.name = name;
    if (cat_id) updatePayload.cat_id = cat_id;
    if (desc) updatePayload.desc = desc;
    if (video) updatePayload.video = video;
    if (cost) updatePayload.cost = Number(cost);
    if (price) updatePayload.price = Number(price);
    if (qty) updatePayload.qty = Number(qty);
    if (updatedImages) updatePayload.images = updatedImages;

    console.log(updatePayload);
    // return createError(res, 400, "Product updated successfully.");

    // Handle file uploads if new images are provided
    if (req.files && req.files.length > 0) {
      // Upload new files to Cloudinary
      const uploadPromises = req.files.map((file) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "products" },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result.secure_url);
              }
            }
          );
          stream.end(file.buffer);
        });
      });

      const uploadedImages = await Promise.all(uploadPromises);
      updatePayload.images = [...updatedImages, ...uploadedImages];
    } else {
      updatePayload.images = [...updatedImages];
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        ...updatePayload,
        images: updatePayload.images,
      },
      {
        new: true, // Return the updated document
        runValidators: true, // Ensure validation rules are applied
      }
    );

    if (!updatedProduct) {
      return createError(res, 404, "Product not found.");
    }

    return successMessage(res, updatedProduct, "Product updated successfully.");
  } catch (error) {
    console.error("Error updating product:", error);
    return createError(res, 500, "Error updating product.");
  }
};

// Delete a product by ID
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the product to retrieve image URLs
    const product = await Product.findById(id);
    if (!product) {
      return createError(res, 404, "Product not found.");
    }

    // Extract image URLs from the product
    const { images } = product;

    // Delete images from Cloudinary
    const deleteImagePromises = images.map((imageUrl) => {
      // Extract the public ID from the image URL
      const publicId = imageUrl.split("/").slice(-1)[0].split(".")[0];
      return cloudinary.uploader.destroy(`uploads/${publicId}`);
    });

    await Promise.all(deleteImagePromises);

    // Delete the product from the database
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return createError(res, 404, "Product not found.");
    }

    return successMessage(
      res,
      deletedProduct,
      "Product and its images deleted successfully."
    );
  } catch (error) {
    console.error("Error deleting product and images:", error);
    return createError(res, 500, "Error deleting product and images.");
  }
};

const updateProductStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (status !== 1 && status !== 2) {
    return createError(res, 400, "Invalid status.");
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );
  if (!updatedProduct) {
    return createError(res, 404, "Product not found.");
  }

  return successMessage(
    res,
    updatedProduct,
    "Product status updated successfully."
  );
};

const updateProductImages = async (req, res) => {
  console.log(req.files);
  try {
    if (!req.files || req.files.length === 0) {
      return createError(res, 400, "No files uploaded!");
    }
    const uploadPromises = req.files.map((file) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "products" },
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

    if (!uploadedImages) {
      return createError(res, 404, "Product images not added!");
    }

    return successMessage(
      res,
      uploadedImages,
      "Product images added successfully."
    );
  } catch (error) {
    console.error("Error updating product images:", error);
    return createError(res, 500, "Error updating product images.");
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateProductStatus,
  updateProductImages,
};
