// Importing the Category model and utility functions
const Category = require("../Models/Category");
const { createError, successMessage } = require("../utils/ResponseMessage");

// Function to handle category creation
const createCategory = async (req, res) => {
  const { name } = req.body;
  try {
    // Check if a category with the same name already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return createError(res, 409, "Category with this name already exists.");
    }
    // Create a new category if it doesn't exist
    const category = new Category({ name });
    await category.save();
    return successMessage(res, category, "New Category Successfully added!");
  } catch (error) {
    return createError(res, 500, error.message);
  }
};

// Function to retrieve all categories
const getAllCategories = async (req, res) => {
  try {
    // Fetch all categories from the database
    const categories = await Category.find();
    return successMessage(res, categories, "Categories fetched successfully!");
  } catch (error) {
    return createError(res, 500, error.message);
  }
};

// Function to update a category by its ID
const updateCategory = async (req, res) => {
  try {
    // Extract the category ID from the request parameters
    const { id } = req.params;
    const { name } = req.body;
    // Update the category with the provided ID
    const category = await Category.findByIdAndUpdate(
      id,
      { name },
      {
        new: true,
      }
    );
    // Check if the category was found and updated
    if (!category) {
      return createError(res, 404, "Category not found");
    }
    return successMessage(res, category, "Category updated successfully!");
  } catch (error) {
    return createError(res, 400, error.message);
  }
};

// Function to delete a category by its ID
const deleteCategory = async (req, res) => {
  try {
    // Extract the category ID from the request parameters
    const { id } = req.params;
    // Delete the category with the provided ID
    const category = await Category.findByIdAndDelete(id);
    // Check if the category was found and deleted
    if (!category) {
      return createError(res, 404, "Category not found");
    }
    return successMessage(res, null, "Category deleted successfully!");
  } catch (error) {
    return createError(res, 500, error.message);
  }
};

// Exporting the controller functions
module.exports = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
};
