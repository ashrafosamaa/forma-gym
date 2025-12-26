import { APIFeatures } from "../../utils/api-features.js";

import Sub from "../../../DB/models/sub.model.js";
import User from "../../../DB/models/user.model.js";
import Trainer from "../../../DB/models/trainer.model.js";

//user

export const addSubscription = async (req, res, next) => {
    // destruct data from req.body
    const { duration, startDate, trainerName } = req.body
    const {_id} = req.authUser
    // find trainer
    const trainer = await Trainer.findOne({ userName: trainerName, isActive: true, isFirstTime: false })
    if (!trainer) {
        return next(new Error("Trainer not found", { cause: 404 }));
    }
    // set price & time
    let price
    if(duration == 1) price = trainer.pricePerMonth
    else if(duration == 2) price = trainer.pricePerMonth * 2
    else if(duration == 3) price = trainer.pricePerMonth * 3
    const start = new Date(startDate)
    const endDate = new Date(start)
    endDate.setMonth(endDate.getMonth() + duration)
    // create subscription
    await Sub.create({ duration, startDate, endDate, price, UserId: _id, TrainerId: trainer._id })
    // send response
    return res.status(201).json({
        msg: "Subscription added successfully",
        statusCode: 201
    })
}

export const getMySubscriptions = async (req, res, next) => {
    const {_id} = req.authUser
    const subscriptions = await Sub.find({UserId: _id}).select("duration startDate endDate price isActive isPaid")
        .populate({path: 'TrainerId', select: 'userName'})
    if (subscriptions.length == 0) {
        return next(new Error("No subscriptions found", { cause: 404 }));
    }
    // send response
    return res.status(200).json({
        msg: "Your Subscriptions data fetched successfully", 
        statusCode: 200,
        subscriptions
    });
}

export const getMySubscriptionById = async (req, res, next) => {
    const {subId} = req.params
    const {_id: UserId} = req.authUser
    const subscription = await Sub.findOne({ _id: subId, UserId }).select("duration startDate endDate price isActive isPaid")
        .populate({path: 'TrainerId', select: 'userName phoneNumber'})
    if (!subscription) {
        return next(new Error("Subscription is not found", { cause: 404 }));
    }
    // send response
    return res.status(200).json({
        msg: "Subscription data fetched successfully", 
        statusCode: 200,
        subscription
    });
}

export const updateMySubscription = async (req, res, next)=> {
    // destruct data from req.body
    const { duration, startDate } = req.body
    const {subId} = req.params
    const {_id: UserId} = req.authUser
    // get subscription
    const subscription = await Sub.findOne({ _id: subId, UserId })
    if(!subscription){
        return next(new Error("Subscription is not found", { cause: 404 }));
    }
    if(subscription.isActive || subscription.isPaid) {
        return next(new Error("You can not update your subscription now", { cause: 403 }));
    }
    // get trainer
    const trainer = await Trainer.findOne({ _id: subscription.TrainerId })
    // set price & time
    const finalDuration = duration ?? subscription.duration
    const start = new Date(startDate ?? subscription.startDate)
    const endDate = new Date(start)
    endDate.setMonth(endDate.getMonth() + finalDuration)
    let price
    if(duration == 1) price = trainer.pricePerMonth
    else if(duration == 2) price = trainer.pricePerMonth * 2
    else if(duration == 3) price = trainer.pricePerMonth * 3
    subscription.duration = finalDuration
    subscription.startDate = start
    subscription.endDate = endDate
    subscription.price = price
    await subscription.save()
    // send response
    res.status(200).json({
        msg: "Subscription updated successfully", 
        statusCode: 200,
    })
}

export const deleteMySubscription = async (req, res, next)=> {
    const {subId} = req.params
    const {_id: UserId} = req.authUser
    // get subscription
    const subscription = await Sub.findOne({ _id: subId, UserId })
    if(!subscription){
        return next(new Error("Subscription is not found", { cause: 404 }));
    }
    if(subscription.isActive || subscription.isPaid) {
        return next(new Error("You can not delete your subscription now", { cause: 403 }));
    }
    await subscription.deleteOne()
    // send response
    res.status(200).json({
        msg: "Subscription deleted successfully", 
        statusCode: 200,
    })
}

//admin

export const getAllSubsByAdmin = async (req, res, next) => {
    // destruct data from req.query
    const {page, size, sortBy} = req.query;
    const features = new APIFeatures(req.query, Sub.find().select("duration startDate endDate price isActive isPaid"))
        .pagination({ page, size })
        .sort(sortBy)
    const subscriptions = await features.mongooseQuery
    if(!subscriptions.length) {
        return next(new Error("No subscriptions found", { cause: 404 }))
    }
    // send response
    res.status(200).json({
        msg: "Subscriptions data fetched successfully", 
        statusCode: 200,
        subscriptions
    })
}

export const getSubByAdmin = async (req, res, next) => {
    const {subId} = req.params
    const sub = await Sub.findById(subId).select("duration startDate endDate price isActive isPaid")
        .populate({ path: "UserId", select: "firstName lastName phoneNumber" })
        .populate({ path: "TrainerId", select: "userName phoneNumber" })
    if (!sub) {
        return next(new Error("Subscription is not found", { cause: 404 }));
    }
    // send response
    return res.status(200).json({
        msg: "Subscription data fetched successfully",
        statusCode: 200,
        sub
    });
}

export const addSubByAdmin = async (req, res, next) => {
    // destruct data from req.body
    const { duration, startDate, phoneNumber, trainerName } = req.body
    // get user
    const user = await User.findOne({ phoneNumber })
    if(!user) {
        return next(new Error("User is not found", { cause: 404 }))
    }
    // get trainer
    const trainer = await Trainer.findOne({ userName: trainerName, isActive: true, isFirstTime: false })
    if (!trainer) {
        return next(new Error("Trainer not found", { cause: 404 }));
    }
    // set price & time
    let price
    if(duration == 1) price = trainer.pricePerMonth
    else if(duration == 2) price = trainer.pricePerMonth * 2
    else if(duration == 3) price = trainer.pricePerMonth * 3
    const start = new Date(startDate)
    const endDate = new Date(start)
    endDate.setMonth(endDate.getMonth() + duration)
    // create sub
    await Sub.create({ duration, startDate, endDate, price, UserId: user._id, TrainerId: trainer._id })
    // send response
    return res.status(201).json({
        msg: "Subscription added successfully",
        statusCode: 201
    })
}

export const updateSubByAdmin = async (req, res, next)=> {
    // destruct data from req.body
    const { duration, startDate, isActive, isPaid, trainerName } = req.body
    const {subId} = req.params
    // get sub
    const sub = await Sub.findOne({ _id: subId })
    if(!sub){
        return next(new Error("Subscription is not found", { cause: 404 }));
    }
    if(sub.isActive) {
        return next(new Error("You can not update your subscription now", { cause: 403 }));
    }
    // get trainer
    let trainerId
    if(trainerName) {
        const trainerbefore = await Trainer.findOne({ userName: trainerName, isActive: true, isFirstTime: false })
        if (!trainerbefore) {
            return next(new Error("Trainer not found", { cause: 404 }));
        }
        trainerId = trainerbefore._id
        sub.TrainerId = trainerId
    }
    trainerId = trainerId ?? sub.TrainerId
    const trainer = await Trainer.findOne({ _id: trainerId })
    // set price & time
    const finalDuration = duration ?? sub.duration
    const start = new Date(startDate ?? sub.startDate)
    const endDate = new Date(start)
    endDate.setMonth(endDate.getMonth() + finalDuration)
    let price
    if(duration == 1) price = trainer.pricePerMonth
    else if(duration == 2) price = trainer.pricePerMonth * 2
    else if(duration == 3) price = trainer.pricePerMonth * 3
    sub.duration = finalDuration
    sub.startDate = start
    sub.endDate = endDate
    sub.price = price
    if(isActive) sub.isActive = isActive
    if(isPaid) sub.isPaid = isPaid
    await sub.save()
    // send response
    res.status(200).json({
        msg: "Subscription updated successfully",
        statusCode: 200,
    })
}

export const deleteSubByAdmin = async (req, res, next)=> {
    const {subId} = req.params
    // get subscription
    const sub = await Sub.findOne({ _id: subId })
    if(!sub){
        return next(new Error("Subscription is not found", { cause: 404 }));
    }
    if(sub.isActive || sub.isPaid) {
        return next(new Error("You can not delete your subscription now", { cause: 403 }));
    }
    await sub.deleteOne()
    // send response
    res.status(200).json({
        msg: "Subscription deleted successfully",
        statusCode: 200,
    })
}

// addition features

export const getAllSubsForUser = async (req, res, next) => {
    // destruct data from body
    const { phoneNumber } = req.body;
    // get user
    const user = await User.findOne({ phoneNumber })
    if(!user) {
        return next(new Error("User is not found", { cause: 404 }))
    }
    const subs = await Sub.find({ UserId: user._id }).select("duration startDate endDate price isActive isPaid")
    if (!subs.length) {
        return next(new Error("No subscriptions found", { cause: 404 }));
    }
    res.status(200).json({
        msg: "User data fetched successfully",
        statusCode: 200,
        subs
    });
}

export const getAllSubsForTrainer = async (req, res, next) => {
    // destruct data from body
    const { phoneNumber } = req.body;
    // get trainer
    const trainer = await Trainer.findOne({ phoneNumber })
    if(!trainer) {
        return next(new Error("Trainer is not found", { cause: 404 }))
    }
    const subs = await Sub.find({ TrainerId: trainer._id }).select("duration startDate endDate price isActive isPaid")
    if (!subs.length) {
        return next(new Error("No subscriptions found", { cause: 404 }));
    }
    res.status(200).json({
        msg: "Trainer data fetched successfully",
        statusCode: 200,
        subs
    });
}