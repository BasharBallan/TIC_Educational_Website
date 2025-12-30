const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "name required"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "email required"],
      unique: [true, "your email is already used"],
      lowercase: true,
    },
    phone: { type: String, unique: [true, "your phone is already used"] },
    profileImg: String,

    password: {
      type: String,
      required: [true, "password required"],
      minlength: [6, "Too short password"],
    },
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,

    role: {
      type: String,
      enum: ["admin", "doctor", "student"],
      default: "student",
    },

    active: {
      type: Boolean,
      default: true,
    },

    studentData: {
      studentNumber: { type: Number },

      year: {
        type: mongoose.Schema.ObjectId,
        ref: "Year",
        required: [true, "year required"],
      },

      semester: {
        type: mongoose.Schema.ObjectId,
        ref: "Semester",
        required: [true, "semester required"],
      },

      subjects: [
        {
          type: mongoose.Schema.ObjectId,
          ref: "Subject",
        },
      ],

      savedLectures: [
        {
          type: mongoose.Schema.ObjectId,
          ref: "Lecture",
        },
      ],
    },

    doctorData: {
      specialization: {
        type: String,
        required: [true, "specialization required"],
      },
      academicTitle: {
        type: String,
        required: [true, "academicTitle required"],
      },
      subjects: [
        {
          type: mongoose.Schema.ObjectId,
          ref: "Subject",
        },
      ],
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  // Hashing user password
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
