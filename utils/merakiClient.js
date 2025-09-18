import axios from "axios";

const MERAKI_API_KEY = process.env.MERAKI_API_KEY
const MERAKI_BASE_URL = process.env.MERAKI_BASE_URL



const MERAKI = axios.create({
  baseURL: MERAKI_BASE_URL,
  timeout: 15000,
  headers : {
      "Authorization": `Bearer ${MERAKI_API_KEY}`,
      "Accept": "application/json"
  }
});

export default MERAKI