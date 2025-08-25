import { $Enums, User as PrismaUserRole } from "../../../generated/prisma";

export { PrismaUserRole };

export interface UserDTO {
 name: string,
 email: string,
 username: string,
 password: string,
 referralCode?: string | null;
 role?: $Enums.Role
}