/**
 * Subject API Tests (Admin Only)
 */

require("dotenv").config({ path: "config.env.test" });

const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../app");

const Subject = require("../../models/subjectModel");
const User = require("../../models/userModel");
const Year = require("../../models/yearModel");
const Semester = require("../../models/semesterModel");

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
// Helpers
// ------------------------------------------------------
const createDoctor = async () => {
  return await User.create({
    _id: new mongoose.Types.ObjectId("65f222222222222222222222"),
    name: "Dr. Bashar",
    email: "doctor@test.com",
    password: "12345678",
    role: "doctor",
    doctorData: { subjects: [] },
  });
};

const createYear = async () => {
  return await Year.create({
    _id: new mongoose.Types.ObjectId("65f111111111111111111111"),
    name: "Year 1",
  });
};

const createSemester = async () => {
  return await Semester.create({
    _id: new mongoose.Types.ObjectId("65f333333333333333333333"),
    name: "Semester 1",
    yearId: "65f111111111111111111111",
  });
};

// ------------------------------------------------------
// TEST SUITE
// ------------------------------------------------------
describe("Subject API (Admin)", () => {

  // ------------------------------------------------------
  // GET ALL SUBJECTS
  // ------------------------------------------------------
  it("✓ should return empty list when no subjects exist", async () => {
    const res = await request(app).get("/api/v1/subjects");

    expect(res.status).toBe(200);
    expect(res.body.results).toBe(0);
    expect(res.body.data).toEqual([]);
  });

  // ------------------------------------------------------
  // CREATE SUBJECT
  // ------------------------------------------------------
  it("✓ should create a subject successfully", async () => {
    await createDoctor();
    await createYear();
    await createSemester();

    const res = await request(app)
      .post("/api/v1/subjects")
      .send({
        name: "Math",
        code: "MATH101",
        description: "Basic math",
        doctorId: "65f222222222222222222222",
        yearId: "65f111111111111111111111",
        semesterId: "65f333333333333333333333",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe("Math");
  });

  // ------------------------------------------------------
  // GET SUBJECT BY ID
  // ------------------------------------------------------
  it("✓ should return subject by ID", async () => {
    await createDoctor();
    await createYear();
    await createSemester();

    const subject = await Subject.create({
      name: "Physics",
      code: "PHY101",
      doctorId: "65f222222222222222222222",
      yearId: "65f111111111111111111111",
      semesterId: "65f333333333333333333333",
    });

    const res = await request(app).get(`/api/v1/subjects/${subject._id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Physics");
  });

  it("✓ should return 404 if subject not found", async () => {
    const res = await request(app).get("/api/v1/subjects/65f555555555555555555555");

    expect(res.status).toBe(404);
  });

  // ------------------------------------------------------
  // UPDATE SUBJECT
  // ------------------------------------------------------
  it("✓ should update subject successfully", async () => {
    await createDoctor();
    await createYear();
    await createSemester();

    const subject = await Subject.create({
      name: "Old Name",
      code: "OLD101",
      doctorId: "65f222222222222222222222",
      yearId: "65f111111111111111111111",
      semesterId: "65f333333333333333333333",
    });

    const res = await request(app)
      .put(`/api/v1/subjects/${subject._id}`)
      .send({ name: "Updated Name" });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Updated Name");
  });

  it("✓ should return 404 when updating non-existing subject", async () => {
    const res = await request(app)
      .put("/api/v1/subjects/65f666666666666666666666")
      .send({ name: "New Name" });

    expect(res.status).toBe(404);
  });

  // ------------------------------------------------------
  // DELETE SUBJECT
  // ------------------------------------------------------
  it("✓ should delete subject successfully", async () => {
    await createDoctor();
    await createYear();
    await createSemester();

    const subject = await Subject.create({
      name: "To Delete",
      code: "DEL101",
      doctorId: "65f222222222222222222222",
      yearId: "65f111111111111111111111",
      semesterId: "65f333333333333333333333",
    });

    const res = await request(app).delete(`/api/v1/subjects/${subject._id}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toContain("deleted");
  });

  it("✓ should return 404 when deleting non-existing subject", async () => {
    const res = await request(app).delete("/api/v1/subjects/65f777777777777777777777");

    expect(res.status).toBe(404);
  });
});
