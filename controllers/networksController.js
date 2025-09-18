import MERAKI from "../utils/merakiClient.js";

export const getDevicesByNetwork = async (req, res) => {
  const { networkId } = req.params;
  try {
    const response = await MERAKI.get(`/networks/${networkId}/devices`);

    response.data.forEach(net => {
        //console.log(net)
        console.log(`Dev: ${net.name} S/n: ${net.serial} Id: ${net.lanIp} Mod: ${net.model}`);
        // por el serial se ubican los clientes
    });
    const Count = response.data.length;
    res.json({ 
        ok: true, 
        Count,
        networks: response.data 
    });
  } catch (error) {
    res.status(500).json({ 
        ok: false, 
        msg: error.message 
    });
  }
};
