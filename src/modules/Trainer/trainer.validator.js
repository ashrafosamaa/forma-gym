import Joi from "joi";

export const addNewTrainerValidator = {
    body: Joi.object({
        userName: Joi.string().required().min(5),
        description: Joi.string().required().min(5),
        experience: Joi.number().required().min(1).max(30),
        phoneNumber: Joi.string().required().length(11).pattern(/^[0-9]+$/, "i"),
        gender: Joi.string().required().valid("male", "female"),
        pricePerMonth: Joi.number().required().min(200).max(1000),
        specialization: Joi.string().required()
        .valid("Personal", "Bodybuilding", "Functional", "Cardio",
            "Rehabilitation", "Physiotherapy", "Yoga", "Nutrition"),
    }),
};

export const getAllTrainersValidator = {
    query: Joi.object({
        page: Joi.number().optional(),
        size: Joi.number().optional(),
        sortBy: Joi.string().optional()
    })
}


export const IDValidator = {
    params: Joi.object({
        trainerId: Joi.string().length(24).hex().required()
    })
}


export const noValidator = {
    body: Joi.object({
        zaza: Joi.string().length(2).optional()
    })
}


export const searchValidator = {
    query: Joi.object({
        page: Joi.number().optional(),
        size: Joi.number().optional(),
        userName: Joi.string().optional(),
        phoneNumber: Joi.string().optional().pattern(/^[0-9]+$/, "i"),
        specialization: Joi.string().optional()
    })
}


export const updateTrainerValidator = {
    params: Joi.object({
        trainerId: Joi.string().length(24).hex().required()
    }),
    body: Joi.object({
        userName: Joi.string().optional().min(5),
        description: Joi.string().optional().min(5),
        experience: Joi.number().optional().min(1).max(30),
        phoneNumber: Joi.string().optional().length(11).pattern(/^[0-9]+$/, "i"),
        gender: Joi.string().optional().valid("male", "female"),
        pricePerMonth: Joi.number().optional().min(200).max(1000),
        specialization: Joi.string().optional()
        .valid("Personal", "Bodybuilding", "Functional ", "Cardio", 
            "Rehabilitation", "Physiotherapy", "Yoga", "Nutrition"),
        isActive: Joi.boolean().optional()
    })
}


export const updateByUserValidator = {
    body: Joi.object({
        firstName : Joi.string().optional().min(3),
        lastName : Joi.string().optional().min(3),
        phoneNumber: Joi.string().optional().length(11).pattern(/^[0-9]+$/, "i"),
        weight: Joi.string().optional().min(2).max(3),
        height: Joi.string().optional().min(2).max(3),
    })
}


export const updatePasswordValidator = { 
    body: Joi.object({
        oldPassword: Joi.string().required().min(8),
        password: Joi.string().required().min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#@$!%*?&])[A-Za-z\d#@$!%*?&]{8,}$/, "i")
        .messages({
            'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character'
        }),
        passwordConfirm: Joi.string().required().valid(Joi.ref('password')),
    })
}


export const updateProfilePictureValidator = {
    body: Joi.object({
        oldPublicId: Joi.string().required()
    })
}