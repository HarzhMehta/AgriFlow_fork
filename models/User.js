import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        _id: {type: String, required: true},
        name: {type: String, required: true},
        email: {type: String, required: true},
        image: {type: String, required: false},
        // Agricultural Profile
        username: {type: String, required: false},
        location: {type: String, required: false},
        fieldSize: {type: String, required: false}, // e.g., "5 acres", "2 hectares"
        cropsGrown: {type: [String], default: []}, // e.g., ["Rice", "Wheat", "Cotton"]
        climate: {type: String, required: false}, // e.g., "Tropical", "Semi-arid"
        profileCompleted: {type: Boolean, default: false}
    },
    {timestamps: true}
);

const User = mongoose.models.User || mongoose.model("User", UserSchema)

export default User;