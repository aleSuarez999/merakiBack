
import mongoose from 'mongoose';

const orgStatusesSchema = new mongoose.Schema({
  orgId: String,
  statuses: [
    {
      serial: String,
      model: String,
      mac: String,
      networkId: String,
      status: String,
      lastReportedAt: Date
    }
  ],
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('OrgStatuses', orgStatusesSchema);


