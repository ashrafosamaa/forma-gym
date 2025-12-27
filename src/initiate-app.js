import db_connection from "../DB/connection.js"

import { globalResponse } from "./middlewares/global-response.middleware.js"
import { cronToChangeMembershipsToActive, cronToChangeMembershipsNotActive,
        cronToChangeSubsToActive, 
        cronToChangeSubsNotActive} from "./utils/crons.js"

import cors from 'cors'

import * as routers from "./modules/index.routes.js"

export const initiateApp = (app, express)=> {
    const port = process.env.PORT

    app.use(cors())

    app.use((req, res, next) => {
        // skip webhook now (Up coming feature)
        if (req.originalUrl == "/sub/webhook") {
            next()
        }
        else {
            express.json()(req, res, next)
        }
    })

    db_connection()

    app.use('/admin', routers.adminRouter)
    app.use('/userAuth', routers.userAuthRouter)
    app.use('/user', routers.userRouter)
    app.use('/membership', routers.membershipRouter)
    app.use('/trainer', routers.trainerRouter)
    app.use('/sub', routers.subRouter)


    app.get('/', (req, res, next)=> {
        res.send("<h1> Welcome In Forma Gym </h1>");
    })

    app.all('*', (req, res, next)=> {
        return next(new Error('Page not found', { cause: 404 }))
    })

    app.use(globalResponse)
    cronToChangeMembershipsToActive()
    cronToChangeMembershipsNotActive()
    cronToChangeSubsToActive()
    cronToChangeSubsNotActive()

    app.listen(port, ()=> console.log(`server is running on host`))
}