import { prisma } from "../../../utils/prisma";
import { PointRepository } from "../repository/point.repository";

export class PointService {
  private pointRepository = new PointRepository();

  async addReferralPoints(userId: number, amount: number) {
    // expire after 3 months
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 3);

    await this.pointRepository.create(userId, amount, expiresAt);
    
    //update total point di table user:
    await prisma.user.update({
  where: { id: userId },
  data: { points: { increment: amount } },
});
  }

  async getAvailablePoints(userId: number) {
    const validPoints = await this.pointRepository.getValidPoints(userId);

    // all-or-nothing: sum only valid, non-expired
    return validPoints.reduce(
      (
        sum: number,
        tx: {
          amount: number;
        }
      ) => sum + tx.amount,
      0
    );
  }
}
