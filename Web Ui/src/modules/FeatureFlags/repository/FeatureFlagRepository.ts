import axios from "axios";
import {
  FeatureFlag,
  FeatureFlagRepositoryInterface,
  FeatureFlagUpdateRequest
} from "../domain/FeatureFlag";

import { VITE_API } from "../../../../config";
const API_URL = `${VITE_API}/featureflags`;

class FeatureFlagRepository implements FeatureFlagRepositoryInterface {
  async getFlags(): Promise<FeatureFlag[]> {
    const response = await axios.get(API_URL);
    return response.data;
  }

  async updateFlag(id: number, request: FeatureFlagUpdateRequest): Promise<FeatureFlag> {
    const response = await axios.put(`${API_URL}/${id}`, request);
    return response.data;
  }

  async getFlagByName(name: string): Promise<FeatureFlag | null> {
    try {
      const response = await axios.get(`${API_URL}/name/${name}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener el flag "${name}":`, error);
      return null;
    }
  }
}

export default FeatureFlagRepository;