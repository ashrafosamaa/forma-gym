import { Router } from "express";
import { authAdmin } from "../../middlewares/auth-admin.middleware.js";
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

router.put('/update/:trainerId', authAdmin(), validationMiddleware(validator.updateTrainerValidator),
    expressAsyncHandler(trainerController.updateTrainer))

router.delete('/delete/:trainerId', authAdmin(), validationMiddleware(validator.IDValidator),
    expressAsyncHandler(trainerController.deleteTrainerAcc))

//additional features for trainer

export default router;