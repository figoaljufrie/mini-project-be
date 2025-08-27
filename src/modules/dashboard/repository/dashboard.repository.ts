import { prisma } from "../../../utils/prisma";

export class DashboardRepository {
  //Ambil semua transaksi, bisa di filter via user, event, status:

  public async getTransaction(
    organizerId: number,
    eventId?: number,
    status?: string
  ) {
    const whereClause: any = {
      event: {
        organizerId,
      },
    };

    if (eventId) whereClause.eventId = eventId;
    if (status) whereClause.status = status;

    return prisma.transaction.findMany({
      where: whereClause,
      include: {
        user: true,
        event: true,
        coupon: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  public async getTotalRevenue(organizerId: number) {
    return prisma.transaction.aggregate({
      _sum: {
        totalIdr: true,
      },
      where: {
        status: "DONE",
        event: {
          organizerId: organizerId,
        },
      },
    });
  }

  public async getTotalAttendees(organizerId: number) {
    return prisma.transaction.count({
      where: {
        event: {
          organizerId,
        },
        status: "DONE",
      },
    });
  }

  public async getTransactionById(transactionId: number, organizerId: number) {
  return prisma.transaction.findFirst({
    where: {
      id: transactionId,
      event: { organizerId }
    },
    include: {
      user: true,
      event: true,
      coupon: true,
    },
  });
}

  //bikin total vouchers buat data dashboard home visualization:
  public async getTotalVouchers(organizerId: number) {
    return prisma.coupon.count({
      where: {
        organizerId,
      },
    });
  }

  //bikin total event buat data dashboard home visualization:
  public async getTotalEvents(organizerId: number) {
    return prisma.event.count({
      where: {
        organizerId,
      },
    });
  }

  //bikin total tiket buat data dashboard visualization: Nunggu mas Rafli
  // public async getTotalTickets(organizerId: number) {
  //   return prisma.ticket.count({
  //     where: {
  //       event: {
  //         organizerId,
  //       }
  //     }
  //   })
  // }
}
