import bcrypt, { hash } from "bcrypt";
import { sign, verify } from "jsonwebtoken";
import { $Enums } from "../../../generated/prisma";
import { MailService } from "../../mail/mail.service";
import { ReferralService } from "../../referral/services/referral.service";
import { LoginDTO } from "../dto/login.dto";
import { UpdateUserDTO } from "../dto/update.dto";
import { UserDTO } from "../dto/user.dto";
import { UserRepository } from "../repository/user.repository";

interface JwtPayload {
  id: number;
  email: string;
  // username?: string;
}

export class UserService {
  userRepository: UserRepository;
  mailService: MailService;

  constructor() {
    this.userRepository = new UserRepository();
    this.mailService = new MailService();
  }

  //Bikin user baru:
  public async create(data: UserDTO & { referralCode?: string }) {
    //bikin user-role logic buat pisahin authorization pas register:
    const role: $Enums.Role = data.role ?? "CUSTOMER";
    if (!["CUSTOMER", "ORGANIZER"].includes(role)) {
      throw new Error("Invalid role");
    }

    //bikin kode referall:
    const newReferralCode = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();

    //bikin user includde kode referal:
    const user = await this.userRepository.create({
      ...data,
      role,
      referralCode: newReferralCode,
    });

    if (!user) {
      throw new Error("Failed to Register!");
    }

    // kalo user baru pake kodde referal:
    if (data.referralCode) {
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

  //update user:
  public async updateUser(id: number, data: UpdateUserDTO) {
    const user = await this.userRepository.updateUser(id, data);
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    if (!user) {
      throw new Error("Failed to Update User");
    }
    return user;
  }

  //business-logic hard-delete:
  public async hardDelete(id: number) {
    const user = await this.userRepository.hardDeleteUser(id);
    return user;
  }

  //business-logic lupa password &/ reset pass:

  public async forgotPassword(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new Error("Invalid email address");

    const secret = process.env.JWT_SECRET_KEY;
    if (!secret) throw new Error("JWT secret key not set");

    // Generate token for password reset
    const token = sign({ id: user.id }, secret, { expiresIn: "15m" });
    const resetLink = `http://localhost:3000/reset-password/${token}`;

    // Send reset email
    await this.mailService.sendMail(
      email,
      "Reset your password",
      "reset-password",
      { resetLink, token }
    );

    return { message: "Reset email sent successfully" };
  }

  // Reset Password - change password in DB
  public async resetPassword(userId: number, newPassword: string) {
    if (!userId) throw new Error("User ID is required");

    const hashedPassword = await hash(newPassword, 10);
    await this.userRepository.updatePassword(userId, hashedPassword);

    return { message: "Password reset successfully" };
  }
}
