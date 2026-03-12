require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Participant = require('./models/Participant');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

/* ---------------- DATABASE CONNECTION ---------------- */

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected successfully');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

/* ---------------- TEST ROUTE ---------------- */

app.get('/', (req, res) => {
  res.send('Rotaract Quiz API Running');
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


/* -------- SAVE QUIZ RESULT -------- */

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


/* -------- GET ALL RESULTS (ADMIN) -------- */

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


/* -------- DELETE RESULT -------- */

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


/* ---------------- START SERVER ---------------- */

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});