import { Router } from "express";
import { authUser } from "../../middlewares/auth-user.middleware.js";
import { authAdmin } from "../../middlewares/auth-admin.middleware.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";

import * as subController from './sub.controller.js'
import * as validator from "./sub.validator.js"

import expressAsyncHandler from "express-async-handler";

const router = Router();

//user

router.get('/', authUser(), validationMiddleware(validator.noValidator),
    expressAsyncHandler(subController.getMySubscriptions))

router.get('/my/:subId', authUser(), validationMiddleware(validator.IDValidator),
    expressAsyncHandler(subController.getMySubscriptionById))

router.post('/', authUser(), validationMiddleware(validator.addSubscriptionValidatorByUser),
    expressAsyncHandler(subController.addSubscription))

router.put('/:subId', authUser(), validationMiddleware(validator.updateSubscriptionValidatorByUser),
    expressAsyncHandler(subController.updateMySubscription))

router.delete('/:subId', authUser(), validationMiddleware(validator.IDValidator),
    expressAsyncHandler(subController.deleteMySubscription))

//admin

router.get('/get/:subId', authAdmin(), validationMiddleware(validator.IDValidator),
    expressAsyncHandler(subController.getSubByAdmin))

router.get('/all', authAdmin(), validationMiddleware(validator.getAllSubscriptionsValidator),
    expressAsyncHandler(subController.getAllSubsByAdmin))

router.post('/add', authAdmin(), validationMiddleware(validator.addSubscriptionValidatorByAdmin),
    expressAsyncHandler(subController.addSubByAdmin))

router.put('/update/:subId', authAdmin(), validationMiddleware(validator.updateSubscriptionValidatorByAdmin),
    expressAsyncHandler(subController.updateSubByAdmin))

router.delete('/delete/:subId', authAdmin(), validationMiddleware(validator.IDValidator),
    expressAsyncHandler(subController.deleteSubByAdmin))

// addition features

router.get('/for-user', authAdmin(), validationMiddleware(validator.getAllUserSubscriptionsValidatorByAdmin),
    expressAsyncHandler(subController.getAllSubsForUser))

router.get('/for-trainer', authAdmin(), validationMiddleware(validator.getAllUserSubscriptionsValidatorByAdmin),
    expressAsyncHandler(subController.getAllSubsForTrainer))

router.put('/comment-rate/:subId', authUser(), validationMiddleware(validator.addCommentAndRateValidatorByUser),
    expressAsyncHandler(subController.addCommentAndRate))

router.delete('/comment/:subId', authUser(), validationMiddleware(validator.IDValidator),
    expressAsyncHandler(subController.deleteComment))


export default router;