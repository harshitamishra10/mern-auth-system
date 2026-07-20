import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";

app.use(cookieParser());

dotenv.config();
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS);
connectDB();
const PORT = process.env.PORT || 500;
app.listen(PORT, () => {
  console.log(` Server is running on port ${PORT}`);
});