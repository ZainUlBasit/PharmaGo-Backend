const SubCategory = require("../Models/SubCategory");
const { successMessage, createError } = require("../utils/ResponseMessage");

module.exports = {
  // Create new subcategory
  createSubCategory: async (req, res) => {
    try {
      const { catId, name } = req.body;
      if (!catId || !name) {
        return createError(res, 400, "Category ID and name are required");
      }
      // Check if subcategory with same name exists
      const existingSubCategory = await SubCategory.findOne({ name, catId });
      if (existingSubCategory) {
        return createError(
          res,
          409,
          "SubCategory with this name already exists"
        );
      }
      const subCategory = await SubCategory.create({ catId, name });
      return successMessage(
        res,
        subCategory,
        "Sub Category Successfully added!"
      );
    } catch (error) {
      return createError(res, 400, error.message);
    }
  },

  // Get all subcategories
  getAllSubCategories: async (req, res) => {
    try {
      const subCategories = await SubCategory.find().populate("catId");
      return successMessage(
        res,
        subCategories,
        "SubCategories fetched successfully!"
      );
    } catch (error) {
      return createError(res, 400, error.message);
    }
  },

  // Get single subcategory by ID
  getSubCategory: async (req, res) => {
    try {
      const subCategory = await SubCategory.findById(req.params.id).populate(
        "catId"
      );
      if (!subCategory) {
        return createError(res, 404, "SubCategory not found");
      }
      return successMessage(
        res,
        subCategory,
        "SubCategory fetched successfully!"
      );
    } catch (error) {
      return createError(res, 400, error.message);
    }
  },

  // Update subcategory
  updateSubCategory: async (req, res) => {
    try {
      const { id } = req.params; // Extract ID from request parameters
      const { catId, name } = req.body; // Extract update data from request body

      // Find and update the sub-category
      const subCategory = await SubCategory.findByIdAndUpdate(
        id,
        { catId, name },
        {
          new: true, // Return the updated document
          runValidators: true, // Run schema validators on update
        }
      );

      // Check if the sub-category exists
      if (!subCategory) {
        return createError(res, 404, "SubCategory not found");
      }

      // Respond with success message and updated sub-category
      return successMessage(
        res,
        subCategory,
        "SubCategory updated successfully!"
      );
    } catch (error) {
      // Handle errors and respond with error message
      return createError(res, 400, error.message);
    }
  },

  // Delete subcategory
  deleteSubCategory: async (req, res) => {
    try {
      const subCategory = await SubCategory.findByIdAndDelete(req.params.id);
      if (!subCategory) {
        return createError(res, 404, "SubCategory not found");
      }
      return successMessage(res, null, "SubCategory deleted successfully!");
    } catch (error) {
      return createError(res, 400, error.message);
    }
  },
};
