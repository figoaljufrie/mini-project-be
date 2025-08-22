// import { Request, Response } from "express";
// import { handleError } from "../../../helpers/handleError";
// import { handleSuccess } from "../../../helpers/handleSuccess";
// import { ReferralService } from "../services/referral.service";

// export class ReferralController {
//   private referralService: ReferralService;

//   constructor() {
//     this.referralService = new ReferralService();
//     this.useReferralCode = this.useReferralCode.bind(this);
//   }

//   public async useReferralCode(req: Request, res: Response) {
//     try {
//       const referredUserId = Number((req as any).user.id); //User B id from auth:
//       const { referralCode } = req.body;

//       if (!referralCode) {
//         return handleError(
//           res,
//           "Referral Code Is Required",
//           400,
//           "Missing Referral Code"
//         );
//       }

//       const result = await this.referralService.useReferralCode(
//         referredUserId,
//         referralCode
//       );

//       handleSuccess(res, "Referral Code Applied Successfully", result, 200);
//     } catch (error) {
//       handleError(
//         res,
//         "Failed to use Referral Code",
//         500,
//         (error as Error).message
//       );
//     }
//   }
// }
