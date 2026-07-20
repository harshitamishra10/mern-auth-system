// // import mongoose from "mongoose";

// // const userSchema = new mongoose.Schema(
// //   {
// //     name: {
// //       type: String,
// //       required: true,
// //       trim: true,
// //     },
// //     email: {
// //       type: String,
// //       required: true,
// //       unique: true,
// //       lowercase: true,
// //       trim: true,
// //     },
// //     phone: {
// //       type: String,
// //       required: true,
// //       unique: true,
// //     },
// //     password: {
// //       type: String,
// //       required: true,
// //     },
// //     isVerified: {
// //       type: Boolean,
// //       default: false,
// //     },
// //     otp: {
// //       type: String,
// //       default: null,
// //     },
// //     otpExpiry: {
// //       type: Date,
// //       default: null,
// //     },
// //     refreshToken: {
// //       type: String,
// //       default: null,
// //     },
// //   },
// //   {
// //     timestamps: true,
// //   }
// // );
// // const User = mongoose.model("User", userSchema);
// // export default User;

// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//     },

//     phone: {
//       type: String,
//       unique: true,
//       sparse: true,
//     },

//     password: {
//       type: String,
//       required: true,
//     },

//     isVerified: {
//       type: Boolean,
//       default: false,
//     },

//     emailOTP: {
//       type: String,
//     },

//     emailOTPExpiry: {
//       type: Date,
//     },

//     refreshToken: {
//       type: String,
//       default: null,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const User = mongoose.model("User", userSchema);

// export default User;


// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//     },

//     email: {
//       type: String,
//       required: true,
//       unique: true,
//     },

//     password: {
//       type: String,
//       required: true,
//     },
//     otp: {
//   type: String,
//   default: null,
// },
// otpExpiry: {
//   type: Date,
//   default: null,
// },
// isVerified: {
//   type: Boolean,
//   default: false,
// },
//   },
//   {
//     timestamps: true,
//   }
// );

// const User = mongoose.model("User", userSchema);

// export default User;
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },
    phone : {
      type : String,
      required : true,
      unique : true,
    },
    otp: {
      type: String,
      default: null,
    },

    otpExpiry: {
      type: Date,
      default: null,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;