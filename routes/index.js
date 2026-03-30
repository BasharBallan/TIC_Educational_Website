const subjectRoute = require("./subjectRoute");

const userRoute = require("./userRoute");
const authRoute = require("./authRoute");
const doctorRoute = require("./doctorRoute");
const yearRoute = require("./yearRoute");
const semesterRoute = require("./semesterRoute");
const lectureRoute = require("./lectureRoute");
const savedLecturesRoute = require("./savedLecturesRoute");
const healthRoute = require("./healthRoute");


const mountRoutes = (app) => {
  app.use("/api/v1/auth", authRoute);
  app.use("/api/v1/users", userRoute);
  app.use("/api/v1/doctors", doctorRoute);
app.use("/api/v1/subjects", subjectRoute);

  app.use("/api/v1/years", yearRoute);
  app.use("/api/v1/semesters", semesterRoute);
  app.use("/api/v1/lectures", lectureRoute);
app.use("/api/v1/saved-lectures", savedLecturesRoute);
app.use("/api/v1/health", healthRoute);

};

module.exports = mountRoutes;
