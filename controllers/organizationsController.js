import MERAKI from "../utils/merakiClient.js";
import {  getNetworkName } from "./networksController.js";


export const getOrganizations = async (req, res) => {

    try {
    
        const response = await MERAKI.get("/organizations")
        //console.info(response.data)
        //response.data.forEach(org => {
        //    console.log(`Org: ${org.name} (ID: ${org.id})`);
        //});

        const nombresExcluidos = ["- TECO -", "NO USAR", "BAJA-"];


        const orgs = response.data.filter(org =>
              !nombresExcluidos.some(excluido => org.name.includes(excluido))
            );


        //const Count = response.data.length;
        const Count = orgs.length;

        res.json({
            ok: true,
            Count, 
            orgs: orgs
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
    console.log("REDESXORG: ", response.data)
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


export const getOrganizationApplianceUplinkStatuses = async (req, res) => {
  const { orgId } = req.params;
  console.log("orgid", orgId)
  try {
    const response = await MERAKI.get(`/organizations/${orgId}/appliance/uplink/statuses`);
    
console.log("RESPUESTA_UPLINK", response.data)
    const Count = response.data.length


  const redes = await Promise.all(
        response.data.map( async (obj) => {
  // solo si no está activa
       //uplinks[0].status
          //const networkName = await getNetworkName(obj.networkId);
          return {
            "serial": obj.serial,
            "networkId": obj.networkId,
           // "name": networkName,
           // "estado": obj.uplinks.filter( sitio => sitio.status !== 'active' && sitio.status !== 'ready' ) 
           //cambio aca
              "estado": obj.uplinks
          }
        }
        ))
        
      
  

   // console.log("redes", redes)

    res.json({ 
        ok: true, 
        Count,
        redes
    });

  } catch (error) {
    console.log(error)
    res.status(500).json({ 
        ok: false, 
        msg: error
    });
  }
};



export const getStatusesOverview = async (req, res) => {
  const { orgId } = req.params;
  console.log("getStatusesOverview", orgId)
  try {
    const response = await MERAKI.get(`/organizations/${orgId}/devices/statuses/overview`);
    const Count = response.data.length
    res.json({ 
        ok: true, 
        Count,
        statuses: response.data 
    });

  } catch (error) {
    res.status(200).json({ 
        ok: false, 
        //msg: error.message,
        msg: "Verificar acceso"
    });
  }
};

/* operativo
const redes = response.data.map((obj) => ({
           serial: obj.serial, 
            interfaces: obj.uplinks.map(
            (ifaces) => ({
                iface: ifaces.interface,
                ip: ifaces.ip,
                publicIp: ifaces.publicIp,
                ifaces: ifaces.status
              })
           )
          })
   )
*/
/*
const redes = response.data.map((obj) => (
  // solo si no está activa
       
        (obj.uplinks[0].status !== 'active') &&
        {
            serial: obj.serial, 
            interfaces: obj.uplinks.map(
            (ifaces) => (  {
                iface: ifaces.interface,
                ip: ifaces.ip,
                publicIp: ifaces.publicIp,
                ifaces: ifaces.status
              })
           )
          })
   )
  esto da muchos falses 
*/
/*        {
            serial: obj.serial, 
            interfaces: obj.uplinks.map(
            (ifaces) => (  {
                iface: ifaces.interface,
                ip: ifaces.ip,
                publicIp: ifaces.publicIp,
                ifaces: ifaces.status
              })
           )
          })
           */
