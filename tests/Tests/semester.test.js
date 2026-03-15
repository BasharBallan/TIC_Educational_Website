/**
 * Semester API Tests (Admin Only)
 */

require("dotenv").config({ path: "config.env.test" });

const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../app");

const Semester = require("../../models/semesterModel");
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
// Helper: Create Year
// ------------------------------------------------------
const createYear = async () => {
  return await Year.create({
    _id: new mongoose.Types.ObjectId("65f111111111111111111111"),
    name: "Year 1",
  });
};

// ------------------------------------------------------
// TEST SUITE
// ------------------------------------------------------
describe("Semester API (Admin)", () => {

  // ------------------------------------------------------
  // GET ALL SEMESTERS
  // ------------------------------------------------------
  it("✓ should return empty list when no semesters exist", async () => {
    const res = await request(app).get("/api/v1/semesters");

    expect(res.status).toBe(200);
    expect(res.body.results).toBe(0);
    expect(res.body.data).toEqual([]);
  });

  // ------------------------------------------------------
  // CREATE SEMESTER
  // ------------------------------------------------------
  it("✓ should create a semester successfully", async () => {
    await createYear();

    const res = await request(app)
      .post("/api/v1/semesters")
      .send({
        name: "Semester 1",
        yearId: "65f111111111111111111111",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe("Semester 1");
  });

  // ------------------------------------------------------
  // GET SEMESTER BY ID
  // ------------------------------------------------------
  it("✓ should return semester by ID", async () => {
    await createYear();

    const semester = await Semester.create({
      name: "Semester 1",
      yearId: "65f111111111111111111111",
    });

    const res = await request(app).get(`/api/v1/semesters/${semester._id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Semester 1");
  });

  it("✓ should return 404 if semester not found", async () => {
    const res = await request(app).get("/api/v1/semesters/65f555555555555555555555");

    expect(res.status).toBe(404);
  });

  // ------------------------------------------------------
  // UPDATE SEMESTER
  // ------------------------------------------------------
  it("✓ should update semester successfully", async () => {
    await createYear();

    const semester = await Semester.create({
      name: "Old Name",
      yearId: "65f111111111111111111111",
    });

    const res = await request(app)
      .put(`/api/v1/semesters/${semester._id}`)
      .send({ name: "Updated Name" });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Updated Name");
  });

  it("✓ should return 404 when updating non-existing semester", async () => {
    const res = await request(app)
      .put("/api/v1/semesters/65f666666666666666666666")
      .send({ name: "New Name" });

    expect(res.status).toBe(404);
  });

  // ------------------------------------------------------
  // DELETE SEMESTER
  // ------------------------------------------------------
  it("✓ should delete semester successfully", async () => {
    await createYear();

    const semester = await Semester.create({
      name: "Semester to delete",
      yearId: "65f111111111111111111111",
    });

    const res = await request(app).delete(`/api/v1/semesters/${semester._id}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toContain("deleted");
  });

  it("✓ should return 404 when deleting non-existing semester", async () => {
    const res = await request(app).delete("/api/v1/semesters/65f777777777777777777777");

    expect(res.status).toBe(404);
  });
});
