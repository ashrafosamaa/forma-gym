import { APIFeatures } from "../../utils/api-features.js";
import { generateUniqueString } from "../../utils/generate-unique-string.js"

import Trainer from "../../../DB/models/trainer.model.js";
import cloudinaryConnection from "../../utils/cloudinary.js";

import bcrypt from "bcryptjs"
import crypto from 'crypto'
import jwt from "jsonwebtoken"

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
    // setting password
    const hashedPassword = crypto
        .createHash("sha256")
        .update(phoneNumber)
        .digest("hex");
    // create trainer
    await Trainer.create({ userName, description, experience, phoneNumber, gender,
        pricePerMonth, specialization, passwordOneUse: hashedPassword });
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
        .select("userName phoneNumber gender specialization pricePerMonth experience isActive passwordOneUse"))
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
        .select("-__v -password -role -folderId -profileImg.public_id -createdAt -updatedAt -passwordOneUse")
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
        .select("-__v -password -role -folderId -profileImg.public_id -createdAt -updatedAt -passwordOneUse")
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
        if(trainer.isFirstTime){
            trainer.passwordOneUse = bcrypt.hashSync(phoneNumber, +process.env.SALT_ROUNDS)
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

export const deleteTrainer = async(req, res, next)=> {
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

export const firstLogin = async (req, res, next) => {
    // destruct data from trainer
    const {userName, passwordOneUse, password} = req.body
    // update trainer data
    const trainer = await Trainer.findOne({userName})
    if(!trainer){
        return next (new Error("Trainer not found", { cause: 404 }))
    }
    if(!trainer.isFirstTime) {
        return next (new Error("You already changed first time password", { cause: 409 }))
    }
    // compare password
    const hashedpasswordOneUse = crypto
        .createHash("sha256")
        .update(passwordOneUse)
        .digest("hex");
    if (hashedpasswordOneUse != trainer.passwordOneUse) {
        return next (new Error("Invalid login credentials", { cause: 404 }))
    }
    // set new data
    const hashedPassword = bcrypt.hashSync(password, +process.env.SALT_ROUNDS)
    trainer.password = hashedPassword
    trainer.isFirstTime = false
    trainer.passwordOneUse = null
    await trainer.save()
    // send response
    res.status(200).json({
        msg: "Trainer Password updated successfully, Now you can login",
        statusCode: 200,
    })
}

export const signIn = async (req, res, next) => {
    // destruct data from trainer
    const {userName, password} = req.body
    // check if trainer exists
    const trainer = await Trainer.findOne({userName})
    if(!trainer){
        return next (new Error("Invalid login credentials", { cause: 404 }))
    }
    if(trainer.isFirstTime) {
        return next (new Error("You need to change first time password", { cause: 409 }))
    }
    // compare password
    const isPasswordMatch = bcrypt.compareSync(password, trainer.password);
    if (!isPasswordMatch) {
        return next (new Error("Invalid login credentials", { cause: 404 }))
    }
    // generate token
    const trainerToken = jwt.sign({ id: trainer._id, userName, role: trainer.role},
        process.env.JWT_SECRET_LOGIN,
        {
            expiresIn: "90d"
        }
    )
    // send response
    res.status(200).json({
        msg: "Trainer logged in successfully",
        statusCode: 200,
        trainerToken,
    })
}

//trainer

export const getAccountData = async (req, res, next)=> {
    // destruct data from trainer
    const {_id} = req.authTrainer
    // get trainer data
    const getTrainer = await Trainer.findById(_id)
        .select("-__v -password -role -folderId -createdAt -updatedAt -passwordOneUse -isFirstTime")
    // send response
    res.status(200).json({
        msg: "Trainer data fetched successfully",
        statusCode: 200,
        getTrainer
    })
}

export const updateProfileData = async (req, res, next)=> {
    // destruct data from trainer
    const {_id} = req.authTrainer
    const{ userName, description, experience, phoneNumber, gender, pricePerMonth, specialization, isActive } = req.body
    // find trainer
    const trainer = await Trainer.findById(_id)
        .select("-__v -password -role -folderId -createdAt -updatedAt -passwordOneUse -isFirstTime")
    // new phone check
    if(phoneNumber){
        const isPhoneExist = await Trainer.findOne({phoneNumber, _id: {$ne: _id} })
        if(isPhoneExist){
            return next (new Error("Phone number is already exists, Please try another phone number", { cause: 409 }))
        }
    }
    // update trainer data
    if(userName || description || experience || phoneNumber || gender || pricePerMonth || specialization || isActive){
        trainer.userName = userName || trainer.userName
        trainer.description = description || trainer.description
        trainer.experience = experience || trainer.experience
        trainer.phoneNumber = phoneNumber || trainer.phoneNumber
        trainer.gender = gender || trainer.gender
        trainer.pricePerMonth = pricePerMonth || trainer.pricePerMonth
        trainer.specialization = specialization || trainer.specialization
        trainer.isActive = isActive || trainer.isActive
    }
    await trainer.save()
    // send response
    res.status(200).json({
        msg: "Trainer data updated successfully",
        statusCode: 200,
        trainer
    })
}

export const updatePassword = async (req, res, next)=> {
    // destruct data from trainer
    const {_id} = req.authTrainer
    const {password, oldPassword} = req.body
    // find trainer
    const trainer = await Trainer.findById(_id)
    // check old password
    const isPasswordMatch = await bcrypt.compare(oldPassword, trainer.password)
    if(!isPasswordMatch){
        return next (new Error("Invalid old password", { cause: 400 }))
    }
    // hash password
    const hashedPassword = bcrypt.hashSync(password, +process.env.SALT_ROUNDS)
    // update trainer data
    trainer.password = hashedPassword
    trainer.passwordChangedAt = Date.now()
    await trainer.save()
    // generate token
    const trainerToken = jwt.sign({ id: trainer._id, userName: trainer.userName, role: trainer.role},
        process.env.JWT_SECRET_LOGIN,
        {
            expiresIn: "90d"
        }
    )
    // send response
    res.status(200).json({
        msg: "Trainer password updated successfully",
        statusCode: 200,
        trainerToken
    })
}

export const deleteAccount = async (req, res, next)=> {
    // destruct data from trainer
    const {_id} = req.authTrainer
    // delete trainer data
    const deleteTrainer = await Trainer.findById(_id)
    // delete photo
    if(deleteTrainer.profileImg.public_id){
        const folder = `${process.env.MAIN_FOLDER}/Trainers/${deleteTrainer.folderId}`
        await cloudinaryConnection().api.delete_resources_by_prefix(folder)
        await cloudinaryConnection().api.delete_folder(folder)
    }
    // delete trainer data
    await deleteTrainer.deleteOne()
    // send response
    res.status(200).json({
        msg: "Trainer deleted successfully",
        statusCode: 200
    })
}

//additional features for pic profile

export const addProfilePicture = async (req, res, next)=> {
    // destruct data from trainer
    const {_id} = req.authTrainer
    // update trainer data
    const trainer = await Trainer.findById(_id)
    if (!trainer) {
        return next (new Error("Trainer not found", { cause: 404 }))
    }
    // upload image
    let profileImg
    const folderId = generateUniqueString(4)
    if(!req.file){
        return next (new Error("Image is required", { cause: 400 }))
    }
    const {secure_url, public_id} = await cloudinaryConnection().uploader.upload(req.file.path, {
        folder: `${process.env.MAIN_FOLDER}/Trainers/${folderId}`
    })
    profileImg = {
        secure_url,
        public_id
    }
    // update trainer data
    trainer.profileImg = profileImg
    trainer.folderId = folderId
    await trainer.save()
    // send response
    res.status(200).json({
        msg: "Trainer profile picture added successfully",
        statusCode: 200,
    })
}

export const updateProfilePicture = async (req, res, next)=> {
    // destruct data from trainer
    const {_id} = req.authTrainer
    const {oldPublicId} = req.body
    // check file is uploaded
    if(!req.file){
        return next (new Error("Image is required", { cause: 400 }))
    }
    // update trainer data
    const trainer = await Trainer.findById(_id)
    if(trainer.profileImg.public_id != oldPublicId){
        return next (new Error("You cannot update this profile's picture", { cause: 400 }))
    }
    const newPublicId = oldPublicId.split(`${trainer.folderId}/`)[1]
    const {secure_url, public_id} = await cloudinaryConnection().uploader.upload(req.file.path, {
        folder: `${process.env.MAIN_FOLDER}/Trainers/${trainer.folderId}`,
        public_id: newPublicId
    })
    trainer.profileImg.secure_url = secure_url
    trainer.profileImg.public_id = public_id
    // update trainer data
    await trainer.save()
    // send response
    res.status(200).json({
        msg: "Trainer profile picture updated successfully",
        statusCode: 200,
    })
}