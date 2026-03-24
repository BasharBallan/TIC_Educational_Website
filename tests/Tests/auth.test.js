/**
 * Auth API Test Suite
 * Covers: Signup + Login
 */

jest.mock("../../utils/sendEmail", () => {
  return jest.fn().mockResolvedValue(true);
});

// ------------------------------------------------------
// NETWORK MOCKS
// ------------------------------------------------------
jest.mock("../../utils/network", () => ({
  getRealIp: jest.fn(() => "127.0.0.1"),
  getGeoLocation: jest.fn(() => ({ country: "Syria" })),
}));

require("dotenv").config({ path: "config.env.test" });

const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../app");

// ------------------------------------------------------
// USER SESSION MOCKS
// ------------------------------------------------------
const mockSessionCreate = jest.fn();
const mockSessionFind = jest.fn();
const mockSessionFindOne = jest.fn();
const mockSessionDeleteOne = jest.fn();
const mockSessionDeleteMany = jest.fn();

jest.mock("../../models/userSessionModel", () => ({
  create: (...args) => mockSessionCreate(...args),
  find: (...args) => mockSessionFind(...args),
  findOne: (...args) => mockSessionFindOne(...args),
  deleteOne: (...args) => mockSessionDeleteOne(...args),
  deleteMany: (...args) => mockSessionDeleteMany(...args),
}));

jest.mock("../../config/redis", () => ({
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue("OK"),
  del: jest.fn().mockResolvedValue(1),
  on: jest.fn(),
  connect: jest.fn(),
  quit: jest.fn(),
}));


beforeAll(async () => {
  await mongoose.connect(process.env.DB_URI);
});

afterEach(async () => {
  await mongoose.connection.db.dropDatabase();
  jest.clearAllMocks();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Auth API", () => {

  // ------------------------------------------------------
  // SIGNUP TESTS
  // ------------------------------------------------------
  describe("POST /auth/signup", () => {

    it("✓ should signup successfully with valid data", async () => {
      const res = await request(app)
        .post("/api/v1/auth/signup")
        .send({
          name: "Valid User",
          email: "valid@example.com",
          password: "Valid@1234",
          passwordConfirm: "Valid@1234"
        });

      expect(res.status).toBe(201);
      expect(res.body.data.email).toBe("valid@example.com");
    });

    it("✓ should fail when name is missing", async () => {
      const res = await request(app)
        .post("/api/v1/auth/signup")
        .send({
          email: "noname@example.com",
          password: "Valid@1234",
          passwordConfirm: "Valid@1234"
        });

      expect(res.status).toBe(400);
      expect(res.body.errors[0].msg.toLowerCase()).toContain("name");
    });

    it("✓ should fail when email format is invalid", async () => {
      const res = await request(app)
        .post("/api/v1/auth/signup")
        .send({
          name: "Invalid Email",
          email: "not-an-email",
          password: "Valid@1234",
          passwordConfirm: "Valid@1234"
        });

      expect(res.status).toBe(400);
      expect(res.body.errors[0].msg.toLowerCase()).toContain("invalid email");
    });

    it("✓ should fail when password is weak", async () => {
      const res = await request(app)
        .post("/api/v1/auth/signup")
        .send({
          name: "Weak Password",
          email: "weak@example.com",
          password: "123",
          passwordConfirm: "123"
        });

      expect(res.status).toBe(400);
      expect(res.body.errors[0].msg.toLowerCase()).toContain("password");
    });

    it("✓ should fail when passwordConfirm does not match", async () => {
      const res = await request(app)
        .post("/api/v1/auth/signup")
        .send({
          name: "Mismatch",
          email: "mismatch@example.com",
          password: "Valid@1234",
          passwordConfirm: "WrongConfirm"
        });

      expect(res.status).toBe(400);
      expect(res.body.errors[0].msg.toLowerCase()).toContain("confirmation");
    });

    it("✓ should fail when email already exists", async () => {
      await request(app)
        .post("/api/v1/auth/signup")
        .send({
          name: "User1",
          email: "duplicate@example.com",
          password: "Valid@1234",
          passwordConfirm: "Valid@1234"
        });

      const res = await request(app)
        .post("/api/v1/auth/signup")
        .send({
          name: "User2",
          email: "duplicate@example.com",
          password: "Valid@1234",
          passwordConfirm: "Valid@1234"
        });

      expect(res.status).toBe(400);
      expect(res.body.message.toLowerCase()).toContain("email");
    });

  });

  // ------------------------------------------------------
  // LOGIN TESTS
  // ------------------------------------------------------
  describe("POST /auth/login", () => {

    const mockCookie = jest.fn();
    app.response.cookie = mockCookie;

    it("✓ should login successfully with valid credentials", async () => {
      await request(app)
        .post("/api/v1/auth/signup")
        .send({
          name: "Login User",
          email: "login@example.com",
          password: "Valid@1234",
          passwordConfirm: "Valid@1234"
        });

      const res = await request(app)
        .post("/api/v1/auth/login")
        .set("User-Agent", "JestTestAgent")
        .send({
          email: "login@example.com",
          password: "Valid@1234"
        });

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe("login@example.com");
      expect(res.body.token).toBeDefined();
      expect(mockCookie).toHaveBeenCalled();
    }, 20000);

    it("✓ should fail when email is missing", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          password: "Valid@1234"
        });

      expect(res.status).toBe(400);
      expect(res.body.errors[0].msg.toLowerCase()).toContain("email");
    });

    it("✓ should fail when password is missing", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "test@example.com"
        });

      expect(res.status).toBe(400);
      expect(res.body.errors[0].msg.toLowerCase()).toContain("password");
    });

    it("✓ should fail with invalid credentials", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "wrong@example.com",
          password: "WrongPass123"
        });

      expect(res.status).toBe(401);
    });

  });

});

// ------------------------------------------------------
// ADMIN SIGNUP TESTS
// ------------------------------------------------------
describe("POST /auth/adminSignup", () => {

  it("✓ should signup admin successfully with valid data", async () => {
    const res = await request(app)
      .post("/api/v1/auth/adminSignup")
      .send({
        name: "Admin User",
        email: "admin@example.com",
        password: "Valid@1234"
      });

    expect(res.status).toBe(201);
    expect(res.body.data.email).toBe("admin@example.com");
    expect(res.body.data.role).toBe("admin");
    expect(res.body.token).toBeDefined();
  });

  it("✓ should fail when name is missing", async () => {
    const res = await request(app)
      .post("/api/v1/auth/adminSignup")
      .send({
        email: "admin@example.com",
        password: "Valid@1234"
      });

    expect(res.status).toBe(400);
    expect(res.body.errors[0].msg.toLowerCase()).toContain("name");
  });

  it("✓ should fail when email is invalid", async () => {
    const res = await request(app)
      .post("/api/v1/auth/adminSignup")
      .send({
        name: "Admin User",
        email: "not-an-email",
        password: "Valid@1234"
      });

    expect(res.status).toBe(400);
    expect(res.body.errors[0].msg.toLowerCase()).toContain("invalid email");
  });

  it("✓ should fail when email already exists", async () => {
    await request(app)
      .post("/api/v1/auth/adminSignup")
      .send({
        name: "Admin1",
        email: "duplicate@example.com",
        password: "Valid@1234"
      });

    const res = await request(app)
      .post("/api/v1/auth/adminSignup")
      .send({
        name: "Admin2",
        email: "duplicate@example.com",
        password: "Valid@1234"
      });

    expect(res.status).toBe(400);
    expect(res.body.errors[0].msg.toLowerCase()).toContain("email");
  });

  it("✓ should fail when password is missing", async () => {
    const res = await request(app)
      .post("/api/v1/auth/adminSignup")
      .send({
        name: "Admin User",
        email: "admin@example.com"
      });

    expect(res.status).toBe(400);
    expect(res.body.errors[0].msg.toLowerCase()).toContain("password");
  });

});

// ------------------------------------------------------
// ADMIN LOGIN TESTS
// ------------------------------------------------------
describe("POST /auth/adminLogin", () => {

  it("✓ should login admin successfully", async () => {
    await request(app)
      .post("/api/v1/auth/adminSignup")
      .send({
        name: "Admin User",
        email: "admin@example.com",
        password: "Valid@1234"
      });

    const res = await request(app)
      .post("/api/v1/auth/adminLogin")
      .send({
        email: "admin@example.com",
        password: "Valid@1234"
      });

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe("admin@example.com");
    expect(res.body.data.role).toBe("admin");
    expect(res.body.token).toBeDefined();
  });

  it("✓ should fail when email is missing", async () => {
    const res = await request(app)
      .post("/api/v1/auth/adminLogin")
      .send({
        password: "Valid@1234"
      });

    expect(res.status).toBe(400);
    expect(res.body.errors[0].msg.toLowerCase()).toContain("email");
  });

  it("✓ should fail when password is missing", async () => {
    const res = await request(app)
      .post("/api/v1/auth/adminLogin")
      .send({
        email: "admin@example.com"
      });

    expect(res.status).toBe(400);
    expect(res.body.errors[0].msg.toLowerCase()).toContain("password");
  });

  it("✓ should fail when admin not found", async () => {
    const res = await request(app)
      .post("/api/v1/auth/adminLogin")
      .send({
        email: "notfound@example.com",
        password: "Valid@1234"
      });

    expect(res.status).toBe(401);
  });

  it("✓ should fail when password is incorrect", async () => {
    await request(app)
      .post("/api/v1/auth/adminSignup")
      .send({
        name: "Admin User",
        email: "admin2@example.com",
        password: "Valid@1234"
      });

    const res = await request(app)
      .post("/api/v1/auth/adminLogin")
      .send({
        email: "admin2@example.com",
        password: "WrongPassword"
      });

    expect(res.status).toBe(401);
  });

});

// ------------------------------------------------------
// FORGOT PASSWORD TESTS
// ------------------------------------------------------
describe("POST /auth/forgotPassword", () => {

  it("✓ should send reset code when email exists", async () => {
    await request(app)
      .post("/api/v1/auth/signup")
      .send({
        name: "User",
        email: "user@example.com",
        password: "Valid@1234",
        passwordConfirm: "Valid@1234"
      });

    const res = await request(app)
      .post("/api/v1/auth/forgotPassword")
      .send({
        email: "user@example.com"
      });

    expect(res.status).toBe(200);
    expect(res.body.message.toLowerCase()).toContain("reset");
  });

  it("✓ should fail when email is missing", async () => {
    const res = await request(app)
      .post("/api/v1/auth/forgotPassword")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.errors[0].msg.toLowerCase()).toContain("email");
  });

  it("✓ should fail when email format is invalid", async () => {
    const res = await request(app)
      .post("/api/v1/auth/forgotPassword")
      .send({
        email: "not-an-email"
      });

    expect(res.status).toBe(400);
    expect(res.body.errors[0].msg.toLowerCase()).toContain("invalid");
  });

  it("✓ should fail when user does not exist", async () => {
    const res = await request(app)
      .post("/api/v1/auth/forgotPassword")
      .send({
        email: "unknown@example.com"
      });

    expect(res.status).toBe(404);
  });

});

// ======================================================================
// SESSION TESTS (الخيار C — في نهاية الملف)
// ======================================================================

// ------------------------------------------------------
// MOCK AUTH MIDDLEWARE FOR SESSION TESTS
// ------------------------------------------------------
jest.mock("../../services/authService", () => {
  const original = jest.requireActual("../../services/authService");

  return {
    ...original,
    protect: (req, res, next) => {
      req.user = { _id: "123456789", role: "student" };
      next();
    },
    allowedTo: () => (req, res, next) => next(),
  };
});

// ------------------------------------------------------
// GET MY SESSIONS
// ------------------------------------------------------
describe("GET /auth/sessions", () => {

  it("✓ should return all active sessions", async () => {

    mockSessionFind.mockReturnValue({
      select: () => ({
        sort: () => [
          { _id: "1", createdAt: new Date() },
          { _id: "2", createdAt: new Date() }
        ]
      })
    });

    const res = await request(app)
      .get("/api/v1/auth/sessions")
      .set("Authorization", "Bearer faketoken");

    expect(res.status).toBe(200);
    expect(res.body.results).toBe(2);
  });

});

// ------------------------------------------------------
// LOGOUT FROM SPECIFIC SESSION
// ------------------------------------------------------
describe("DELETE /auth/sessions/:sessionId", () => {

  it("✓ should delete specific session", async () => {
    mockSessionFindOne.mockResolvedValue({ _id: "abc", user: "123456789" });
    mockSessionDeleteOne.mockResolvedValue({});

    const res = await request(app)
      .delete("/api/v1/auth/sessions/abc")
      .set("Authorization", "Bearer faketoken");

    expect(res.status).toBe(200);
    expect(res.body.message).toContain("terminated");
  });

  it("✓ should return 404 if session not found", async () => {
    mockSessionFindOne.mockResolvedValue(null);

    const res = await request(app)
      .delete("/api/v1/auth/sessions/unknown")
      .set("Authorization", "Bearer faketoken");

    expect(res.status).toBe(404);
  });

});

// ------------------------------------------------------
// LOGOUT FROM ALL OTHER SESSIONS
// ------------------------------------------------------
describe("DELETE /auth/sessions", () => {

 it("✓ should delete all other sessions except current", async () => {

  const jwt = require("jsonwebtoken");
  jest.spyOn(jwt, "verify").mockReturnValue({ userId: "123456789" });

  const bcrypt = require("bcryptjs");
  jest.spyOn(bcrypt, "compare").mockResolvedValue(true);

  mockSessionFind.mockResolvedValue([
    { _id: "1", refreshTokenHash: "anyhash" },
    { _id: "2", refreshTokenHash: "anyhash" }
  ]);

  mockSessionDeleteMany.mockResolvedValue({});

  const res = await request(app)
    .delete("/api/v1/auth/sessions")
    .set("Cookie", ["refreshToken=faketoken"]);

  expect(res.status).toBe(200);
  expect(res.body.message).toContain("terminated");
});

  it("✓ should fail when refresh token missing", async () => {
    const res = await request(app)
      .delete("/api/v1/auth/sessions");

    expect(res.status).toBe(401);
  });

});
