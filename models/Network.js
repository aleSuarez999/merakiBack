import mongoose from 'mongoose';

const networkSchema = new mongoose.Schema({
  networkId: String,
  name: String,
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  devices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Device' }],
});

export default mongoose.model('Network', networkSchema);

