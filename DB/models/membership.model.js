import { Schema, model } from "mongoose";

const membershipSchema = new Schema({
    duration: {
        type: Number,
        enum: [1, 3, 6, 12],
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
    }
}, { timestamps: true })

const Membership = model('Membership', membershipSchema)

export default Membership