import { IGroupResponse } from "../group";
import { IGroupRequirementsResponse } from "../groupRequirements";
import { ILocationResponse } from "../location";

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
