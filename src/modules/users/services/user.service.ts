import { verify } from "jsonwebtoken";
import { LoginDTO } from "../dto/login.dto";
import { UpdateUserDTO } from "../dto/update.dto";
import { UserDTO } from "../dto/user.dto";
import { UserRepository } from "../repository/user.repository";
import { ReferralService } from "../../referral/services/referral.service";

interface JwtPayload {
  id: number;
  email: string;
  username?: string;
}

export class UserService {
  userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }
  public async create(data: UserDTO & { referralCode?: string }) {
    console.log("Incoming user data:", data);

    // Generate referral code for the new user
    const newReferralCode = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();
    console.log("Generated referral code for new user:", newReferralCode);

    // Create user with the new referral code
    const user = await this.userRepository.create({
      ...data, // spread existing user data
      referralCode: newReferralCode, // add the generated referral code
    });
    console.log("User created:", user);

    if (!user) {
      throw new Error("Failed to Register!");
    }

    // If the new user entered another user's referral code
    if (data.referralCode) {
      console.log("Referral code provided by user:", data.referralCode);

      try {
        const referralService = new ReferralService();
        const referralResult = await referralService.useReferralCode(
          user.id,
          data.referralCode
        );
        console.log("Referral service result:", referralResult);
      } catch (error) {
        console.warn("Referral Code Failed:", (error as Error).message);
      }
    } else {
      console.log("No referral code provided by user.");
    }

    return user;
  }

  public async login(data: LoginDTO) {
    const user = await this.userRepository.login(data);

    if (!user) {
      throw new Error(
        "Failed to login, please check your email or password input."
      );
    }
    return user;
  }

  public async getAll() {
    const user = await this.userRepository.getAll();
    return user;
  }

  public async getByUsername(username: string) {
    const user = await this.userRepository.getByUsername(username);

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  public async validateToken(token: string) {
    try {
      if (!token || typeof token !== "string") {
        throw new Error("Token must be a valid string");
      }

      const decoded = verify(
        token,
        process.env.JWT_SECRET_KEY as string
      ) as JwtPayload;
      const user = await this.userRepository.findById(decoded.id);

      if (!user) throw new Error("User not found");
      return user;
    } catch (err) {
      throw new Error("Invalid token: " + (err as Error).message);
    }
  }

  public async updateUser(id: number, data: UpdateUserDTO) {
    const user = await this.userRepository.updateUser(id, data);

    if (!user) {
      throw new Error("Failed to Update User");
    }
    return user;
  }

  public async hardDelete(id: number) {
    const user = await this.userRepository.hardDeleteUser(id);
    return user;
  }
}
