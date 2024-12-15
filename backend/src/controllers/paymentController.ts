import { Request, Response } from "express";
import Stripe from "stripe";
import PaymentService from "../services/paymentService";
import { handleError } from "../utils/handleError";
import dotenv from "dotenv";
import { PaymentSession } from "../interfaces/interfaces";

dotenv.config();


declare module "express-session" {
  interface Session {
    payment: PaymentSession;
  }
}

class PaymentController {
  async makePayment(req: Request, res: Response) {
    try {
    
      const stripeSecretKey = process.env.STRIPE_KEY;
      if (!stripeSecretKey) {
        throw new Error(
          "Stripe secret key is not set in environment variables"
        );
      }

      const stripe = new Stripe(stripeSecretKey, {
        apiVersion: "2024-10-28.acacia",
      });
   

      const {userId, bookingId, vendorId, name} = req.body;

      if (! userId|| !bookingId || !vendorId || !name) {
        throw new Error(
          "Missing required parameters: 'name', 'userId', 'bookingId', or 'vendorId'"
        );
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "bdt",
              product_data: {
                name: name,
                metadata: { vendorId, userId },
              },
              unit_amount: 1000 * 100,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.FRONTEND_URL}/payment-success?id=${bookingId}`,
        cancel_url: `${process.env.FRONTEND_URL}/profile/booking-details`,
      });

      req.session.payment = { amount: 1000, userId, bookingId, vendorId };
    
      res.send({ url: session.url });
    } catch (error) {
      console.error("Stripe Session Creation Error:", error);
      handleError(res, error, "Stripe session creation error");
    }
  }

  async addPayment(req: Request, res: Response){
    try {
     
      const paymentData = req.session.payment;
      const amount=paymentData.amount;
      const userId=paymentData.userId;
      const vendorId=paymentData.vendorId;
      const bookingId=paymentData.bookingId;
      const payment=await PaymentService.addNewPayment(amount,userId,vendorId,bookingId);
      res.status(201).json({payment})
    } catch (error) {
      handleError(res, error, "addPayment");
    }
  }
  
  async getAllPayments(req: Request, res: Response){
    try {
      const page: number = parseInt(req.query.page as string) || 1;
      const pageSize: number = parseInt(req.query.pageSize as string) || 6;
      const {payment,count}=await PaymentService.getPayments(page,pageSize)
      const totalPages = Math.ceil(count / pageSize);
      res.status(200).json({payment,totalPages})
    } catch (error) {
      handleError(res, error, "getAllPayments");
    }
  }
}

export default new PaymentController();
