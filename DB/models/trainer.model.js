import { Schema, model } from "mongoose";

const trainerSchema = new Schema({
    userName: {
        type: String,
        lowercase: true,
        unique: true,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    experience: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    phoneNumber: {
        type: String,
        unique: true,
        length: 11
    },
    gender: {
        type: String,
        enum: ["male", "female"],
        required: true
    },
    pricePerMonth: {
        type: Number,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    specialization: {
        type: String,
        enum: [ "Personal", "Bodybuilding", "Functional", "Cardio",
            "Rehabilitation", "Physiotherapy", "Yoga", "Nutrition" ],
        required: true
    },
    profileImg: {
        secure_url: { type: String },
        public_id: { type: String }
    },
    folderId: { type: String },
    rate: {
        type: Number,
        default: 0
    },
    rateCount: {
        type: Number,
        default: 0
    },
    role: {
        type: String,
        required: true,
        enum: ["trainer"],
        default: "trainer"
    },
}, {timestamps: true,});

const Trainer = model("trainerSchema", trainerSchema);

export default Trainer;