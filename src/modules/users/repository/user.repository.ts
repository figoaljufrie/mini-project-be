import { prisma } from "../../../utils/prisma";
import { UserDTO } from "../dto/user.dto";
import { LoginDTO } from "../dto/login.dto";
import { UpdateUserDTO } from "../dto/update.dto";
import bcrypt from "bcrypt";
import { sign, SignOptions } from "jsonwebtoken";
import dotenv from "dotenv";

export class UserRepository {
  public async create(data: UserDTO & { referralCode?: string }) {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error("User with this email address already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user with optional referralCode
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        username: data.username,
        password: hashedPassword,
        referralCode: data.referralCode ?? null, // use generated referral code if provided
      },
    });

    return user;
  }

  public async login(data: LoginDTO) {
    const user = await prisma.user.findUnique({
      where: {
        //unik = email
        email: data.email
      },
    });
    //kalo user nggak ketemu (email)
    if (!user) {
      throw new Error("User not found.");
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password);

    //kalo password nggak sama dengan yg di db:
    if (!isValidPassword) {
      throw new Error("Wrong Password.");
    }

    const secretKey = process.env.JWT_SECRET_KEY!;
    const expiresIn = process.env.JWT_EXPIRES_IN!;
    const token = this.generateToken(user, secretKey!, expiresIn)
    return {
      accessToken: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role
      }
    };
  }
  public async getAll() {
    const user = await prisma.user.findMany();
    return user;
  }

  private generateToken(user: any, secret: string, expiresIn: string) {
    const payload = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };
    const options: SignOptions = {
      expiresIn: expiresIn as any,
    };
    return sign(payload, secret as string, options);
  }

  public async findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  public async getByUsername(username: string) {
    return prisma.user.findUnique({
      where: { username },
    });
  }

  public async updateUser(id: number, data: UpdateUserDTO) {

    //if password is being changed, hash it:
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10)
    }


    const updatedUser = await prisma.user.update({
      where: { id },
      data,
    });
    return updatedUser;
  }

  public async hardDeleteUser(id: number) {
    return prisma.user.delete({
      where: {id}
    })
  }

}
