require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Participant = require('./models/Participant');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
let isConnected = false;
const connectDB = async () => {
    if (isConnected) return;
    try {
        await mongoose.connect(process.env.MONGO_URI);
        isConnected = true;
        console.log('MongoDB Connected successfully');
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }
};

// Vercel serverless functions handle requests by exporting the app, 
// but we need to ensure the DB is connected for each request if needed.
app.use(async (req, res, next) => {
    await connectDB();
    next();
});

/* ---------------- API ENDPOINTS ---------------- */

// 1. Check if mobile number exists
app.post('/api/check-phone', async (req, res) => {
  try {
    const { phone } = req.body;
    const existingParticipant = await Participant.findOne({ phone });
    if (existingParticipant) {
      return res.status(200).json({ exists: true });
    }
    res.status(200).json({ exists: false });
  } catch (err) {
    console.error('Error checking phone:', err);
    res.status(500).json({ error: 'Server error while checking phone number' });
  }
});

// 2. Save quiz result
app.post('/api/results', async (req, res) => {
  try {
    const newParticipant = new Participant(req.body);
    const savedResult = await newParticipant.save();
    res.status(201).json(savedResult);
  } catch (err) {
    console.error('Error saving result:', err);
    if (err.code === 11000) {
      return res.status(400).json({
        error: 'A participant with this mobile number already exists.'
      });
    }
    res.status(500).json({ error: 'Server error while saving result' });
  }
});

// 3. Get all results (Admin)
app.get('/api/results', async (req, res) => {
  try {
    const results = await Participant
      .find()
      .sort({ timestamp: -1 });
    res.status(200).json(results);
  } catch (err) {
    console.error('Error fetching results:', err);
    res.status(500).json({
      error: 'Server error while fetching results'
    });
  }
});

// 4. Delete result
app.delete('/api/results/:id', async (req, res) => {
  try {
    const deletedRecord = await Participant.findByIdAndDelete(req.params.id);
    if (!deletedRecord) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.status(200).json({
      message: 'Record deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting result:', err);
    res.status(500).json({
      error: 'Server error while deleting result'
    });
  }
});

// Export the app for Vercel
module.exports = app;
