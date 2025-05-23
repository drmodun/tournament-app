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
}

export interface IMiniLFPResponse {
  id: number;
  groupId: number;
  message: string;
  createdAt: string;
}
