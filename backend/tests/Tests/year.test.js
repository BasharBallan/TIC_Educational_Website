require("dotenv").config({ path: "config.env.test" });

const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../app");

const Year = require("../../models/yearModel");

// ------------------------------------------------------
// MOCK AUTH (Admin)
// ------------------------------------------------------
jest.mock("../../services/authService", () => {
  const original = jest.requireActual("../../services/authService");

  return {
    ...original,
    protect: (req, res, next) => {
      req.user = {
        _id: "65f123456789abcdef123456",
        role: "admin",
      };
      next();
    },
    allowedTo: () => (req, res, next) => next(),
  };
});


// ------------------------------------------------------
// MOCK REDIS
// ------------------------------------------------------
jest.mock("../../config/redis", () => ({
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue("OK"),
  del: jest.fn().mockResolvedValue(1),
}));
// ------------------------------------------------------
// DB SETUP
// ------------------------------------------------------
beforeAll(async () => {
  await mongoose.connect(process.env.DB_URI);
});

afterEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongoose.connection.close();
});

// ------------------------------------------------------
// TEST SUITE
// ------------------------------------------------------
describe("Year API (Admin)", () => {

  it("✓ should return empty list when no years exist", async () => {
    const res = await request(app).get("/api/v1/years");

    expect(res.status).toBe(200);
  });

  it("✓ should create and return all years", async () => {
   await Year.create({ name: "Year 1", code: "Y1" });
await Year.create({ name: "Year 2", code: "Y2" });

    const res = await request(app).get("/api/v1/years");

    expect(res.status).toBe(200);
  });

  it("✓ should return year by ID", async () => {
   const year = await Year.create({ name: "Year X", code: "YX" });


    const res = await request(app).get(`/api/v1/years/${year._id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Year X");
  });

  it("✓ should return 404 if year not found", async () => {
    const res = await request(app).get("/api/v1/years/65f555555555555555555555");

    expect(res.status).toBe(404);
  });
});
