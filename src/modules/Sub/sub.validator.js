import Joi from "joi";

export const getAllSubscriptionsValidator = {
    query: Joi.object({
        page: Joi.number().optional(),
        size: Joi.number().optional(),
        sortBy: Joi.string().optional()
    })
}


export const IDValidator = {
    params: Joi.object({
        subId: Joi.string().length(24).hex().required()
    })
}


export const noValidator = {
    body: Joi.object({
        zaza: Joi.string().length(2).optional()
    })
}


export const addSubscriptionValidatorByUser = {
    body: Joi.object({
        duration: Joi.number().valid(1, 2, 3).required(),
        startDate: Joi.date().iso().min("now").required().messages({
            "string.pattern.base": "startDate must be in YYYY-MM-DD format",
            'date.min': 'startDate cannot be before today'}),
        trainerName: Joi.string().required().min(5),
    }).options({ abortEarly: false })
}


export const addSubscriptionValidatorByAdmin = {
    body: Joi.object({
        duration: Joi.number().valid(1, 2, 3).required(),
        startDate: Joi.date().iso().min("now").required().messages({
            "string.pattern.base": "startDate must be in YYYY-MM-DD format",
            'date.min': 'startDate cannot be before today'}),
        phoneNumber: Joi.string().required().length(11).pattern(/^[0-9]+$/, "i"),
        trainerName: Joi.string().required().min(5),
    }).options({ abortEarly: false })
}


export const updateSubscriptionValidatorByUser = {
    body: Joi.object({
        duration: Joi.number().valid(1, 2, 3).optional(),
        startDate: Joi.date().iso().min("now").optional().messages({
            "date.formate": "startDate must be in YYYY-MM-DD format",
            'date.min': 'startDate cannot be before today'})
    }).options({ abortEarly: false }),
    params: Joi.object({
        subId: Joi.string().length(24).hex().required()
    })
}


export const updateSubscriptionValidatorByAdmin = {
    body: Joi.object({
        duration: Joi.number().valid(1, 2, 3).optional(),
        startDate: Joi.date().iso().min("now").optional().messages({
            "date.formate": "startDate must be in YYYY-MM-DD format",
            'date.min': 'startDate cannot be before today'
        }),
        isActive: Joi.boolean().optional(),
        isPaid: Joi.boolean().optional(),
        trainerName: Joi.string().optional().min(5)
    }).options({ abortEarly: false }),
    params: Joi.object({
        subId: Joi.string().length(24).hex().required()
    })
}


export const getAllUserSubscriptionsValidatorByAdmin = {
    body: Joi.object({
        phoneNumber: Joi.string().required().length(11).pattern(/^[0-9]+$/, "i")
    })
}


export const addCommentAndRateValidatorByUser = {
    body: Joi.object({
        comment: Joi.string().required().min(5),
        rating: Joi.number().required().min(1).max(5)
    }).options({ abortEarly: false }),
    params: Joi.object({
        subId: Joi.string().length(24).hex().required()
    })
}