const axios = require("axios");

exports.getRealIp = async (req) => {
  try {
    const forwarded = req.headers["x-forwarded-for"];
    if (forwarded) return forwarded.split(",")[0].trim();

    const response = await axios.get("https://api.ipify.org?format=json");
    return response.data.ip;
  } catch {
    return "Unknown IP";
  }
};

exports.getGeoLocation = async (ip) => {
  try {
    const response = await axios.get(`https://ipapi.co/${ip}/json/`);
    return {
      city: response.data.city,
      region: response.data.region,
      country: response.data.country_name,
    };
  } catch {
    return {
      city: "Unknown",
      region: "Unknown",
      country: "Unknown",
    };
  }
};
