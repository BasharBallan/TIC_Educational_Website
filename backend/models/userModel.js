const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    // ===========================
    // BASIC USER INFO
    // ===========================
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
    phone: {
      type: String,
      unique: true,
      sparse: true,
    },

    profileImg: String,

    password: {
      type: String,
      required: function () {
        return this.provider === "local";
      },
      minlength: [6, "Too short password"],
    },

    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,
    passwordResetAttempts: {
      type: Number,
      default: 0,
    },
    lastPasswordResetRequest: Date,

    role: {
      type: String,
      enum: ["admin", "doctor", "student"],
      default: "student",
    },

    active: {
      type: Boolean,
      default: true,
    },

    googleId: {
      type: String,
      default: null,
    },

    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    passwordManuallySet: {
      type: Boolean,
      default: false,
    },

    // ===========================
    // SIGNUP STATE MACHINE
    // ===========================
    signupStatus: {
      type: String,
      enum: [
        "email_submitted",
        "email_verified",
        "profile_completed",
        "pending_approval",
        "approved",
        "rejected",
      ],
      default: "email_submitted",
    },

    // ===========================
    // EMAIL VERIFICATION
    // ===========================
    emailVerificationCode: String,
    emailVerificationExpires: Date,
    emailVerificationAttempts: {
      type: Number,
      default: 0,
    },
    lastEmailVerificationRequest: Date,
    emailVerified: {
      type: Boolean,
      default: false,
    },

    // ===========================
    // PROFILE COMPLETION
    // ===========================
    universityCardImg: String, // student card OR payment receipt
    profileCompleted: {
      type: Boolean,
      default: false,
    },


    // ===========================
    // ADMIN APPROVAL SYSTEM
    // ===========================
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvalNotes: String,
    approvedAt: Date,
    rejectedAt: Date,

    isFullyActive: {
      type: Boolean,
      default: false,
    },

    // ===========================
    // OPTIONAL AUDIT & SECURITY
    // ===========================
    auditLog: [
      {
        action: String,
        timestamp: Date,
        ip: String,
        device: String,
      },
    ],

    signupDeviceInfo: String,
    signupIpAddress: String,

    // ===========================
    // STUDENT DATA
    // ===========================
    studentData: {
      studentNumber: { type: Number },

      year: {
        type: mongoose.Schema.ObjectId,
        ref: "Year",
      },

      semester: {
        type: mongoose.Schema.ObjectId,
        ref: "Semester",
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

    // ===========================
    // DOCTOR DATA
    // ===========================
    doctorData: {
      specialization: {
        type: String,
      },
      academicTitle: {
        type: String,
      },
      subjects: [
        {
          type: mongoose.Schema.ObjectId,
          ref: "Subject",
        },
      ],
      lectures: [
        {
          type: mongoose.Schema.ObjectId,
          ref: "Lecture",
        },
      ],
    },
  },
  { timestamps: true }
);

// ===========================
// PASSWORD HASHING
// ===========================
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ===========================
// CLEAN JSON OUTPUT
// ===========================
userSchema.set("toJSON", {
  transform: function (doc, ret) {
    if (ret.role === "doctor") {
      delete ret.studentData;
    } else if (ret.role === "student") {
      delete ret.doctorData;
    } else {
      delete ret.studentData;
      delete ret.doctorData;
    }

    return ret;
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
