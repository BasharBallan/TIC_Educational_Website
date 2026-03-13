/**
 * Auth API Test Suite
 * Covers: Signup + Login
 */

jest.mock("../../utils/sendEmail", () => {
  return jest.fn().mockResolvedValue(true);
});


require("dotenv").config({ path: "config.env.test" });

const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../app");

beforeAll(async () => {
  await mongoose.connect(process.env.DB_URI);
});

afterEach(async () => {
  await mongoose.connection.db.dropDatabase();
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

    it("✓ should login successfully with valid credentials", async () => {
      // Create user first
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
        .send({
          email: "login@example.com",
          password: "Valid@1234"
        });

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe("login@example.com");
      expect(res.body.token).toBeDefined();
    });

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
    // Create admin using adminSignup
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
    // Create user
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
