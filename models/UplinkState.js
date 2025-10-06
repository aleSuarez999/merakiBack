
import mongoose from 'mongoose';

const uplinkStateSchema = new mongoose.Schema({
  orgId: String,
  serial: String,
  networkId: String,
  estado: [
    {
      interface: String,
      status: String,
      ip: String,
      gateway: String,
      dns: [String],
    }
  ],
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('UplinkState', uplinkStateSchema);

