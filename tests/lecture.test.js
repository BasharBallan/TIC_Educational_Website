/**
 * Lecture API Tests (Admin Only)
 */

require("dotenv").config({ path: "config.env.test" });

const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../app");

const Lecture = require("../../models/lectureModel");
const Subject = require("../../models/subjectModel");

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
// Helper: Create Subject
// ------------------------------------------------------
const createSubject = async () => {
  return await Subject.create({
    _id: new mongoose.Types.ObjectId("65f333333333333333333333"),
    name: "Math",
    code: "MATH101",
    doctorId: new mongoose.Types.ObjectId("65f123456789abcdef123456"),
    semesterId: new mongoose.Types.ObjectId("65f111111111111111111111"),
    yearId: new mongoose.Types.ObjectId("65f222222222222222222222"),
  });
};

// ------------------------------------------------------
// TEST SUITE
// ------------------------------------------------------
describe("Lecture API (Admin)", () => {

  // ------------------------------------------------------
  // GET ALL LECTURES
  // ------------------------------------------------------
  it("✓ should return empty list when no lectures exist", async () => {
    const res = await request(app).get("/api/v1/lectures");

    expect(res.status).toBe(200);
    expect(res.body.results).toBe(0);
    expect(res.body.data).toEqual([]);
  });

  // ------------------------------------------------------
  // GET LECTURE BY ID
  // ------------------------------------------------------
  it("✓ should return lecture by ID", async () => {
    await createSubject();

    const lecture = await Lecture.create({
      title: "Lecture 1",
      subjectId: "65f333333333333333333333",
      doctorId: new mongoose.Types.ObjectId("65f123456789abcdef123456")
    });

    const res = await request(app).get(`/api/v1/lectures/${lecture._id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe("Lecture 1");
  });

  it("✓ should return 404 if lecture not found", async () => {
    const res = await request(app).get("/api/v1/lectures/65f555555555555555555555");

    expect(res.status).toBe(404);
  });

  // ------------------------------------------------------
  // DELETE LECTURE
  // ------------------------------------------------------
  it("✓ should delete lecture successfully", async () => {
    await createSubject();

    const lecture = await Lecture.create({
      title: "Lecture to delete",
      subjectId: "65f333333333333333333333",
      doctorId: new mongoose.Types.ObjectId("65f123456789abcdef123456")
    });

    const res = await request(app).delete(`/api/v1/lectures/${lecture._id}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");

  });

  it("✓ should return 404 when deleting non-existing lecture", async () => {
    const res = await request(app).delete("/api/v1/lectures/65f666666666666666666666");

    expect(res.status).toBe(404);
  });
});
