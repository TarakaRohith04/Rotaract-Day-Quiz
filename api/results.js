import mongoose from 'mongoose';
import Participant from '../models/Participant.js';

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined');
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('Connection error:', err);
    throw err;
  }
};

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await connectDB();

    if (req.method === 'GET') {
      const results = await Participant.find().sort({ timestamp: -1 });
      return res.status(200).json(results);
    } 
    
    if (req.method === 'POST') {
      const newParticipant = new Participant(req.body);
      const savedResult = await newParticipant.save();
      return res.status(201).json(savedResult);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query; // Used for /api/results?id=xxx or req.url path if routed
      
      // If Vercel routes /api/results/:id to results.js, we might get id from query or params
      // However, we can also extract it from the URL if needed, but let's try the URL ID first
      const recordId = id || req.url.split('/').pop();

      const deletedRecord = await Participant.findByIdAndDelete(recordId);
      if (!deletedRecord) {
        return res.status(404).json({ error: 'Record not found' });
      }
      return res.status(200).json({ message: 'Record deleted successfully' });
    }

    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      error: 'Backend Error', 
      message: err.message,
      tip: 'Check Vercel Env Vars and MongoDB IP Whitelist'
    });
  }
}
