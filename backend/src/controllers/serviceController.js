const { validationResult } = require('express-validator');
const Service = require('../models/Service');
const logger = require('../utils/logger');

// @desc    Get all active services (public)
// @route   GET /api/services
const getServices = async (req, res, next) => {
  try {
    const filter = { isActive: true };
    if (req.query.category) filter.category = req.query.category;

    const services = await Service.find(filter).sort({ category: 1, name: 1 });

    // Group by category
    const grouped = services.reduce((acc, service) => {
      if (!acc[service.category]) acc[service.category] = [];
      acc[service.category].push(service);
      return acc;
    }, {});

    res.json({ success: true, services, grouped });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single service
// @route   GET /api/services/:id
const getService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.json({ success: true, service });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Create service
// @route   POST /api/services
const createService = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const service = await Service.create(req.body);
    logger.info(`Service created: ${service.name}`);
    res.status(201).json({ success: true, service });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update service
// @route   PUT /api/services/:id
const updateService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    logger.info(`Service updated: ${service.name}`);
    res.json({ success: true, service });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Delete service
// @route   DELETE /api/services/:id
const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    logger.info(`Service deleted: ${service.name}`);
    res.json({ success: true, message: 'Service deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get all services including inactive
// @route   GET /api/services/admin/all
const getAllServicesAdmin = async (req, res, next) => {
  try {
    const services = await Service.find().sort({ category: 1, name: 1 });
    res.json({ success: true, services });
  } catch (error) {
    next(error);
  }
};

module.exports = { getServices, getService, createService, updateService, deleteService, getAllServicesAdmin };
