import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    // Existing fields (unchanged)
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    regno: {
        type: Number,
        required: true,
        min: 0
    },
    auraPoints: {
        type: Number,
        default: 0,
    },
    achievements: {
        type: [String],
    },
    dark: {
        type: Boolean,
        default: false,
    },
    userRole: {
        type: String,
        enum: ['student', 'teacher', 'authority'],
        required: true,
        default: 'student'
    },

    // New fields as per your request
    course: {
        type: String
    },
    branch: {
        type: String,
        required: function() { return ['student', 'teacher'].includes(this.userRole); }
    },
    semester: {
        type: Number,
        required: function() { return this.userRole === 'student'; }
    },
    subjects: {
        type: [String],
        required: function() { return this.userRole === 'teacher'; }
    },
    dateOfBirth: {
        type: Date
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', 'prefer-not-to-say'],
        default: 'prefer-not-to-say'
    },
    address: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        postalCode: { type: String },
        country: { type: String, default: 'India' }
    },
    profilePic: {
        type: String, // This will store the URL/path to the image
        default: '' // Default can be a placeholder image URL if needed
    }
}, {
    timestamps: true // This automatically adds createdAt and updatedAt fields
});

const UserModel = mongoose.model("User", userSchema);
export { UserModel };