const Banner = require("../models/Banner");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const bucket = require("../gcs"); // adjust path as needed

exports.createBanner = async (req, res) => {
  try {
    const { title, sub_title, status } = req.body;
    let image_url = "";

    if (req.file) {
      const localPath = req.file.path;
      const ext = path.extname(req.file.originalname);
      const gcsFileName = `banner/${uuidv4()}${ext}`;
      const file = bucket.file(gcsFileName);

      await bucket.upload(localPath, {
        destination: gcsFileName,
        resumable: false,
        public: true,
        metadata: {
          contentType: req.file.mimetype,
        },
      });

      image_url = `https://storage.googleapis.com/${bucket.name}/${gcsFileName}`;
      fs.unlinkSync(localPath); // delete local file after upload
    }

    const banner = new Banner({ image_url, title, sub_title, status });
    await banner.save();

    res.status(201).json({ success: true, data: banner });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = {};
      for (const field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({ success: false, errors });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};


// Get All Banners
exports.getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find();
    res.status(200).json({ success: true, data: banners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Banner by ID
exports.getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }
    res.status(200).json({ success: true, data: banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const { title, sub_title, status } = req.body;
    let image_url = null;

    if (req.file) {
      const localPath = req.file.path;
      const ext = path.extname(req.file.originalname);
      const gcsFileName = `banner/${uuidv4()}${ext}`;
      const file = bucket.file(gcsFileName);

      await bucket.upload(localPath, {
        destination: gcsFileName,
        resumable: false,
        public: true,
        metadata: {
          contentType: req.file.mimetype,
        },
      });

      image_url = `https://storage.googleapis.com/${bucket.name}/${gcsFileName}`;
      fs.unlinkSync(localPath); // delete local file after upload
    }

    const updateData = { title, sub_title, status };
    if (image_url) updateData.image_url = image_url;

    const banner = await Banner.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    res.status(200).json({ success: true, data: banner });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = {};
      for (const field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({ success: false, errors });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};


// Delete Single Banner
exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);

    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    res.status(200).json({ success: true, message: "Banner deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Bulk Delete Banners
exports.bulkDeleteBanners = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "No banner IDs provided" });
    }

    const result = await Banner.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} banners deleted successfully.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Change Banner Status
exports.changeBannerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { newStatus } = req.body;

    // Ensure newStatus is either "1" or "0"
    if (!['1', '0'].includes(newStatus)) {
      return res.status(400).json({ success: false, message: "Invalid status value. Use '1' or '0'." });
    }

    const banner = await Banner.findByIdAndUpdate(
      id,
      { status: newStatus },
      { new: true }
    );

    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    res.status(200).json({
      success: true,
      message: `Banner status updated to ${newStatus === '1' ? "Active" : "Inactive"}.`,
      data: banner,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};



exports.getWebsiteBanners = async (req, res) => {
  try {
    const banner = await Banner.find({ status: 1 });

    res.status(200).json({
      success: true,
      message: "Banner fetched successfully",
      data: banner
    });
  } catch (error) {
    console.error("Get Website Banner Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};