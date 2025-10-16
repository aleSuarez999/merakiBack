import Organization from "../models/Organization.js";
import MERAKI from "../utils/merakiClient.js";
import {  getNetworkName } from "./networksController.js";


export const getOrganizations1 = async (req, res) => {

    try {
    
        const response = await MERAKI.get("/organizations")
        //console.info(response.data)
        //response.data.forEach(org => {
        //    console.log(`Org: ${org.name} (ID: ${org.id})`);
        //});

        const nombresExcluidos = ["- TECO -", "NO USAR", "BAJA-", "TECO-Inventario", "Backup de ORG", "TECO-LAB"];


        const orgs = response.data.filter(org =>
              !nombresExcluidos.some(excluido => org.name.includes(excluido))
            );

         orgs.map( (org) => {
          console.log("CREANDO ORG ", org)
           createOrganizationBackend(org)
        }  )

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

export const getOrganizations = async (req, res) => {
    try {
        const response = await MERAKI.get("/organizations")
        const nombresExcluidos = ["- TECO -", "NO USAR", "BAJA-", "TECO-Inventario", "Backup de ORG", "TECO-LAB"];

        const orgs = response.data.filter(org =>
              !nombresExcluidos.some(excluido => org.name.includes(excluido))
            );
        const now = new Date();
        console.log(now)
        for (const org of orgs) {
          //console.log("CREANDO ORG ", org)
          //ubico la org
          const orgData = await Organization.findOne({ id: org.id });
          if (!orgData) {
            console.log("No existe en MongoDB, creando...")
            await createOrganizationBackend(org)
            continue
          }
          console.log(orgData.updatedAt)
          const diffMs = now - new Date(orgData.updatedAt)
          const diffMin = diffMs / 1000 / 60

        
          if (diffMin > 5) {
              console.log(`Actualizando ORG ${org.name}, última actualización hace ${diffMin.toFixed(2)} minutos`);
              // remuevo el await para que no demore hasta que termine la ultima bajada en mostrar el grafico
              createOrganizationBackend(org);
            } else {
              console.log(`ORG ${org.name} actualizada recientemente (${diffMin.toFixed(2)} min), no se actualiza`);
            }

        
        }
  res.json({
              ok: true,
              Count: orgs.length, 
              orgs: orgs
          })
    } catch (error) {
        console.log (error.message)
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
    //console.log("REDESXORG: ", response.data)
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

export const getNetworksByOrgBackend = async (orgId) => {

  try {
    const response = await MERAKI.get(`/organizations/${orgId}/networks`);
    //const Count = response.data.length
    //console.log("REDESXORG: ", response.data)
    return response.data

  } catch (error) {
    return error
  }
};


export const getOrganizationApplianceUplinkStatuses1 = async (req, res) => {
  const { orgId } = req.params;
 // console.log("orgid", orgId)

  try {
    const response = await MERAKI.get(`/organizations/${orgId}/appliance/uplink/statuses`);
    
//console.log("RESPUESTA_UPLINK", response.data)
    const Count = response.data.length

  let activeUplinkCount = 0;
  let uplinkCount = 0

  const redes = await Promise.all(
        response.data.map( async (obj) => {
  // solo si no está activa
       //uplinks[0].status
          //const networkName = await getNetworkName(obj.networkId);
          activeUplinkCount = 0
          uplinkCount = 0
          // cuento cuantos uplinks hay y cuantos activos
          obj.uplinks.map(upl => {
           // console.log("upl<>", upl)
            if (upl.status === "active" || upl.status === "ready")
              activeUplinkCount = activeUplinkCount + 1
            if (upl.status !== "not connected")
              uplinkCount = uplinkCount + 1
          })
          return {
            "serial": obj.serial,
            "networkId": obj.networkId,
           // "name": networkName,
           // "estado": obj.uplinks.filter( sitio => sitio.status !== 'active' && sitio.status !== 'ready' ) 
           //cambio aca
              "uplinkCount": uplinkCount,
              "activeUplinkCount": activeUplinkCount,
              "uplinks": obj.uplinks

          }
        }
        ))
        
  
   // console.log("redes", redes)

    res.json({ 
        "ok": true, 
        Count,
        // por cada red se sabe cuantos uplinks tiene y cuantos activos
        "uplinkCount": uplinkCount,
        "activeUplinkCount": activeUplinkCount,
        "networks": redes
    });

  } catch (error) {
    console.log(error.message)
    res.status(500).json({ 
        ok: false, 
        msg: error
    });
  }
};


export const orgUpdated = async (orgId) => {
  const orgMongo = await Organization.findOne({id: orgId})
  // busco la fecha de update, si es vieja llamo a meraki, sino a mongo
  const now = new Date();
  if (orgMongo)
  {
    //console.log(orgMongo)
    
    const diffMs = now - new Date(orgMongo.updatedAt)
    const diffMin = diffMs / 1000 / 60
    console.log(diffMin)
    if (diffMin > 2) {
        console.log("actualizar", orgMongo.name, orgMongo.updatedAt);
        createOrganizationBackend(orgMongo)
        return {
          ok: false, 
          org: orgMongo
      }
      } else {
        return {
          ok: true, 
          org: orgMongo
      }
   }
  }
  else {
        return {
          ok: false, 
          org: {}
      }
    }

    // si es mayor a 5 min o no existe va meraki
}

export const getOrganizationApplianceUplinkStatuses = async (req, res) => {
  const { orgId } = req.params;
  const isUpdated = await orgUpdated(orgId)
  console.log("isUpdated1>", isUpdated.ok)
 // if ( !isUpdated.ok )
  if (2 == 2)
  {

    try {
      const response = await MERAKI.get(`/organizations/${orgId}/appliance/uplink/statuses`);

      const Count = response.data.length

      let activeUplinkCount = 0;
      let uplinkCount = 0
      console.log(orgId)
      const redes = await Promise.all(
          response.data.map( async (obj) => {

            activeUplinkCount = 0
            uplinkCount = 0
            // cuento cuantos uplinks hay y cuantos activos
            obj.uplinks.map(upl => {
             //console.log("upl<>", upl)
              if (upl.status === "active" || upl.status === "ready")
                activeUplinkCount = activeUplinkCount + 1
              if (upl.status !== "not connected")
                uplinkCount = uplinkCount + 1
            })
            return {
              // esto es cada red y dentro uplinks
              "serial": obj.serial,
              "networkId": obj.networkId,
            // "name": networkName,
            // "estado": obj.uplinks.filter( sitio => sitio.status !== 'active' && sitio.status !== 'ready' )
            //cambio aca
                "uplinkCount": uplinkCount,
                "activeUplinkCount": activeUplinkCount,
                "uplinks": obj.uplinks

            }
          }
          ))


        // console.log("redes", redes)

          res.json({
              "ok": true,
              Count,
              // por cada red se sabe cuantos uplinks tiene y cuantos activos
              "uplinkCount": uplinkCount,
              "activeUplinkCount": activeUplinkCount,
              "networks": redes
          });
          return res
        } catch (error) {
          console.log(error.message)
          res.status(500).json({
              ok: false,
              msg: error
          });
        }
      }
      else
      {
        console.info("traigo datos de mongo1", isUpdated.org.uplinks)
        //res.json({"networks": isUpdated.org.networks})
        res.json({
              "ok": true,
              Count: isUpdated.org.Count,
              // por cada red se sabe cuantos uplinks tiene y cuantos activos
              "uplinkCount": isUpdated.org.uplinkCount,
              "activeUplinkCount": isUpdated.org.activeUplinkCount,
              "networks": isUpdated.org.networks
              //"networks": isUpdated.org.uplinks
          });
      }

}


export const getOrganizationApplianceUplinkStatusesROOTO = async (req, res) => {
  const { orgId } = req.params;
  const isUpdated = await orgUpdated(orgId)
  console.log("isUpdated>", isUpdated.uplinks)

  let activeUplinkCount = 0;
  let uplinkCount = 0
  //const response = []
  if ( !isUpdated.ok ||  isUpdated.ok === "false" && ( orgId > 0))
  {
    console.log("actualizando datos")

        try {
            res = await MERAKI.get(`/organizations/${orgId}/appliance/uplink/statuses`);
            console.log(res)
        }
        catch(error)
        {
            console.log(error.message)
        }
          const Count = res.data.length
    
          const redes = await Promise.all(
          res.data.map( async (obj) => {
 
            activeUplinkCount = 0
            uplinkCount = 0
            // cuento cuantos uplinks hay y cuantos activos
            obj.uplinks.map(upl => {
            console.log("upl<>", upl)
              if (upl.status === "active" || upl.status === "ready")
                activeUplinkCount = activeUplinkCount + 1
              if (upl.status !== "not connected")
                uplinkCount = uplinkCount + 1
            })
            return {
              "serial": obj.serial,
              "networkId": obj.networkId,
            // "name": networkName,
            // "estado": obj.uplinks.filter( sitio => sitio.status !== 'active' && sitio.status !== 'ready' ) 
            //cambio aca
                "uplinkCount": uplinkCount,
                "activeUplinkCount": activeUplinkCount,
                "uplinks": obj.uplinks

            }
          }
          ))
          
    
        // console.log("redes", redes)
       
          res.json({ 
              "ok": true, 
              Count,
              // por cada red se sabe cuantos uplinks tiene y cuantos activos
              "uplinkCount": uplinkCount,
              "activeUplinkCount": activeUplinkCount,
              "networks": redes
          });

  }
  else
  {
      console.info("traigo datos de mongo", isUpdated.org.name, isUpdated.org.updatedAt)
      res = isUpdated
      /*
    {
      networkId: 'L_579838452023963349',
      serial: 'Q2GY-QLJH-NTKG',
      model: 'MX67W',
      highAvailability: [Object],
      lastReportedAt: '2025-10-14T18:20:46Z',
      uplinks: [Array]
    },
      */
     /*
      res = { 
              "ok": true, 
             
              Count: isUpdated.org.Count,
              // por cada red se sabe cuantos uplinks tiene y cuantos activos
              "uplinkCount": isUpdated.org.uplinkCount,
              "activeUplinkCount": isUpdated.org.activeUplinkCount,
              "networks": isUpdated.org.redes,
              "uplinks": isUpdated.org.uplinks
            
          };
          */
         // console.log("devuelvo->",res)
          //return res 


          const redes = await Promise.all(
           isUpdated.org.redes.map( async (obj) => {
 
            activeUplinkCount = 0
            uplinkCount = 0
            // cuento cuantos uplinks hay y cuantos activos
            obj.uplinks.map(upl => {
            console.log("upl<>", upl)
              if (upl.status === "active" || upl.status === "ready")
                activeUplinkCount = activeUplinkCount + 1
              if (upl.status !== "not connected")
                uplinkCount = uplinkCount + 1
            })
            return {
              "serial": obj.serial,
              "networkId": obj.networkId,
            // "name": networkName,
            // "estado": obj.uplinks.filter( sitio => sitio.status !== 'active' && sitio.status !== 'ready' ) 
            //cambio aca
                "uplinkCount": uplinkCount,
                "activeUplinkCount": activeUplinkCount,
                "uplinks": obj.uplinks

            }
          }
          ))
          
    
        // console.log("redes", redes)
       
          res.json({ 
              "ok": true, 
              Count,
              // por cada red se sabe cuantos uplinks tiene y cuantos activos
              "uplinkCount": uplinkCount,
              "activeUplinkCount": activeUplinkCount,
              "networks": redes
          });
          
  }
    

  
}





export const getOrganizationApplianceUplinkStatusesBackend = async (orgId) => {

  
  try {
    const response = await MERAKI.get(`/organizations/${orgId}/appliance/uplink/statuses`);
    
    const Count = response.data.length

    let activeUplinkCount = 0;
    let uplinkCount = 0

  // uplinks tiene un array con las redes y los estados de las interfaces

    const uplinks = await Promise.all(
        response.data.map( async (obj) => {

          activeUplinkCount = 0
          uplinkCount = 0
          // cuento cuantos uplinks hay y cuantos activos
          obj.uplinks.map(upl => {
           // console.log("upl<>", upl)
            if (upl.status === "active" || upl.status === "ready")
              activeUplinkCount = activeUplinkCount + 1
            if (upl.status !== "not connected")
              uplinkCount = uplinkCount + 1
          })
          return {
            "serial": obj.serial,
            "networkId": obj.networkId,
            "uplinkCount": uplinkCount,
            "activeUplinkCount": activeUplinkCount,
            "uplinks": obj.uplinks

          }
        }
        ))
        
  
   //console.log("uplinks>", uplinks)

    //return  (uplinks);

  } catch (error) {
    console.log(error.message)
    return error
  }
};



export const getStatusesOverview = async (req, res) => {
  const { orgId } = req.params;
 // console.log("getStatusesOverview", orgId)
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

export const createOrganization = async (req, res) => {

  const {body} = req
  console.log(body)

  try {
    const org = await Organization.findOne({id: body.id})

    if (!org)
    {
        // si no existe la organizacion en la base la creo
          const newOrg = await Organization.create({  ...body  })

          res.json({
            ok: true,
            msg: "Org creada correctamente.",
            org: newOrg
        })
    }

  } catch (error) {
   
    console.error("createOrganization>", error.message)
    
    res.status(500).json({
          ok: false,
          msg: "Error de servidor.",
          error
      })
    
  }

}

export const createOrganizationBackend = async (orgN) => {

  // para llamarlo desde al backend y que cree la base en mongo
  //console.log(orgN)
   
  try {
    const org = await Organization.findOne({id: orgN.id})
    console.info("encontrado ", org.name)
    if (!org)
    {
      return 
      // si la org no existe busco redes, uplinks y la creo con toda la info
      const redes = await getNetworksByOrgBackend(orgN.id)
      const uplinks = await getOrganizationApplianceUplinkStatusesBackend(orgN.id)
      await Organization.create({
            id: orgN.id,
            name: orgN.name,
            redes,
            uplinks
      })
    }
    else // si existe solo la actualizo
    {
        console.log("actualizo", orgN.id)
        const redes = await getNetworksByOrgBackend(orgN.id)
        //postOrg({id: org.id, name: org.name, redes})

        const uplinks = await getOrganizationApplianceUplinkStatusesBackend(orgN.id)

        // si no existe la organizacion en la base la creo
          const newOrg = await Organization.findOneAndUpdate(
        { id: orgN.id },
        {
          $set: {
            name: orgN.name,
            redes,
            uplinks
          }
        },
        { upsert: true, new: true }
      );


          return newOrg
    }

  } catch (error) {
   
    console.error("createOrganization>", error.message)
    
    return error
    
  }

}

