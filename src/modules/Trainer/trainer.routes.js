import { Router } from "express";
import { authAdmin } from "../../middlewares/auth-admin.middleware.js";
import { authTrainer } from "../../middlewares/auth-trainer.middleware.js";
import { allowedExtensions } from "../../utils/allowed-extensions.js";
import { multerMiddleHost } from "../../middlewares/multer.middleware.js"
import { validationMiddleware } from "../../middlewares/validation.middleware.js";

import * as trainerController from './trainer.controller.js'
import * as validator from "./trainer.validator.js"

import expressAsyncHandler from "express-async-handler";

const router = Router();

//admin

router.post('/add/', authAdmin(), validationMiddleware(validator.addNewTrainerValidator),
    expressAsyncHandler(trainerController.addNewTrainer))

router.get('/all/', authAdmin(), validationMiddleware(validator.getAllTrainersValidator),
    expressAsyncHandler(trainerController.getAlltrainers))

router.get('/account/:trainerId', authAdmin(), validationMiddleware(validator.IDValidator),
    expressAsyncHandler(trainerController.getTrainer))

router.get('/search', authAdmin(), validationMiddleware(validator.searchValidator),
    expressAsyncHandler(trainerController.search))

router.put('/update/:trainerId', authAdmin(), validationMiddleware(validator.updateByAdminValidator),
    expressAsyncHandler(trainerController.updateTrainer))

router.delete('/delete/:trainerId', authAdmin(), validationMiddleware(validator.IDValidator),
    expressAsyncHandler(trainerController.deleteTrainer))

//additional features for trainer

router.post('/first-time/', validationMiddleware(validator.firstLoginValidator),
    expressAsyncHandler(trainerController.firstLogin))

router.post('/signin/', validationMiddleware(validator.signinValidator),
    expressAsyncHandler(trainerController.signIn))

//trainer

router.get('/', authTrainer(), validationMiddleware(validator.noValidator),
    expressAsyncHandler(trainerController.getAccountData))

router.put('/', authTrainer(), validationMiddleware(validator.updateByTrainerValidator),
    expressAsyncHandler(trainerController.updateProfileData))

router.patch('/', authTrainer(), validationMiddleware(validator.updatePasswordValidator),
    expressAsyncHandler(trainerController.updatePassword))

router.delete('/', authTrainer(), validationMiddleware(validator.noValidator),
    expressAsyncHandler(trainerController.deleteAccount))

//additional features for pic profile

router.post('/addprofilepicture', authTrainer(),
    multerMiddleHost({extensions: allowedExtensions.image
        }).single('profileImg'), validationMiddleware(validator.noValidator),
expressAsyncHandler(trainerController.addProfilePicture))

router.put('/update-picture', authTrainer(),
    multerMiddleHost({extensions: allowedExtensions.image
        }).single('profileImg'), validationMiddleware(validator.updateProfilePictureValidator),
expressAsyncHandler(trainerController.updateProfilePicture))


export default router;