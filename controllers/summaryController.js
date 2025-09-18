import MERAKI from "../utils/merakiClient.js";

export const getClientsSummary = async (req, res) => {
  

    const orgs = await MERAKI.get(`/organizations`);
    console.log(orgs)
    const summary = [];
    
    for (const org of orgs.data){
      try {
        const networks = await MERAKI.get(`/organizations/${org.id}/networks`)
        console.log(org.id)
        for (const net of networks.data){
          const devices = await MERAKI.get(`/networks/${net.id}/devices`);

          for (const device of devices.data) {
          
            if (device.model.startsWith("MR")) { // solo APs
              const clients = await MERAKI.get(`/devices/${device.serial}/clients`);
              summary.push({
                organization: org.name,
                network: net.name,
                deviceName: device.name || device.serial,
                serial: device.serial,
                model: device.model,
                clientsCount: clients.data.length
              });

          }
        }
      
      }
    }
       catch (error) {
            if (error.errno == 403){
              
                console.warn(`No se pudo acceder a la organización ${org.name} (ID: ${org.id}): ${error.message}`);
                continue;

            }

       
  }


}
    res.json({ 
        ok: true, 
        summary
    });
}