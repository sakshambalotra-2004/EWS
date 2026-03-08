const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'faculty', 'counselor', 'student'],
      required: true,
    },
    phone: { type: String },
    isActive: { type: Boolean, default: true },

    // Student-specific
    studentId: { type: String },
    department: { type: String },
    semester: { type: Number },
    batch: { type: String },

    // Faculty-specific
    facultyId: { type: String },
    assignedSubjects: [{ type: String }],
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);