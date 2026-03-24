/**
 * Lecture API Tests (Admin + Student)
 */

require("dotenv").config({ path: "config.env.test" });

const request = require("supertest");
const mongoose = require("mongoose");
let app = require("../../app");

const Lecture = require("../../models/lectureModel");
const Subject = require("../../models/subjectModel");

// ------------------------------------------------------
// MOCK REDIS
// ------------------------------------------------------
jest.mock("../../config/redis", () => ({
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue("OK"),
  del: jest.fn().mockResolvedValue(1),
}));

// ------------------------------------------------------
// PARTIAL MOCK AUTH (protect + allowedTo فقط)
// ------------------------------------------------------
jest.mock("../../services/authService", () => {
  const original = jest.requireActual("../../services/authService");

  return {
    ...original,
    protect: jest.fn(),
    allowedTo: jest.fn(() => (req, res, next) => next()),
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
// ADMIN TESTS
// ------------------------------------------------------
describe("Lecture API (Admin)", () => {
  const auth = require("../../services/authService");

  beforeEach(() => {
    auth.protect.mockImplementation((req, res, next) => {
      req.user = {
        _id: "65f123456789abcdef123456",
        role: "admin",
      };
      next();
    });
  });

  it("✓ should return empty list when no lectures exist", async () => {
    const res = await request(app).get("/api/v1/lectures");

    expect(res.status).toBe(200);
    expect(res.body.results).toBe(0);
  });

  it("✓ should return lecture by ID", async () => {
    await Subject.create({
      _id: "65f333333333333333333333",
      name: "Math",
      code: "MATH101",
      doctorId: new mongoose.Types.ObjectId(),
      semesterId: new mongoose.Types.ObjectId(),
      yearId: new mongoose.Types.ObjectId(),
    });

    const lecture = await Lecture.create({
      title: "Lecture 1",
      subjectId: "65f333333333333333333333",
      doctorId: new mongoose.Types.ObjectId(),
    });

    const res = await request(app).get(`/api/v1/lectures/${lecture._id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe("Lecture 1");
  });

  it("✓ should return 404 if lecture not found", async () => {
    const res = await request(app).get("/api/v1/lectures/65f555555555555555555555");
    expect(res.status).toBe(404);
  });

  it("✓ should delete lecture successfully", async () => {
    await Subject.create({
      _id: "65f333333333333333333333",
      name: "Math",
      code: "MATH101",
      doctorId: new mongoose.Types.ObjectId(),
      semesterId: new mongoose.Types.ObjectId(),
      yearId: new mongoose.Types.ObjectId(),
    });

    const lecture = await Lecture.create({
      title: "Lecture to delete",
      subjectId: "65f333333333333333333333",
      doctorId: new mongoose.Types.ObjectId(),
    });

    const res = await request(app).delete(`/api/v1/lectures/${lecture._id}`);

    expect(res.status).toBe(200);
  });

  it("✓ should return 404 when deleting non-existing lecture", async () => {
    const res = await request(app).delete("/api/v1/lectures/65f666666666666666666666");
    expect(res.status).toBe(404);
  });
});

// ------------------------------------------------------
// STUDENT TESTS
// ------------------------------------------------------
describe("Lecture API (Student)", () => {
  const auth = require("../../services/authService");
  let studentYearId;

  beforeEach(() => {
    studentYearId = new mongoose.Types.ObjectId();

    auth.protect.mockImplementation((req, res, next) => {
      req.user = {
        _id: "65f777777777777777777777",
        role: "student",
        yearId: studentYearId,
      };
      next();
    });
  });

  it("✓ should return 400 if student year is missing", async () => {
    auth.protect.mockImplementation((req, res, next) => {
      req.user = { _id: "65f777777777777777777777", role: "student" };
      next();
    });

    const res = await request(app).get("/api/v1/lectures/my-lectures");

    expect(res.status).toBe(400);
  });

  it("✓ should return empty list if no subjects for student's year", async () => {
    const res = await request(app).get("/api/v1/lectures/my-lectures");

    expect(res.status).toBe(200);
    expect(res.body.results).toBe(0);
  });

  it("✓ should return lectures for student's year", async () => {
    const subject = await Subject.create({
      name: "Physics",
      code: "PHY101",
      yearId: studentYearId,
      doctorId: new mongoose.Types.ObjectId(),
      semesterId: new mongoose.Types.ObjectId(),
    });

    await Lecture.create({
      title: "Intro to Physics",
      subjectId: subject._id,
      doctorId: new mongoose.Types.ObjectId(),
    });

    const res = await request(app).get("/api/v1/lectures/my-lectures");

    expect(res.status).toBe(200);
    expect(res.body.results).toBe(1);
    expect(res.body.data[0].title).toBe("Intro to Physics");
    expect(res.body.data[0].subject.name).toBe("Physics");
  });
});
