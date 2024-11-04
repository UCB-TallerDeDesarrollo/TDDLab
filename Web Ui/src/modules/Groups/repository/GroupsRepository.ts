import axios from "axios";
import { GroupDataObject } from "../domain/GroupInterface";
import GroupsRepositoryInterface from "../domain/GroupsRepositoryInterface";
import {VITE_API} from "../../../../config.ts";

const API_URL = VITE_API + "/groups";

class GroupsRepository implements GroupsRepositoryInterface {
  async getGroups(): Promise<GroupDataObject[]> {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      console.error("Error fetching groups:", error);
      throw error;
    }
  }

  async getGroupsByUserId(id: number): Promise<number[]>{
    try {
      const response = await axios.get(`${VITE_API}/user/groups/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching groups by user email:", error);
      throw error;
    }
  }

  async getGroupById(id: number): Promise<GroupDataObject | null> {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching group by ID:", error);
      throw error;
    }
  }

  async createGroup(groupData: GroupDataObject): Promise<void> {
    try {
      await axios.post(API_URL, groupData);
    } catch (error) {
      console.error("Error creating group:", error);
      throw error;
    }
  }

  async deleteGroup(id: number): Promise<void> {
    try {
      await axios.delete(`${API_URL}/${id}`);
    } catch (error) {
      console.error("Error deleting group:", error);
      throw error;
    }
  }
}

export default GroupsRepository;
