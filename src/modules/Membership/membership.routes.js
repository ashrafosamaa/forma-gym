import { Router } from "express";
import { authUser } from "../../middlewares/auth-user.middleware.js";
import { authAdmin } from "../../middlewares/auth-admin.middleware.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";

import * as membershipController from './membership.controller.js'
import * as validator from "./membership.validator.js"

import expressAsyncHandler from "express-async-handler";

const router = Router();

//user

router.get('/', authUser(), validationMiddleware(validator.noValidator),
    expressAsyncHandler(membershipController.getMyMemberships))

router.get('/my/:membershipId', authUser(), validationMiddleware(validator.IDValidator),
    expressAsyncHandler(membershipController.getMyMembershipById))

router.post('/', authUser(), validationMiddleware(validator.addMembershipValidatorByUser),
    expressAsyncHandler(membershipController.addMembership))

router.put('/:membershipId', authUser(), validationMiddleware(validator.updateMembershipValidatorByUser),
    expressAsyncHandler(membershipController.updateMyMembership))

router.delete('/:membershipId', authUser(), validationMiddleware(validator.IDValidator),
    expressAsyncHandler(membershipController.deleteMyMembership))

//admin

router.get('/get/:membershipId', authAdmin(), validationMiddleware(validator.IDValidator),
    expressAsyncHandler(membershipController.getMembershipByAdmin))

router.get('/all', authAdmin(), validationMiddleware(validator.getAllMembershipsValidator),
    expressAsyncHandler(membershipController.getAllMembershipsByAdmin))

router.post('/add', authAdmin(), validationMiddleware(validator.addMembershipValidatorByAdmin),
    expressAsyncHandler(membershipController.addMembershipByAdmin))

router.put('/update/:membershipId', authAdmin(), validationMiddleware(validator.updateMembershipValidatorByAdmin),
    expressAsyncHandler(membershipController.updateMembershipByAdmin))

router.delete('/delete/:membershipId', authAdmin(), validationMiddleware(validator.IDValidator),
    expressAsyncHandler(membershipController.deleteMembershipByAdmin))

// addition feature

router.get('/for-user', authAdmin(), validationMiddleware(validator.getAllUserMembershipsValidatorByAdmin),
    expressAsyncHandler(membershipController.getAllMemberShipsForUser))


export default router;