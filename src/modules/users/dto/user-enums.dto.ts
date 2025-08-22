import { $Enums } from "../../../generated/prisma";

export interface EnumsDTO {
  email: string,
  password: string,
  role?: $Enums.Role
}