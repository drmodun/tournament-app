import { IGroupResponse } from "src/group";
import { IGroupRequirementsResponse } from "src/groupRequirements";
import { ILocationResponse } from "src/location";

export interface ILFPResponse {
  id: number;
  groupId: number;
  group: IGroupResponse;
  message: string;
  createdAt: string;
  requirements: IGroupRequirementsResponse;
  location?: ILocationResponse;
  // TODO: calculate distance on the frontend, just use it as a filter here
}

export interface IMiniLFPResponse {
  id: number;
  groupId: number;
  message: string;
  createdAt: string;
} // Only two are here, and either way a special algorithm will be used to get these so the normal sorting and type enums are not needed
