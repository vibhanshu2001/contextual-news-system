import axios from "axios";
import logger from "../utils/logger";

export class GeocodingService {
  async getCoordinates(location: string) {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: { q: location, format: "json", limit: 1 },
      });

      if (!response.data.length) throw new Error("Invalid location");

      return {
        lat: parseFloat(response.data[0].lat),
        lon: parseFloat(response.data[0].lon),
      };
    } catch (error) {
      logger.error("Geocoding error:", error);
      throw new Error("Failed to get coordinates");
    }
  }
}