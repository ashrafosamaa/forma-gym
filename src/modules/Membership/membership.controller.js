import { APIFeatures } from "../../utils/api-features.js";

import Membership from "../../../DB/models/membership.model.js";
import User from "../../../DB/models/user.model.js";

//user

export const addMembership = async (req, res, next) => {
    // destruct data from req.body
    const { duration, startDate } = req.body
    const {_id} = req.authUser
    // set price & time
    let price
    if(duration == 1) price = 400
    else if(duration == 3) price = 950
    else if(duration == 6) price = 1800
    else if(duration == 12) price = 3600
    const start = new Date(startDate)
    const endDate = new Date(start)
    endDate.setMonth(endDate.getMonth() + duration)
    // create membership
    await Membership.create({ duration, startDate, endDate, price, UserId: _id })
    // send response
    return res.status(201).json({
        msg: "Membership added successfully",
        statusCode: 201
    })
}

export const getMyMemberships = async (req, res, next) => {
    const {_id} = req.authUser
    const memberships = await Membership.find({UserId: _id}).select("duration startDate endDate price isActive isPaid")
    if (memberships.length == 0) {
        return next(new Error("No memberships found", { cause: 404 }));
    }
    // send response
    return res.status(200).json({
        msg: "Your Memberships data fetched successfully", 
        statusCode: 200,
        memberships
    });
}

export const getMyMembershipById = async (req, res, next) => {
    const {membershipId} = req.params
    const {_id: UserId} = req.authUser
    const membership = await Membership.findOne({ _id: membershipId, UserId }).select("duration startDate endDate price isActive isPaid")
    if (!membership) {
        return next(new Error("Membership is not found", { cause: 404 }));
    }
    // send response
    return res.status(200).json({
        msg: "Membership data fetched successfully", 
        statusCode: 200,
        membership
    });
}

export const updateMyMembership = async (req, res, next)=> {
    // destruct data from req.body
    const { duration, startDate } = req.body
    const {membershipId} = req.params
    const {_id: UserId} = req.authUser
    // get membership
    const membership = await Membership.findOne({ _id: membershipId, UserId }).select("duration startDate endDate price isActive isPaid")
    if(!membership){
        return next(new Error("Membership is not found", { cause: 404 }));
    }
    if(membership.isActive) {
        return next(new Error("You can not update your membership now", { cause: 403 }));
    }
    // set price & time
    const finalDuration = duration ?? membership.duration
    const start = new Date(startDate ?? membership.startDate)
    const endDate = new Date(start)
    endDate.setMonth(endDate.getMonth() + finalDuration)
    let price
    if (finalDuration == 1) price = 400
    else if (finalDuration == 3) price = 950
    else if (finalDuration == 6) price = 1800
    else if (finalDuration == 12) price = 3600
    membership.duration = finalDuration
    membership.startDate = start
    membership.endDate = endDate
    membership.price = price
    await membership.save()
    // send response
    res.status(200).json({
        msg: "Membership updated successfully", 
        statusCode: 200,
    })
}

export const deleteMyMembership = async (req, res, next)=> {
    const {membershipId} = req.params
    const {_id: UserId} = req.authUser
    // get membership
    const membership = await Membership.findOne({ _id: membershipId, UserId })
    if(!membership){
        return next(new Error("Membership is not found", { cause: 404 }));
    }
    if(membership.isActive || membership.isPaid) {
        return next(new Error("You can not delete your membership now", { cause: 403 }));
    }
    await membership.deleteOne()
    // send response
    res.status(200).json({
        msg: "Membership deleted successfully", 
        statusCode: 200,
    })
}

//admin

export const getAllMembershipsByAdmin = async (req, res, next) => {
    // destruct data from req.query
    const {page, size, sortBy} = req.query;
    const features = new APIFeatures(req.query, Membership.find().select("duration startDate endDate price isActive isPaid"))
        .pagination({ page, size })
        .sort(sortBy)
    const memberships = await features.mongooseQuery
    if(!memberships.length) {
        return next(new Error("No memberships found", { cause: 404 }))
    }
    // send response
    res.status(200).json({
        msg: "Memberships data fetched successfully", 
        statusCode: 200,
        memberships
    })
}

export const getMembershipByAdmin = async (req, res, next) => {
    const {membershipId} = req.params
    const membership = await Membership.findById(membershipId).select("duration startDate endDate price isActive isPaid")
        .populate({ path: "UserId", select: "firstName lastName phoneNumber" })
    if (!membership) {
        return next(new Error("Membership is not found", { cause: 404 }));
    }
    // send response
    return res.status(200).json({
        msg: "Membership data fetched successfully",
        statusCode: 200,
        membership
    });
}

export const addMembershipByAdmin = async (req, res, next) => {
    // destruct data from req.body
    const { duration, startDate, phoneNumber } = req.body
    // get user
    const user = await User.findOne({ phoneNumber })
    if(!user) {
        return next(new Error("User is not found", { cause: 404 }))
    }
    // set price & time
    let price
    if(duration == 1) price = 400
    else if(duration == 3) price = 950
    else if(duration == 6) price = 1800
    else if(duration == 12) price = 3600
    const start = new Date(startDate)
    const endDate = new Date(start)
    endDate.setMonth(endDate.getMonth() + duration)
    // create membership
    await Membership.create({ duration, startDate, endDate, price, UserId: user._id })
    // send response
    return res.status(201).json({
        msg: "Membership added successfully",
        statusCode: 201
    })
}

export const updateMembershipByAdmin = async (req, res, next)=> {
    // destruct data from req.body
    const { duration, startDate, isActive, isPaid } = req.body
    const {membershipId} = req.params
    // get membership
    const membership = await Membership.findOne({ _id: membershipId })
    if(!membership){
        return next(new Error("Membership is not found", { cause: 404 }));
    }
    if(membership.isActive) {
        return next(new Error("You can not update your membership now", { cause: 403 }));
    }
    // set price & time
    const finalDuration = duration ?? membership.duration
    const start = new Date(startDate ?? membership.startDate)
    const endDate = new Date(start)
    endDate.setMonth(endDate.getMonth() + finalDuration)
    let price
    if (finalDuration == 1) price = 400
    else if (finalDuration == 3) price = 950
    else if (finalDuration == 6) price = 1800
    else if (finalDuration == 12) price = 3600
    membership.duration = finalDuration
    membership.startDate = start
    membership.endDate = endDate
    membership.price = price
    if(isActive) membership.isActive = isActive
    if(isPaid) membership.isPaid = isPaid
    await membership.save()
    // send response
    res.status(200).json({
        msg: "Membership updated successfully",
        statusCode: 200,
    })
}

export const deleteMembershipByAdmin = async (req, res, next)=> {
    const {membershipId} = req.params
    // get membership
    const membership = await Membership.findOne({ _id: membershipId })
    if(!membership){
        return next(new Error("Membership is not found", { cause: 404 }));
    }
    if(membership.isActive || membership.isPaid) {
        return next(new Error("You can not delete your membership now", { cause: 403 }));
    }
    await membership.deleteOne()
    // send response
    res.status(200).json({
        msg: "Membership deleted successfully",
        statusCode: 200,
    })
}

// addition feature

export const getAllMemberShipsForUser = async (req, res, next) => {
    // destruct data from body
    const { phoneNumber } = req.body;
    // get user
    const user = await User.findOne({ phoneNumber })
    if(!user) {
        return next(new Error("User is not found", { cause: 404 }))
    }
    const memberships = await Membership.find({ UserId: user._id }).select("duration startDate endDate price isActive isPaid")
        .populate({ path: "UserId", select: "firstName lastName phoneNumber" })
    if (!memberships.length) {
        return next(new Error("No memberships found", { cause: 404 }));
    }
    res.status(200).json({
        msg: "Users data fetched successfully",
        statusCode: 200,
        memberships
    });
}