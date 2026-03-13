/**
 * Saved Lectures API Tests
 */

require("dotenv").config({ path: "config.env.test" });

const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../app");

const User = require("../../models/userModel");
const Lecture = require("../../models/lectureModel");
const Subject = require("../../models/subjectModel");

// ------------------------------------------------------
// MOCK AUTH (Student)
// ------------------------------------------------------
jest.mock("../../services/authService", () => {
  const original = jest.requireActual("../../services/authService");

  return {
    ...original,
    protect: (req, res, next) => {
      req.user = {
        _id: "65f123456789abcdef123456",
        role: "student",
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
// Helper: Create Lecture
// ------------------------------------------------------
const createLecture = async () => {
  await Subject.create({
    _id: new mongoose.Types.ObjectId("65f333333333333333333333"),
    name: "Math",
    code: "MATH101",
    doctorId: new mongoose.Types.ObjectId("65f123456789abcdef123456"),
    semesterId: new mongoose.Types.ObjectId("65f111111111111111111111"),
    yearId: new mongoose.Types.ObjectId("65f222222222222222222222"),
  });

  return await Lecture.create({
    title: "Lecture 1",
    subjectId: "65f333333333333333333333",
    doctorId: new mongoose.Types.ObjectId("65f123456789abcdef123456"),
  });
};

// ------------------------------------------------------
// TEST SUITE
// ------------------------------------------------------
describe("Saved Lectures API", () => {
  beforeEach(async () => {
    await User.create({
      _id: "65f123456789abcdef123456",
      name: "Bashar",
      email: "bashar@test.com",
      password: "12345678",
      role: "student",
      studentData: {
        savedLectures: [],
      },
    });
  });

  // ------------------------------------------------------
  // ADD LECTURE
  // ------------------------------------------------------
  it("✓ should add lecture to saved list", async () => {
    const lecture = await createLecture();

    const res = await request(app)
      .post("/api/v1/saved-lectures")
      .send({ lectureId: lecture._id });

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  // ------------------------------------------------------
  // GET SAVED LECTURES
  // ------------------------------------------------------
  it("✓ should return saved lectures", async () => {
    const lecture = await createLecture();

    await request(app)
      .post("/api/v1/saved-lectures")
      .send({ lectureId: lecture._id });

    const res = await request(app).get("/api/v1/saved-lectures");

    expect(res.status).toBe(200);
    expect(res.body.results).toBe(1);
  });

  // ------------------------------------------------------
  // REMOVE LECTURE
  // ------------------------------------------------------
  it("✓ should remove lecture from saved list", async () => {
    const lecture = await createLecture();

    await request(app)
      .post("/api/v1/saved-lectures")
      .send({ lectureId: lecture._id });

    const res = await request(app).delete(
      `/api/v1/saved-lectures/${lecture._id}`
    );

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(0);
  });

  // ------------------------------------------------------
  // DELETE ALL SAVED LECTURES
  // ------------------------------------------------------
  it("✓ should delete all saved lectures", async () => {
    const lecture = await createLecture();

    await request(app)
      .post("/api/v1/saved-lectures")
      .send({ lectureId: lecture._id });

    const res = await request(app).delete("/api/v1/saved-lectures");

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(0);
  });
});
