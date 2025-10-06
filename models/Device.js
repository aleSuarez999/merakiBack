
import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
  serial: String,
  model: String,
  mac: String,
  network: { type: mongoose.Schema.Types.ObjectId, ref: 'Network' },
  status: String,
  clients: Number,
  lastSeen: Date,
});

export default mongoose.model('Device', deviceSchema);

