import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
  orgId: String,
  name: String,
  networks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Network' }],
});

export default mongoose.model('Organization', organizationSchema);


