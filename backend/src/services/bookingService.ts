import mongoose from "mongoose";
import vendor from "../models/vendorModel";
import BookingRepository from "../repositories/bookingRepository";
import { CustomError } from "../error/customError";
import Booking, { bookingDocument } from "../models/bookingModel";
import payment from "../models/paymentModel";
import user from "../models/userModel";
import admin from "../models/adminModel";
import notification, { NOTIFICATION_TYPES } from "../models/notificationModel";

class BookingService {
  async checkIfDateRangeAvailable(
    roomId: string,  // The roomId passed to the function
    checkIn: string,
    checkOut: string
  ): Promise<any> {
    try {
      // Find the vendor and fetch only the specific room with the matching roomId
      const vendorData = await vendor.findOne(
        { "rooms._id": roomId }, // Match the roomId
        { "rooms.$": 1 } // Only return the specific room in the rooms array
      );
  
      console.log("roomId...", roomId);
      console.log("vendor.........", vendorData);
  
      if (!vendorData || !vendorData.rooms || vendorData.rooms.length === 0) {
        throw new Error("Room not found for the given roomId");
      }
  
      // Extract the specific room from vendorData
      const room = vendorData.rooms[0];
  
      // Generate date range from checkIn to checkOut
      const startDate = new Date(checkIn);
      const endDate = new Date(checkOut);
      const dateRange: string[] = [];
  
      // Generate list of dates within the range
      for (
        let date = new Date(startDate);
        date <= endDate;
        date.setDate(date.getDate() + 1)
      ) {
        dateRange.push(date.toISOString().split("T")[0]); // Format as YYYY-MM-DD
      }
  
      // Check if any date in dateRange is already booked
      const isDateRangeAvailable = dateRange.every(
        (date) => !room.bookedDates.includes(date)
      );
  
      return isDateRangeAvailable;
    } catch (error) {
      console.error("Error checking date range:", error);
      throw new CustomError("Error checking date range", 500);
    }
  }
  

  async acquireLockForDateRange(
    roomId: string,
    checkIn: string,
    checkOut: string
  ): Promise<void> {
    try {
      const vendorData = await vendor.findOne(
        { "rooms._id": roomId }, // Match the roomId
        { "rooms.$": 1 } // Only return the specific room in the rooms array
      );
  
      console.log("vendorData:", vendorData);
  
      if (!vendorData) {
        throw new CustomError("Vendor not found", 404);
      }
  
      // Generate date range from checkIn to checkOut
      const startDate = new Date(checkIn);
      const endDate = new Date(checkOut);
      const dateRange: string[] = [];
  
      // Generate list of dates within the range
      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        dateRange.push(date.toISOString().split("T")[0]); // Format as YYYY-MM-DD
      }
  
      console.log("Generated date range:", dateRange);
  
      // Update the locks in the specific room within the vendor's data
      const result = await vendor.updateOne(
        { "rooms._id": roomId }, // Find the vendor with the roomId
        {
          $push: {
            "rooms.$.locks": {
              $each: dateRange.map(date => ({ date, isLocked: true }))
            }
          }
        }
      );
  
     
      console.log("Vendor data after lock:", result);
  
    } catch (error) {
      console.error("Error acquiring locks for date range:", error);
      throw new CustomError("Error acquiring locks", 500);
    }
  }
  
  
  async addABooking(
    checkIn: string,
    checkOut: string,
    vendorId: string,
    roomId: string,
    userId: string
  ): Promise<object> {
    try {
      const vendorIdObjectId = new mongoose.Types.ObjectId(
        vendorId
      ) as unknown as mongoose.Schema.Types.ObjectId;
      const userIdObjectId = new mongoose.Types.ObjectId(
        userId
      ) as unknown as mongoose.Schema.Types.ObjectId;
  
      // Generate the date range from checkIn to checkOut
      const startDate = new Date(checkIn);
      const endDate = new Date(checkOut);
      const dateRange: string[] = [];
  
      for (
        let date = new Date(startDate);
        date <= endDate;
        date.setDate(date.getDate() + 1)
      ) {
        dateRange.push(date.toISOString().split("T")[0]); // Format as YYYY-MM-DD
      }
  
      // Create the booking with all necessary details
      const booking = await BookingRepository.create({
        checkIn,
        checkOut,
        vendorId: vendorIdObjectId,
        userId: userIdObjectId,
        bookedDates: dateRange, // Store the entire range in the booking document
      });
  
      // Update the specific room's bookedDates field in the vendor document
      await vendor.findByIdAndUpdate(
        vendorId,
        {
          $push: { "rooms.$[room].bookedDates": { $each: dateRange } },
        },
        {
          arrayFilters: [{ "room._id": roomId }], // Match the room to update
        }
      );

      const newNotification = new notification({
        recipient: vendorId,
        message: "New event Booked!",
        type:NOTIFICATION_TYPES.BOOKING
      });

      await newNotification.save();
  
      return booking;
    } catch (error) {
      console.error("Error creating a booking:", error);
      throw new CustomError("Unable to create booking", 500);
    }
  }

  async releaseLockForDate(
    roomId: string,
    checkIn: string,
    checkOut: string
  ): Promise<void> {
    try {
      // Generate the date range from checkIn to checkOut
      const startDate = new Date(checkIn);
      const endDate = new Date(checkOut);
      const dateRange: string[] = [];
  
      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        dateRange.push(date.toISOString().split("T")[0]); // Format as YYYY-MM-DD
      }
  
      // Update the vendor document by removing locks in the specified date range for the room
      const result = await vendor.updateOne(
        { "rooms._id": roomId }, // Match the roomId
        {
          $pull: {
            "rooms.$.locks": { // Pull from the specific room's locks array
              date: { $in: dateRange } // Match the dates in the date range
            }
          }
        }
      );
  
      // Check if the update was successful
      if (result.modifiedCount === 0) {
        throw new CustomError("No locks found to release for the given dates", 404);
      }
    } catch (error) {
      console.error("Error releasing lock for dates:", error);
      throw new CustomError("Unable to release lock for dates", 500);
    }
  }
  

  async getAllBookingsByUser(userId: string, page: number, pageSize: number) {
    try {
      const { bookings, totalBookings } =
        await BookingRepository.findBookingsByUserId(userId, page, pageSize);
      return { bookings, totalBookings };
    } catch (error) {
      console.error("Error fetching booking for user:", error);
      throw new CustomError("Unable fetch user booking", 500);
    }
  }

  async getAllBookingsById(bookingId: string): Promise<bookingDocument | {}> {
    try {
      const bookings = await BookingRepository.findBookingsByBookingId(
        bookingId
      );
      return bookings;
    } catch (error) {
      console.error("Error fetching bookings:", error);
      throw new CustomError("Unable fetch bookings", 500);
    }
  }

  async updateStatusById(bookingId: string, status: string) {
    try {
      const booking = await BookingRepository.getById(bookingId);
  
      if (!booking) {
        throw new Error("Booking not found");
      }
  
      if (status === "Rejected" || status === "Cancelled") {
        const { vendorId, checkIn, checkOut } = booking;
  
        // Generate array of dates between checkIn and checkOut
        const getDateRange = (start: Date, end: Date) => {
          const dates = [];
          let currentDate = new Date(start);
          while (currentDate <= new Date(end)) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
          }
          return dates;
        };
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
  
        const dateRange = getDateRange(checkInDate, checkOutDate);
  
        // Remove the date range from vendor's bookedDates
        await vendor.findByIdAndUpdate(vendorId, {
          $pull: { bookedDates: { $in: dateRange } },
        });
  
        const Payment = await payment.findOne({ bookingId: bookingId });
  

        const newNotification=new notification({
          recipient: booking.userId,
          message:"Booking is rejected By Vendor",
          type:NOTIFICATION_TYPES.STATUS
        })
    
        await newNotification.save();

        if (status == "Cancelled" && Payment) {
          const { userId } = booking;
          const User = await user.findById(userId);
          const Admin = await admin.findOne();
          if (!User || !Admin) {
            throw new Error("User or admin not found");
          }
  
          // Calculate the time difference
          const currentTime = new Date();
          const timeDifference = checkInDate.getTime() - currentTime.getTime();
          const hoursUntilCheckIn = timeDifference / (1000 * 3600); // Convert to hours
  
          // Set refund based on cancellation time
          let refundAmount = 0;
          if (hoursUntilCheckIn > 24) {
            refundAmount = 500; // 100% refund
          } else if (hoursUntilCheckIn > 12) {
            refundAmount = 250; // 50% refund
          } else {
            refundAmount = 0; // No refund
          }
  
          User.wallet += refundAmount;
          await User.save();
          Admin.wallet -= refundAmount;
          await Admin.save();
  
          booking.refundAmount += refundAmount;
          await booking.save();

          const newNotification=new notification({
            recipient: booking.vendorId,
            message:"Booking Cancelled by user",
            type:NOTIFICATION_TYPES.STATUS
          })
      
          await newNotification.save();
        }
      }
  
      const result = await Booking.findByIdAndUpdate(bookingId, {
        $set: { status: status },
      });
  
      await vendor.findByIdAndUpdate(booking.vendorId, {
        $inc: { totalBooking: 1 },
      });

      const newNotification=new notification({
        recipient: booking.userId,
        message:"Booking Accepted by vendor",
        type:NOTIFICATION_TYPES.STATUS
      })
  
      await newNotification.save();
  
      return result;
    } catch (error) {
      console.error("Error updating status:", error);
      throw new CustomError("Unable to update booking status", 500);
    }
  }
  

  
  async getAllBookingsByVendor(
    vendorId: string,
    page: number,
    pageSize: number
  ) {
    try {
      const { bookings, totalBookings } = await BookingRepository.findBookingsByVendorId(
        vendorId,
        page,
        pageSize
      );
      console.log(".......",bookings)
      return { bookings, totalBookings };
    } catch (error) {
      console.error("Error fetching booking for vendor:", error);
      throw new CustomError("Unable fetch vendor booking", 500);
    }
  }

  async getAllRefunds(userId: string, page: number, pageSize: number) {
    try {
      const { refund, totalRefund } = await BookingRepository.findRefundForUser(
        userId,
        page,
        pageSize
      );
      return { refund, totalRefund };
    } catch (error) {
      console.error("Error fetching booking for vendor:", error);
      throw new CustomError("Unable fetch vendor booking", 500);
    }
  }

}

export default new BookingService();
