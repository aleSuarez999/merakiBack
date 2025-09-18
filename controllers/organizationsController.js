import MERAKI from "../utils/merakiClient.js";

export const getOrganizations = async (req, res) => {

    try {
    
        const response = await MERAKI.get("/organizations")
        
        response.data.forEach(org => {
            console.log(`Org: ${org.name} (ID: ${org.id})`);
        });

        const Count = response.data.length;

        res.json({
            ok: true,
            Count, 
            getOrganizations: response.data
        })
    
    } catch (error) {
        res.status(500).json({
            ok: false, 
            msg: error.message
        })
    
    }


}

export const getNetworksByOrg = async (req, res) => {
  const { orgId } = req.params;
  try {
    const response = await MERAKI.get(`/organizations/${orgId}/networks`);
    const Count = response.data.length
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
