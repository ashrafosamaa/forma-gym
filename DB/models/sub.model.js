import { Schema, model } from "mongoose";

const subSchema = new Schema({
    duration: {
        type: Number,
        enum: [1, 2, 3],
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    UserId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    TrainerId: {
        type: Schema.Types.ObjectId,
        ref: 'Trainer',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: false
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    comment: {
        type: String
    }
}, { timestamps: true })

const Sub = model('Sub', subSchema)

export default Sub