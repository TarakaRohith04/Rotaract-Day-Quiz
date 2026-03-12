const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  club: { type: String, required: true },
  position: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  scores: {
    1: { type: Number, default: 0 },
    2: { type: Number, default: 0 },
    3: { type: Number, default: 0 }
  },
  isFlagged: { type: Boolean, default: false },
  detailedResults: [{
    question: String,
    options: [String],
    correct: Number,
    chosen: Number,
    status: String,
    level: Number
  }],
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Participant', participantSchema);
