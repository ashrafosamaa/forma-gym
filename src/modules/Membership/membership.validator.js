import Joi from "joi";

export const getAllMembershipsValidator = {
    query: Joi.object({
        page: Joi.number().optional(),
        size: Joi.number().optional(),
        sortBy: Joi.string().optional()
    })
}


export const IDValidator = {
    params: Joi.object({
        membershipId: Joi.string().length(24).hex().required()
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
        firstName: Joi.string().optional(),
        lastName: Joi.string().optional(),
        email: Joi.string().optional(),
        phoneNumber: Joi.string().optional().pattern(/^[0-9]+$/, "i"),
    })
}


export const addMembershipValidatorByUser = {
    body: Joi.object({
        duration: Joi.number().valid(1, 3, 6, 12).required(),
        startDate: Joi.date().iso().min("now").required().messages({
            "string.pattern.base": "startDate must be in YYYY-MM-DD format",
            'date.min': 'startDate cannot be before today'
        })
    }).options({ abortEarly: false })
}


export const addMembershipValidatorByAdmin = {
    body: Joi.object({
        duration: Joi.number().valid(1, 3, 6, 12).required(),
        startDate: Joi.date().iso().min("now").required().messages({
            "string.pattern.base": "startDate must be in YYYY-MM-DD format",
            'date.min': 'startDate cannot be before today'
        }),
        phoneNumber: Joi.string().required().length(11).pattern(/^[0-9]+$/, "i")
    }).options({ abortEarly: false })
}


export const updateMembershipValidatorByUser = {
    body: Joi.object({
        duration: Joi.number().valid(1, 3, 6, 12).optional(),
        startDate: Joi.date().iso().min("now").optional().messages({
            "date.formate": "startDate must be in YYYY-MM-DD format",
            'date.min': 'startDate cannot be before today'
        })
    }).options({ abortEarly: false }),
    params: Joi.object({
        membershipId: Joi.string().length(24).hex().required()
    })
}


export const updateMembershipValidatorByAdmin = {
    body: Joi.object({
        duration: Joi.number().valid(1, 3, 6, 12).optional(),
        startDate: Joi.date().iso().min("now").optional().messages({
            "date.formate": "startDate must be in YYYY-MM-DD format",
            'date.min': 'startDate cannot be before today'
        }),
        isActive: Joi.boolean().optional(),
        isPaid: Joi.boolean().optional(),
    }).options({ abortEarly: false }),
    params: Joi.object({
        membershipId: Joi.string().length(24).hex().required()
    })
}

export const getAllUserMembershipsValidatorByAdmin = {
    body: Joi.object({
        phoneNumber: Joi.string().required().length(11).pattern(/^[0-9]+$/, "i")
    })
}