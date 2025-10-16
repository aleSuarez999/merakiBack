import mongoose from 'mongoose';

const uplinkSchema = new mongoose.Schema({
  serial: String,
  networkId: String,
  uplinkCount: Number,
  activeUplinkCount: Number,
  uplinks: [
    {
      interface: String,
      status: String,
      ip: String,
      gateway: String,
      publicIp: String,
      dns: [String],
      latencyMs: Number,
      lossPercent: Number
    }
  ]
}, { _id: false });

const organizationSchema = new mongoose.Schema({
  id: String,
  name: String,
  redes: [
    {
      id: String,
      organizationId: String,
      name: String,
      productTypes: [String],
      timeZone: String,
      tags: [String],
      enrollmentString: String,
      url: String,
      notes: String,
      configTemplateId: String,
      isBoundToConfigTemplate: Boolean,
      isVirtual: Boolean
    }
  ],
  uplinks: [uplinkSchema]
}, { timestamps: true });



export default mongoose.model('Organization', organizationSchema);