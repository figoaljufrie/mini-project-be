import { PrismaClient } from "../../../generated/prisma";

const prisma = new PrismaClient();

export class PointRepository {
  //bikin point:
  async create(userId: number, amount: number, expiresAt: Date) {
    return prisma.pointTransactions.create({
      data: {
        userId,
        amount,
        expiresAt,
      },
    });
  }

  ////Ambil point yang masih valid:
  async getValidPoints(userId: number, currentDate: Date = new Date()) {
    return prisma.pointTransactions.findMany({
      where: {
        userId,
        expiresAt: { gte: currentDate },
        used: false,
      },
    });
  }
}