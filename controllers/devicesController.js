import MERAKI from "../utils/merakiClient.js";

export const getClientByDevices = async (req, res) => {
  const { serial } = req.params;
  try {
    const response = await MERAKI.get(`/devices/${serial}/clients`);

    response.data.forEach(dev => {
        //console.log(dev)
        console.log(`Ip: ${dev.ip} Vlan: ${dev.vlan} Tx/Rx: ${dev.usage.sent}/${dev.usage.recv}`);
    });

    const Count = response.data.length;

    res.json({ 
        ok: true, 
        serial,
        Count,
        clientes: response.data 
    });
  } catch (error) {
    res.status(500).json({ 
        ok: false, 
        msg: error.message 
    });
  }
};
