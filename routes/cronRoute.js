var cron = {}
var PN = require('../helpers/pushNotification');

cron.checkExitStatus = async () => {
  let date = new Date()
  let guests = await Guest.find({stayingTill: {$lt: date}, exited: false, status: {$ne: 'denied'}}).populate({
    path: 'house',
    populate: 'owner'
  })
  for(guest of guests){
    notifyUser = guest.house ? guest.house.owner : null
    if(notifyUser){
        notifyText = `Hi ${notifyUser.fullName}, Please update the staying status for your guest ${guest.name}`
        notification = {
          title: "CSA Notification",
          body: notifyText
        }
        tokens = []
        notifyUser.badgeCount = notifyUser.badgeCount + 1
    
        notifyUser.deviceTokens.forEach(tokenObj => {
          tokens.push(tokenObj.deviceToken)
        });

        notificationData = {
          key: 'updateGuestStatus',
          guest: guest
        }

        if(tokens.length > 0){
          PN.send(notification,notificationData,tokens, false, notifyUser.badgeCount)
        }
        await notifyUser.save()
    }
  }
}

cron.checkExpectedStatus = async () => {
  let date = new Date()
  let guests = await Guest.find({status: 'expected',arrivingOn: {$lt: date}})
  for(guest of guests){
    guest.status = "unArrived"
    await guest.save()
  }
} 

cron.checkRecurringExpectedStatus = async () => {
  let date = new Date()
  let guests = await Guest.find({status: 'recurring'}).populate('house')
  for(guest of guests){
    hours = Math.abs(date - guest.latEntryTime) / 36e5
    if(!hours || hours > 24){
     
      newGuest = JSON.parse(JSON.stringify(guest))
      delete newGuest._id
      newGuest.arrivingOn = new Date()
      newGuest.status =  "unArrived"
      newGuestObj = await Guest.create(newGuest)
      if(newGuestObj){
        guest.house.guests.push(newGuestObj._id)
        await guest.house.save()
      }
    }
    //guest.status = "unArrived"
    //await guest.save()
  }
} 

module.exports = cron