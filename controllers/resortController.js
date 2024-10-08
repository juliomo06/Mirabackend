const ResortModel = require('../models/resortModel')
const fs = require('fs');
const path = require('path');


const getAllResorts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;

    const resorts = await ResortModel.find()
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await ResortModel.countDocuments();

    res.json({ resorts, total, page: pageNum, limit: limitNum });
  } catch (error) {
    console.error('Error fetching resorts:', error.message);
    res.status(500).json({ message: 'Error fetching resorts', error: error.message });
  }
};

// Get a resort by ID
const getResortById = async (req, res) => {
  try {
    const resort = await ResortModel.findById(req.params.id);
    if (!resort) return res.status(404).json({ message: 'Resort not found' });
    res.json(resort);
  } catch (error) {
    console.error('Error fetching resort:', error.message);
    res.status(500).json({ message: 'Error fetching resort', error: error.message });
  }
};

// Create resort
const createResort = async (req, res) => {
  try {
    const { name, pax, priceMin, priceMax, details } = req.body;
    const moderatorId = req.user.id;

    if (!name || !pax || !priceMin || !priceMax || !details) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const images = req.files || {};
    const newResort = new ResortModel({
      name,
      pax,
      priceMin,
      priceMax,
      details,
      moderatorId: moderatorId,
      image: images.image ? `/uploads/${images.image[0].filename}` : '',
      image2: images.image2 ? `/uploads/${images.image2[0].filename}` : '',
      image3: images.image3 ? `/uploads/${images.image3[0].filename}` : '',
      image4: images.image4 ? `/uploads/${images.image4[0].filename}` : '',
      image5: images.image5 ? `/uploads/${images.image5[0].filename}` : ''
    });

    const savedResort = await newResort.save();
    res.status(201).json({ message: 'Resort created successfully', resort: savedResort });
  } catch (error) {
    console.error('Error saving resort data:', error.message);
    res.status(500).json({ message: 'Error saving resort data', error: error.message });
  }
};


// Update an existing resort
const updateResort = async (req, res) => {
  try {
    const updatedResort = await ResortModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedResort) return res.status(404).json({ message: 'Resort not found' });
    res.json({ message: 'Resort updated successfully', resort: updatedResort });
  } catch (error) {
    console.error('Error updating resort data:', error.message);
    res.status(500).json({ message: 'Error updating resort data', error: error.message });
  }
};

// Delete a resort
const deleteResort = async (req, res) => {
  try {
    const resort = await ResortModel.findById(req.params.id);
    if (!resort) return res.status(404).json({ message: 'Resort not found' });

    const resortDir = resort.name.replace(/[^a-zA-Z0-9]/g, '_');
    const resortFolderPath = path.join(__dirname, '../uploads', resortDir);

    if (fs.existsSync(resortFolderPath)) {
      fs.rm(resortFolderPath, { recursive: true, force: true }, (err) => {
        if (err) {
          console.error(`Error deleting resort directory: ${resortFolderPath}`, err);
        } else {
          console.log(`Successfully deleted resort directory: ${resortFolderPath}`);
        }
      });
    } else {
      console.log(`Resort directory not found: ${resortFolderPath}`);
    }

    await resort.deleteOne();

    res.json({ message: 'Resort and associated images deleted successfully' });
  } catch (error) {
    console.error('Error deleting resort:', error.message);
    res.status(500).json({ message: 'Error deleting resort', error: error.message });
  }
};

const getResortCount = async (req, res) => {
  try {
    const count = await ResortModel.countDocuments();
    res.json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching count" });
  }
};
const getResortsByModerator = async (req, res) => {
  try {
    const moderatorId = req.user.id;
    const resorts = await ResortModel.find({ moderatorId });
    res.status(200).json(resorts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching resorts", error: error.message });
  }
};


module.exports = {
  getResortsByModerator,
  getAllResorts,
  getResortById,
  createResort,
  updateResort,
  deleteResort,
  getResortCount
};
