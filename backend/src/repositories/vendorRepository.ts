import Vendor, { VendorDocument } from "../models/vendorModel";
import vendor from "../models/vendorModel";
import { BaseRepository } from "./baseRepository";

class VendorRepository extends BaseRepository<VendorDocument> {
  constructor() {
    super(Vendor);
  }

  async findAllVendors(
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
        query.vendor_type = { $in: categories };
      }

      if (location && location.trim()) {
        const locations = location.split(",").map((l) => l.trim());
        query.city = { $in: locations };
      }

      const validSortValue =
        sortValue === 1 || sortValue === 1 ? sortValue : -1;

      const vendors = await vendor
        .find(query)
        .sort({ totalRating: validSortValue })
        .skip((page - 1) * limit)
        .limit(limit);
      console.log(vendors);

      return vendors;
    } catch (error) {
      throw error;
    }
  }

  async UpdateVendorPassword(password: string, mail: string) {
    try {
      const result = await Vendor.updateOne(
        { email: mail },
        { password: password }
      );
      if (result.modifiedCount === 1) {
        return {
          success: true,
          message: "Vendor Password updated successfully.",
        };
      } else {
        return {
          success: false,
          message: "Vendor not found or password not updated.",
        };
      }
    } catch (error) {
      throw error;
    }
  }

  async UpdatePassword(password: string, mail: string) {
    try {
      const result = await Vendor.updateOne(
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

  async requestForVerification(vendorId: string) {
    const data = await vendor.findByIdAndUpdate(vendorId, {
      $set: { verificationRequest: true },
    });
    return data;
  }

  async updateVerificationStatus(vendorId: string, status: string) {
    const data = await vendor.findByIdAndUpdate(vendorId, {
      $set: { verificationRequest: false, isVerified: status === "Accepted" },
    });
    return data;
  }

  async findAllLocations() {
    return await vendor.distinct("city");
  }
}

export default new VendorRepository();
