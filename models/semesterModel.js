const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema(
  {
    name: { 
        type: String, 
        required: [true, "name required"]
    },
    code: {
         type: String, 
        unique: [true, "semester code must be unique"]
    },
    yearId: { 
        type: mongoose.Schema.ObjectId,
         ref: 'Year',
         required: [true, "yearId required"] },

    subjects: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Subject',
      },
    ],
  },
  { timestamps: true }
);

const Semester = mongoose.model('Semester', semesterSchema);

module.exports = Semester;
