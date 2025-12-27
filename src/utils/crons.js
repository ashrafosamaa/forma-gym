import { scheduleJob } from "node-schedule"
import {DateTime} from 'luxon'

import Membership from "../../DB/models/membership.model.js"
import Sub from "../../DB/models/sub.model.js"


export function cronToChangeMembershipsToActive(){
    scheduleJob('0 0 0 * * *', async ()=> {
        const memberships = await Membership.find({isActive: false, isPaid: true})
        if(!memberships.length) return console.log('No memberships needed to be active today')
        for (const membership of memberships) {
            //start
            const beginAtStr = JSON.stringify(membership.startDate);
            const splitBeginAtstr = beginAtStr.split('.')[0]
            const cleanSplitBeginAtstr = splitBeginAtstr.replace(/"/gi, '');
            const membershipBeginAt = DateTime.fromISO(cleanSplitBeginAtstr)
            //end
            const endAtStr = JSON.stringify(membership.endDate);
            const splitEndAtstr = endAtStr.split('.')[0]
            const cleanSplitEndAtstr = splitEndAtstr.replace(/"/gi, '');
            const membershipEndAt = DateTime.fromISO(cleanSplitEndAtstr)
            if(membershipBeginAt <= DateTime.now() && membershipEndAt >= DateTime.now()){
                console.log(`membership: ${membership._id} is active now`);
                membership.isActive = true
            }
            await membership.save()
        }
    })
}

export function cronToChangeMembershipsNotActive(){
    scheduleJob('0 0 0 * * *', async ()=> {
        const memberships = await Membership.find({isActive: true, isPaid: true})
        if(!memberships.length) return console.log('No memberships needed to be non-active today')
        for (const membership of memberships) {
            const beginAtStr = JSON.stringify(membership.endDate);
            const splitBeginAtstr = beginAtStr.split('.')[0]
            const cleanSplitBeginAtstr = splitBeginAtstr.replace(/"/gi, '');
            const membershipBeginAt = DateTime.fromISO(cleanSplitBeginAtstr)
            if(membershipBeginAt <= DateTime.now()){
                console.log(`membership: ${membership._id} is not active now`);
                membership.isActive = false
            }
            await membership.save()
        }
    })
}

export function cronToChangeSubsToActive(){
    scheduleJob('* * * * * *', async ()=> {
        const subs = await Sub.find({isActive: false, isPaid: true})
        if(!subs.length) return console.log('No subs needed to be active today')
        for (const sub of subs) {
            //start
            const beginAtStr = JSON.stringify(sub.startDate);
            const splitBeginAtstr = beginAtStr.split('.')[0]
            const cleanSplitBeginAtstr = splitBeginAtstr.replace(/"/gi, '');
            const subBeginAt = DateTime.fromISO(cleanSplitBeginAtstr)
            //end
            const endAtStr = JSON.stringify(sub.endDate);
            const splitEndAtstr = endAtStr.split('.')[0]
            const cleanSplitEndAtstr = splitEndAtstr.replace(/"/gi, '');
            const subEndAt = DateTime.fromISO(cleanSplitEndAtstr)
            if(subBeginAt <= DateTime.now() && subEndAt >= DateTime.now()){
                console.log(`sub: ${sub._id} is active now`);
                sub.isActive = true
            }
            await sub.save()
        }
    })
}

export function cronToChangeSubsNotActive(){
    scheduleJob('* * * * * *', async ()=> {
        const subs = await Sub.find({isActive: true, isPaid: true})
        if(!subs.length) return console.log('No subs needed to be non-active today')
        for (const sub of subs) {
            const endAtStr = JSON.stringify(sub.endDate);
            const splitEndAtstr = endAtStr.split('.')[0]
            const cleanSplitEndAtstr = splitEndAtstr.replace(/"/gi, '');
            const subEndAt = DateTime.fromISO(cleanSplitEndAtstr)
            if(subEndAt <= DateTime.now()){
                console.log(`sub: ${sub._id} is not active now`);
                sub.isActive = false
            }
            await sub.save()
        }
    })
}