import Organization from "../models/Organization.js";
import MERAKI from "../utils/merakiClient.js";

export const getOrganizations = async (req, res) => {
    try {
        const response = await MERAKI.get("/organizations")
        const nombresExcluidos = ["- TECO -", "TECO - Municipalidad Villa Angela", 
          "NO USAR", 
          "AGUAS SANTAFESINAS",
          "BAJA-", "TECO-Inventario", "Backup de ORG", "TECO-LAB", "TECO-Alpargatas"];

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
              await createOrganizationBackend(org);
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
  const isUpdated = await orgUpdated(orgId);

  if (!isUpdated.ok) {
    try {
      const response = await MERAKI.get(`/organizations/${orgId}/appliance/uplink/statuses`);
      const Count = response.data.length;

      const redes = response.data.map(obj => {
        let activeUplinkCount = 0;
        let uplinkCount = 0;

        obj.uplinks.forEach(upl => {
          if (upl.status === "active" || upl.status === "ready") activeUplinkCount++;
          if (upl.status !== "not connected") uplinkCount++;
        });

        return {
          serial: obj.serial,
          networkId: obj.networkId,
          uplinkCount,
          activeUplinkCount,
          uplinks: obj.uplinks
        };
      });

      res.json({
        ok: true,
        Count,
        uplinkCount: redes.reduce((acc, r) => acc + r.uplinkCount, 0),
        activeUplinkCount: redes.reduce((acc, r) => acc + r.activeUplinkCount, 0),
        networks: redes
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ ok: false, msg: error.message });
    }
  } else {
    console.info("Datos desde MongoDB:", isUpdated.org.name, isUpdated.org.updatedAt);
    res.json({
      ok: true,
      Count: isUpdated.org.uplinks?.length || 0,
      uplinkCount: isUpdated.org.uplinks?.reduce((acc, r) => acc + r.uplinkCount, 0),
      activeUplinkCount: isUpdated.org.uplinks?.reduce((acc, r) => acc + r.activeUplinkCount, 0),
      networks: isUpdated.org.uplinks
    });
  }
};


export const getOrganizationApplianceUplinkStatusesBackend = async (orgId) => {
  try {
    const response = await MERAKI.get(`/organizations/${orgId}/appliance/uplink/statuses`);
    const Count = response.data.length;

    const uplinks = await Promise.all(
      response.data.map(async (obj) => {
        let activeUplinkCount = 0;
        let uplinkCount = 0;

        obj.uplinks.forEach(upl => {
          if (upl.status === "active" || upl.status === "ready") activeUplinkCount++;
          if (upl.status !== "not connected") uplinkCount++;
        });

        return {
          serial: obj.serial,
          networkId: obj.networkId,
          uplinkCount,
          activeUplinkCount,
          uplinks: obj.uplinks
        };
      })
    );

    return uplinks; // ✅ este return es necesario
  } catch (error) {
    console.log(error.message);
    return []; // o null, pero mejor devolver array vacío
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
      
          const nowLocal = new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" });
          const localDate = new Date(nowLocal);

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
  try {
    const org = await Organization.findOne({ id: orgN.id });

    if (!org) {
      console.log("No existe en MongoDB, creando...");

      const redes = await getNetworksByOrgBackend(orgN.id);
      const uplinks = await getOrganizationApplianceUplinkStatusesBackend(orgN.id);
      if (redes.length > 0 && uplinks.length > 0) {
        const newOrg = await Organization.create({
          id: orgN.id,
          name: orgN.name,
          redes,
          uplinks
        });
        return newOrg;
      } else {
          console.warn("Datos incompletos para crear organización:", orgN);
          return false
      }
      
    }

    console.info("Actualizando organización:", org.name);

    const redes = await getNetworksByOrgBackend(orgN.id);
    const uplinks = await getOrganizationApplianceUplinkStatusesBackend(orgN.id);

    const updatedOrg = await Organization.findOneAndUpdate(
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
    console.log("updatedate->", updatedOrg.updatedAt)
    return updatedOrg;
  } catch (error) {
    console.error("createOrganizationBackend>", error.message);
    return error;
  }
};

