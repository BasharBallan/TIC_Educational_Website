/**
 * Doctor Routes Test Suite
 * Integration Tests + Mock Auth
 */

require("dotenv").config({ path: "config.env.test" });

const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../app");

const Subject = require("../../models/subjectModel");
const Lecture = require("../../models/lectureModel");

// ------------------------------------------------------
// MOCK AUTH MIDDLEWARE (NO MONGOOSE HERE!)
// ------------------------------------------------------
jest.mock("../../services/authService", () => {
  const originalModule = jest.requireActual("../../services/authService");

  return {
    ...originalModule,
    protect: (req, res, next) => {
      req.user = {
        _id: "65f123456789abcdef123456",
        role: "doctor",
        doctorData: {
          subjects: ["65f333333333333333333333"]
        }
      };
      next();
    },
    allowedTo: () => (req, res, next) => next()
  };
});

// ------------------------------------------------------
// MOCK FILE UPLOAD
// ------------------------------------------------------
jest.mock("../../middlewares/uploadAnyFileMiddlware", () => ({
  uploadLectureFile: (req, res, next) => {
    req.file = null;
    next();
  }
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
// Helper: Create Subject assigned to doctor
// ------------------------------------------------------
const createSubject = async () => {
  return await Subject.create({
    _id: new mongoose.Types.ObjectId("65f333333333333333333333"),
    name: "Mathematics",
    code: "MATH101",
    lectures: [],
    doctorId: new mongoose.Types.ObjectId("65f123456789abcdef123456"),
    semesterId: new mongoose.Types.ObjectId("65f111111111111111111111"),
    yearId: new mongoose.Types.ObjectId("65f222222222222222222222")
  });
};

// ------------------------------------------------------
// TEST SUITE
// ------------------------------------------------------
describe("Doctor API", () => {

  // ------------------------------------------------------
  // GET /api/v1/doctors
  // ------------------------------------------------------
  describe("GET /api/v1/doctors", () => {
    it("✓ should return empty list when doctor has no lectures", async () => {
      await createSubject();

      const res = await request(app).get("/api/v1/doctors");

      expect(res.status).toBe(200);
      expect(res.body.results).toBe(0);
      expect(res.body.data).toEqual([]);
    });
  });

  // ------------------------------------------------------
  // POST /api/v1/doctors
  // ------------------------------------------------------
  describe("POST /api/v1/doctors", () => {
    it("✓ should create lecture successfully", async () => {
      await createSubject();

      const res = await request(app)
        .post("/api/v1/doctors")
        .send({
          title: "Lecture 1",
          description: "Intro to Math",
          subjectId: "65f333333333333333333333"
        });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe("Lecture 1");
    });

    it("✓ should fail when subject does not exist", async () => {
      const res = await request(app)
        .post("/api/v1/doctors")
        .send({
          title: "Lecture 1",
          subjectId: "65f999999999999999999999"
        });

      expect(res.status).toBe(404);
    });

    it("✓ should fail when doctor is not assigned to subject", async () => {
      await Subject.create({
        _id: new mongoose.Types.ObjectId("65f444444444444444444444"),
        name: "Physics",
        code: "PHY101",
        doctorId: new mongoose.Types.ObjectId("65f000000000000000000000"),
        semesterId: new mongoose.Types.ObjectId("65f111111111111111111111"),
        yearId: new mongoose.Types.ObjectId("65f222222222222222222222")
      });

      const res = await request(app)
        .post("/api/v1/doctors")
        .send({
          title: "Lecture 1",
          subjectId: "65f444444444444444444444"
        });

      expect(res.status).toBe(403);
    });
  });

  // ------------------------------------------------------
  // GET /api/v1/doctors/:id
  // ------------------------------------------------------
  describe("GET /api/v1/doctors/:id", () => {
    it("✓ should return lecture if doctor owns it", async () => {
      await createSubject();

      const lecture = await Lecture.create({
        title: "Lecture 1",
        subjectId: new mongoose.Types.ObjectId("65f333333333333333333333"),
        doctorId: new mongoose.Types.ObjectId("65f123456789abcdef123456")
      });

      const res = await request(app).get(`/api/v1/doctors/${lecture._id}`);

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe("Lecture 1");
    });

    it("✓ should fail if lecture not found", async () => {
      const res = await request(app).get(
        "/api/v1/doctors/65f555555555555555555555"
      );

      expect(res.status).toBe(404);
    });
  });

  // ------------------------------------------------------
  // PUT /api/v1/doctors/:id
  // ------------------------------------------------------
  describe("PUT /api/v1/doctors/:id", () => {
    it("✓ should update lecture successfully", async () => {
      await createSubject();

      const lecture = await Lecture.create({
        title: "Old Title",
        subjectId: new mongoose.Types.ObjectId("65f333333333333333333333"),
        doctorId: new mongoose.Types.ObjectId("65f123456789abcdef123456")
      });

      const res = await request(app)
        .put(`/api/v1/doctors/${lecture._id}`)
        .send({ title: "New Title" });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe("New Title");
    });

    it("✓ should fail if lecture not owned by doctor", async () => {
      const lecture = await Lecture.create({
        title: "Lecture",
        subjectId: new mongoose.Types.ObjectId("65f333333333333333333333"),
        doctorId: new mongoose.Types.ObjectId("65f000000000000000000000")
      });

      const res = await request(app)
        .put(`/api/v1/doctors/${lecture._id}`)
        .send({ title: "New Title" });

      expect(res.status).toBe(404);
    });
  });

  // ------------------------------------------------------
  // DELETE /api/v1/doctors/:id
  // ------------------------------------------------------
  describe("DELETE /api/v1/doctors/:id", () => {
    it("✓ should delete lecture successfully", async () => {
      await createSubject();

      const lecture = await Lecture.create({
        title: "Lecture",
        subjectId: new mongoose.Types.ObjectId("65f333333333333333333333"),
        doctorId: new mongoose.Types.ObjectId("65f123456789abcdef123456")
      });

      const res = await request(app).delete(`/api/v1/doctors/${lecture._id}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("deleted");
    });

    it("✓ should fail if lecture not owned by doctor", async () => {
      const lecture = await Lecture.create({
        title: "Lecture",
        subjectId: new mongoose.Types.ObjectId("65f333333333333333333333"),
        doctorId: new mongoose.Types.ObjectId("65f000000000000000000000")
      });

      const res = await request(app).delete(`/api/v1/doctors/${lecture._id}`);

      expect(res.status).toBe(404);
    });
  });

});
