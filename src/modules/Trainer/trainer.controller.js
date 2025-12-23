import { APIFeatures } from "../../utils/api-features.js";


import Trainer from "../../../DB/models/trainer.model.js";
import cloudinaryConnection from "../../utils/cloudinary.js";


//admin

export const addNewTrainer = async (req, res, next) => {
    // destruct data from req.body
    const { userName, description, experience, phoneNumber, gender, pricePerMonth, specialization } = req.body
    // check if userName already exists
    const isUserNameExist = await Trainer.findOne({ userName });
    if (isUserNameExist) {
        return next(new Error("Trainer already exists", { cause: 400 }));
    }
    // check if phoneNumber already exists
    const isPhoneExist = await Trainer.findOne({ phoneNumber });
    if (isPhoneExist) {
        return next(new Error("Phone number is already exists, Please try another phone number", { cause: 400 }));
    }
    // password hashing
    const oneUsepassword = userName + "@123";
    // create trainer
    await Trainer.create({ userName, description, experience, phoneNumber, gender, pricePerMonth, specialization, password: oneUsepassword });
    // send response
    res.status(201).json({
        msg: "Trainer account added successfully",
        statusCode: 201,
    })
}

export const getAlltrainers = async (req, res, next) => {
    // destruct data from req.query
    const {page, size, sortBy} = req.query;
    const features = new APIFeatures(req.query, Trainer.find()
        .select("userName phoneNumber gender specialization pricePerMonth experience isActive"))
        .pagination({ page, size })
        .sort(sortBy)
    const trainers = await features.mongooseQuery
    if(!trainers.length) {
        return next(new Error("No trainers found", { cause: 404 }))
    }
    // send response
    res.status(200).json({
        msg: "Trainers data fetched successfully", 
        statusCode: 200,
        trainers
    })
}

export const getTrainer = async(req, res, next)=> {
    // destruct data from admin
    const {trainerId} = req.params
    // get trainer data
    const getTrainer = await Trainer.findById(trainerId)
        .select("-__v -password -role -folderId -profileImg.public_id -createdAt -updatedAt")
    if (!getTrainer) {
        return next(new Error("Trainer not found", { cause: 404 }))
    }
    // send response
    res.status(200).json({
        msg: "Trainer data fetched successfully",
        statusCode: 200,
        getTrainer
    })
}

export const search = async (req, res, next) => {
    // destruct data from Admin
    const { page, size, ...serach } = req.query;
    // get Trainer data
    const features = new APIFeatures(req.query, Trainer.find()
        .select("userName phoneNumber gender specialization pricePerMonth experience isActive"))
        .pagination({ page, size })
        .searchTrainers(serach)
        .sort()
    const trainers = await features.mongooseQuery
    if (!trainers.length) {
        return next(new Error("No trainers found matching with your search query", { cause: 404 }))
    }
    res.status(200).json({
        msg: "Trainers data fetched successfully",
        statusCode: 200,
        trainers
    });
}

export const updateTrainer = async(req, res, next)=> {
    // destruct data from trainer
    const {trainerId} = req.params
    const { userName, description, experience, phoneNumber, gender, pricePerMonth, specialization, isActive } = req.body
    // find trainer
    const trainer = await Trainer.findById(trainerId)
        .select("-__v -password -role -folderId -profileImg.public_id -createdAt -updatedAt")
    // check trainer
    if(!trainer){
        return next (new Error("Trainer not found", { cause: 404 }))
    }
    // new phone check
    if(phoneNumber){
        const isPhoneExist = await Trainer.findOne({phoneNumber, _id: {$ne: trainerId} })
        if(isPhoneExist){
            return next (new Error("Phone number is already exists, Please try another phone number", { cause: 409 }))
        }
        trainer.phoneNumber = phoneNumber
    }
    // new userName check
    if(userName){
        const isUserNameExist = await Trainer.findOne({userName, _id: {$ne: trainerId} })
        if(isUserNameExist){
            return next (new Error("UserName is already exists, Please try another one", { cause: 409 }))
        }
        trainer.userName = userName
    }
    // update trainer data
    if(description || experience || gender || pricePerMonth || specialization || isActive){
        trainer.description = description ?? trainer.description
        trainer.experience = experience ?? trainer.experience
        trainer.gender = gender ?? trainer.gender
        trainer.pricePerMonth = pricePerMonth ?? trainer.pricePerMonth
        trainer.specialization = specialization ?? trainer.specialization
        trainer.isActive = isActive ?? trainer.isActive
    }
    await trainer.save()
    // send response
    res.status(200).json({
        msg: "Trainer Account updated successfully",
        statusCode: 200,
        trainer
    })
}

export const deleteTrainerAcc = async(req, res, next)=> {
    // destruct data from trainer
    const {trainerId} = req.params
    // delete trainer data
    const deleteTrainer = await Trainer.findById(trainerId)
    if (!deleteTrainer) {
        return next (new Error("Trainer not found", { cause: 404 }))
    }
    // delete photo
    if(deleteTrainer.profileImg.public_id){
        const folder = `${process.env.MAIN_FOLDER}/Trainers/${deleteTrainer.folderId}`
        await cloudinaryConnection().api.delete_resources_by_prefix(folder)
        await cloudinaryConnection().api.delete_folder(folder)
    }
    //delete trainer
    await deleteTrainer.deleteOne()
    // send response
    res.status(200).json({
        msg: "Trainer Account deleted successfully",
        statusCode: 200
    })
}

//additional features for trainer

