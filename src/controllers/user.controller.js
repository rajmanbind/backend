import { asyncHandler } from "../utils/asyncHandler.js";

const userRegistration = asyncHandler(async (req, res) => {
  return res.status(200).json({ message: "OK" });
});
export { userRegistration };
