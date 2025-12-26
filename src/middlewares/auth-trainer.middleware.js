import jwt from 'jsonwebtoken'
import Trainer from '../../DB/models/trainer.model.js'

export const authTrainer = (accessRoles = "trainer") => {
    return async (req, res, next) => {
        try {
            const { accesstoken } = req.headers
            if (!accesstoken) return next(new Error('Please login first', { cause: 400 }))

            const decodedData = jwt.verify(accesstoken, process.env.JWT_SECRET_LOGIN)
            
            if (!decodedData || !decodedData.id) return next(new Error('Invalid token payload', { cause: 400 }))
            
            // trainer check
            const findTrainer = await Trainer.findById(decodedData.id, 'userName email role')
            if (!findTrainer) return next(new Error('Please signUp first', { cause: 404 }))
            // auhtorization
            if (!accessRoles.includes(findTrainer.role)) return next(new Error('Unauthorized', { cause: 401 }))
            req.authTrainer = findTrainer
            next()
        } catch (error) {
            console.log(error);
            next(new Error('catch error in auth middleware', { cause: 500 }))
        }
    }
}