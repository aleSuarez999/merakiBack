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

export const getNetworkName = async(networkId) => {
  try {
    const response = await MERAKI.get(`/networks/${networkId}`);
    console.log(response)
    return response.data.name
    
  }
  catch(error)
  {
    console.log(`No se pudo obtener el nombre de ${networkId} ${error}`)
    return "N/C"
  }
}

export const getNetwork = async (req, res) => {
  const { networkId } = req.params;
  try {
    const response = await MERAKI.get(`/networks/${networkId}`);
    console.log(response.data)
    //response.data.map(net => {
        //console.log(net)
     //   console.log(`Dev: ${net.name} S/n: ${net.serial} Id: ${net.lanIp} Mod: ${net.model}`);
        // por el serial se ubican los clientes
    //});
    const red = response.data
    const network = ({
        name: red.name
    })

    const Count = response.data.length;
    res.json({ 
        ok: true, 
        Count,
        networks: network 
    });
  } catch (error) {
    res.status(500).json({ 
        ok: false, 
        msg: error.message 
    });
  }
};
