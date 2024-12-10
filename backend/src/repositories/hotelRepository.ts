import Hotel, { HotelDocument } from "../models/hotelModel";
import hotel from "../models/hotelModel";
import { BaseRepository } from "./baseRepository";

class HotelRepository extends BaseRepository<HotelDocument> {
  constructor() {
    super(Hotel);
  }

  async findAllHotels(
    page: number,
    limit: number,
    search: string,
    category: string,
    location: string,
    sortValue: number
  ) {
    try {
      let query: any = {};

      if (search && search.trim()) {
        query.name = { $regex: new RegExp(search, "i") };
      }

      if (category && category.trim()) {
        const categories = category.split(",").map((c) => c.trim());
        query.hotel_type = { $in: categories };
      }

      if (location && location.trim()) {
        const locations = location.split(",").map((l) => l.trim());
        query.city = { $in: locations };
      }

      const validSortValue =
        sortValue === 1 || sortValue === 1 ? sortValue : -1;

      const hotels = await hotel
        .find(query)
        .sort({ totalRating: validSortValue })
        .skip((page - 1) * limit)
        .limit(limit);
      console.log(hotels);

      return hotels;
    } catch (error) {
      throw error;
    }
  }

  async UpdateHotelPassword(password: string, mail: string) {
    try {
      const result = await Hotel.updateOne(
        { email: mail },
        { password: password }
      );
      if (result.modifiedCount === 1) {
        return {
          success: true,
          message: "Hotel Password updated successfully.",
        };
      } else {
        return {
          success: false,
          message: "Hotel not found or password not updated.",
        };
      }
    } catch (error) {
      throw error;
    }
  }

  async UpdatePassword(password: string, mail: string) {
    try {
      const result = await Hotel.updateOne(
        { email: mail },
        { password: password }
      );
      if (result.modifiedCount === 1) {
        return { success: true, message: "Password updated successfully." };
      } else {
        return {
          success: false,
          message: "User not found or password not updated.",
        };
      }
    } catch (error) {
      throw error;
    }
  }

  async requestForVerification(hotelId: string) {
    const data = await hotel.findByIdAndUpdate(hotelId, {
      $set: { verificationRequest: true },
    });
    return data;
  }

  async updateVerificationStatus(hotelId: string, status: string) {
    const data = await hotel.findByIdAndUpdate(hotelId, {
      $set: { verificationRequest: false, isVerified: status === "Accepted" },
    });
    return data;
  }

  async findAllLocations() {
    return await hotel.distinct("city");
  }
}

export default new HotelRepository();
