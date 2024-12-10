import User, { UserDocument } from "../models/userModel";
import { Document } from "mongoose";
import { BaseRepository } from "./baseRepository";

class UserRepository extends BaseRepository<UserDocument> {
  constructor() {
    super(User);
  }

  async findAllUsers(
    page: number,
    limit: number,
    search: string
  ): Promise<Document[] | null> {
    try {
      const query = search ? { name: { $regex: new RegExp(search, "i") } } : {};
      const users = await User.find(query)
        .skip((page - 1) * limit)
        .limit(limit);

      return users;
    } catch (error) {
      throw error;
    }
  }

  async UpdatePassword(password: string, mail: string) {
    try {
      const result = await User.updateOne(
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

 
}

export default new UserRepository();
