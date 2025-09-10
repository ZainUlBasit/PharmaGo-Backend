const Cities = require("../Models/Cities");
const { successMessage, createError } = require("../utils/ResponseMessage");

const createCities = async (req, res) => {
  try {
    const { name, shipping_fee } = req.body;
    const cities = new Cities({ name, shipping_fee });
    await cities.save();
    return successMessage(res, cities, "City created successfully");
  } catch (error) {
    return createError(res, 400, error.message);
  }
};

const getAllCities = async (req, res) => {
  try {
    const cities = await Cities.find();
    return successMessage(res, cities, "Cities retrieved successfully");
  } catch (error) {
    return createError(res, 400, error.message);
  }
};

const getCityById = async (req, res) => {
  try {
    const { id } = req.params;
    const city = await Cities.findById(id);
    if (!city) {
      return createError(res, 404, "City not found");
    }
    return successMessage(res, city, "City retrieved successfully");
  } catch (error) {
    return createError(res, 400, error.message);
  }
};

const updateCity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, shipping_fee } = req.body;
    const city = await Cities.findByIdAndUpdate(
      id,
      { name, shipping_fee },
      { new: true }
    );
    if (!city) {
      return createError(res, 404, "City not found");
    }
    return successMessage(res, city, "City updated successfully");
  } catch (error) {
    return createError(res, 400, error.message);
  }
};

const deleteCity = async (req, res) => {
  try {
    const { id } = req.params;
    const city = await Cities.findByIdAndDelete(id);
    if (!city) {
      return createError(res, 404, "City not found");
    }
    return successMessage(res, null, "City deleted successfully");
  } catch (error) {
    return createError(res, 400, error.message);
  }
};

module.exports = {
  createCities,
  getAllCities,
  getCityById,
  updateCity,
  deleteCity,
};
