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

    if (req.method === 'POST') {
      const { phone } = req.body;
      const existingParticipant = await Participant.findOne({ phone });
      
      return res.status(200).json({ exists: !!existingParticipant });
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      error: 'Backend Error', 
      message: err.message,
      tip: 'Check Vercel Env Vars and MongoDB IP Whitelist'
    });
  }
}
