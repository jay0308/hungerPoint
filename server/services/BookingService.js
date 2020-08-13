const ServiceResponse = require("../BaseClasses/ServiceResponse").serviceResponse;
const appConstants = require("../utils/constants").appConstants;
const dbVars = require("../loaders/dbInitializer").dbVars;
const utility = require("../utils/utility");
const { ObjectId } = require('mongodb');
const redisClient = require("../loaders/redisInitializer");
const lodash = require("lodash")
const paymentService = require("./PaymentService");
const SmsService = require("./SMSService");
const _Date = utility.momentDate();



const checkTimestampsValidity = (older, newer, element) => {
    let difference = Math.abs(newer - older);
    // console.log(older,newer,difference)
    if (difference >= 10 * 60 * 1000) {
        if (element)
            deleteBookingEntry(element._id);
        return false
    }
    return true
}



const checkSeatAvailableForBooking = async (params) => {
    const mongoDb = dbVars.db;
    let seats = params.seatNo;
    delete params.seatNo
    let bookingResult = await mongoDb.collection("booking").find(params).toArray();
    for (let i = 0; i < bookingResult.length; i++) {
        const element = bookingResult[i];
        for (let j = 0; j < seats.length; j++) {
            const ele = seats[j];
            if (element.isPaid === 0 && element.isCancelled === 0 && element.seatNo.indexOf(ele) > -1 && checkTimestampsValidity(new _Date().getTime(), new _Date(element.updateDate).getTime())) {
                return false;
            }

        }

    }
    // if (bookingResult && bookingResult.length > 0) {
    //     for (let index = 0; index < bookingResult.length; index++) {
    //         const element = bookingResult[index];
    //         if (!checkTimestampsValidity(new _Date().getTime(), new _Date(element.updateDate).getTime(), element)) {
    //             return false
    //         }
    //     }
    // }
    return true;
}

const getAllRoutes = async () => {
    try {
        const mongoDb = dbVars.db;
        let result = await mongoDb.collection("busRoutes").find({}).toArray();
        return result
    } catch (err) {
        console.log("Err", err);
        return false;
    }
}

const deleteBookingEntry = async (bookingId) => {
    try {
        let routeId = ObjectId(bookingId);
        const mongoDb = dbVars.db;
        let result = await mongoDb.collection("booking").deleteOne({ _id: routeId });
    } catch (err) {
        console.log("Err", err);
    }
}

const filterBookingDataOnPaidCancel = (bookings) => {
    let filtered = [];
    for (let i = 0; i < bookings.length; i++) {
        const element = bookings[i];

        if (element.isPaid === 1 && element.isCancelled === 0) {
            filtered.push(element)
        }
        if (element.isPaid === 1 && element.isCancelled === 1) {
            continue;
        }
        if (element.isPaid === 0 && element.isCancelled === 1) {
            continue;
        }
        if (element.isPaid === 0 && element.isCancelled === 0) {
            if (checkTimestampsValidity(new _Date().getTime(), new _Date(element.updateDate).getTime()))
                filtered.push(element)
        }
    }
    return filtered;
}

const filterBookingDataByDate = (bookings,journeyDate,journeyTime) => {
    let filtered = [];
    for (let i = 0; i < bookings.length; i++) {
        const element = bookings[i];
        // console.log("Time Str1",new _Date(journeyDate), new _Date(element.journeyDate))
        if(utility.compareDates(new _Date(element.journeyDate),new _Date(journeyDate)) === 0){
            filtered.push(element)
        }
    }
    filtered = filtered.filter((e)=>{
        // console.log("Time Str",new _Date(journeyTime), new _Date(e.journeyTime))
        // console.log("Time",new _Date(journeyTime).getHours() , new _Date(e.journeyTime).getHours() ,new _Date(journeyTime).getMinutes() , new _Date(e.journeyTime).getMinutes())
        if(new _Date(journeyTime).getHours() === new _Date(e.journeyTime).getHours() && new _Date(journeyTime).getMinutes() === new _Date(e.journeyTime).getMinutes() ){
            return e
        }
    })
    // console.log("filtered",filtered,bookings)
    return filtered;
}


const getBookingDetails = async (req, res) => {
    let token = req.headers['x-access-token'] || req.headers['auth'];
    const mongoDb = dbVars.db;
    if (token) {
        let result = await mongoDb.collection("users").find({ token: token }).toArray();
        if (result && result.length > 0) {
            let validateFields = [
                {
                    fieldName: "busId",
                    value: req.body.busId,
                    validate: ["notNull"]
                },
                {
                    fieldName: "journeyDate",
                    value: req.body.journeyDate,
                    validate: ["notNull"]
                },
                {
                    fieldName: "sourceId",
                    value: req.body.sourceId,
                    validate: ["notNull"]
                },
                {
                    fieldName: "destId",
                    value: req.body.destId,
                    validate: ["notNull"]
                },
                {
                    fieldName: "userId",
                    value: req.body.userId,
                    validate: ["notNull"]
                },
                {
                    fieldName: "journeyTime",
                    value: req.body.journeyTime,
                    validate: ["notNull"]
                }
            ]
            if (!utility.validateFields(validateFields)) {
                let sr = new ServiceResponse(false, appConstants.FIELD_PARAM_MISSING);
                return sr.getServiceResponse();
            }
            let reqBody = { ...req.body };
            let bookingDetailsList = [];
            let bookingResult = await mongoDb.collection("booking").find(
                {
                    busId: reqBody.busId,
                    // journeyTime: reqBody.journeyTime,
                    sourceId: reqBody.sourceId,
                    destId: reqBody.destId

                }).toArray();
            if (bookingResult && bookingResult.length > 0) {
                bookingResult = filterBookingDataByDate(bookingResult,reqBody.journeyDate,reqBody.journeyTime)
                bookingDetailsList = filterBookingDataOnPaidCancel(bookingResult)
                bookingDetailsList = bookingDetailsList.map((e) => {
                    let obj = { ...e }
                    delete obj.createDate;
                    delete obj.updateDate;
                    return e
                })
            }

            let busDetailsResult = await mongoDb.collection("busDetails").find({ _id: ObjectId(reqBody.busId) }).toArray();


            let sr = new ServiceResponse(true, { busDetails: busDetailsResult[0], bookingDetailsList: bookingDetailsList });
            return sr.getServiceResponse();

        } else {
            let sr = new ServiceResponse(false, appConstants.NOT_VALID_TOKEN);
            return sr.getServiceResponse();
        }
    } else {
        let sr = new ServiceResponse(false, appConstants.TOKEN_MISSING);
        return sr.getServiceResponse();
    }
}

const createBookingEntry = async (req, res) => {
    let token = req.headers['x-access-token'] || req.headers['auth'];
    const mongoDb = dbVars.db;
    if (token) {
        let result = await mongoDb.collection("users").find({ token: token }).toArray();
        if (result && result.length > 0) {
            let validateFields = [
                {
                    fieldName: "busId",
                    value: req.body.busId,
                    validate: ["notNull"]
                },
                {
                    fieldName: "journeyDate",
                    value: req.body.journeyDate,
                    validate: ["notNull"]
                },
                {
                    fieldName: "sourceId",
                    value: req.body.sourceId,
                    validate: ["notNull"]
                },
                {
                    fieldName: "destId",
                    value: req.body.destId,
                    validate: ["notNull"]
                },
                {
                    fieldName: "userId",
                    value: req.body.userId,
                    validate: ["notNull"]
                },
                {
                    fieldName: "journeyTime",
                    value: req.body.journeyTime,
                    validate: ["notNull"]
                },
                {
                    fieldName: "seatNo",
                    value: req.body.seatNo,
                    validate: ["notNull", "isArray"]
                },
                {
                    fieldName: "totalFair",
                    value: req.body.totalFair,
                    validate: ["notNull"]
                }
            ]
            if (!utility.validateFields(validateFields)) {
                let sr = new ServiceResponse(false, appConstants.FIELD_PARAM_MISSING);
                return sr.getServiceResponse();
            }
            let validateBody = { ...req.body };
            delete validateBody.userId;
            delete validateBody.totalFair;
            let checkSeat = await checkSeatAvailableForBooking(validateBody);
            if (!checkSeat) {
                let sr = new ServiceResponse(false, appConstants.SEAT_BOOKED);
                return sr.getServiceResponse();
            }
            let reqBody = { ...req.body };
            reqBody.isPaid = 0;
            reqBody.isCancelled = 0;
            reqBody.userId = ObjectId(reqBody.userId);
            reqBody.createDate = new _Date();
            reqBody.updateDate = new _Date();
            let insertRes = await mongoDb.collection("booking").insertOne(reqBody);
            // console.log("booking add",reqBody,insertRes)
            if (insertRes && insertRes.insertedCount > 0) {
                let sr = new ServiceResponse(true, appConstants.SEAT_LOCKED);
                return sr.getServiceResponse();
            }
            let sr = new ServiceResponse(false, appConstants.ERROR_MSG);
            return sr.getServiceResponse();

        } else {
            let sr = new ServiceResponse(false, appConstants.NOT_VALID_TOKEN);
            return sr.getServiceResponse();
        }
    } else {
        let sr = new ServiceResponse(false, appConstants.TOKEN_MISSING);
        return sr.getServiceResponse();
    }
}

const payRequest = async (req, res) => {
    let token = req.headers['x-access-token'] || req.headers['auth'];
    const mongoDb = dbVars.db;
    if (token) {
        let result = await mongoDb.collection("users").find({ token: token }).toArray();
        if (result && result.length > 0) {
            let validateFields = [
                {
                    fieldName: "bookingId",
                    value: req.body.bookingId,
                    validate: ["notNull"]
                }
            ]
            if (!utility.validateFields(validateFields)) {
                let sr = new ServiceResponse(false, appConstants.FIELD_PARAM_MISSING);
                return sr.getServiceResponse();
            }

            let bookingId = ObjectId(req.body.bookingId);
            let payResult = await mongoDb.collection("booking").find({ _id: bookingId, isPaid: 0 }).toArray();
            if (payResult && payResult.length > 0) {
                let _paidData = payResult[0]
                if (checkTimestampsValidity(new _Date().getTime(), new _Date(_paidData.updateDate).getTime())) {
                    // request for payment gateway
                    // let payResult = await mongoDb.collection("booking").update({ _id: bookingId }, { $set: { isPaid: 1, updateDate: new _Date() } });
                    // let sr = new ServiceResponse(true, appConstants.PAYMENT_SUCCEED);
                    // return sr.getServiceResponse();
                    let paymentData = {
                        bookingId: bookingId,
                        totalFair: _paidData.totalFair,
                        contactNo: result[0].contactNo,
                        name: result[0].name
                    }
                    let paymentRes = await paymentService.instaMojoPaymentRequest(paymentData)
                    if (paymentRes.status) {
                        let _pRes = paymentRes && paymentRes.res ? JSON.parse(paymentRes.res) : null
                        if (_pRes && lodash.get(_pRes, "payment_request.longurl", false)) {
                            let sr = new ServiceResponse(true, _pRes);
                            return sr.getServiceResponse();
                        } else {
                            let sr = new ServiceResponse(false, appConstants.PAYMENT_FAILED);
                            return sr.getServiceResponse();
                        }
                    } else {
                        return paymentRes
                    }
                } else {
                    let sr = new ServiceResponse(false, appConstants.PAYMENT_SESSION_TIME_OUT);
                    return sr.getServiceResponse();
                }
            }

        } else {
            let sr = new ServiceResponse(false, appConstants.NOT_VALID_TOKEN);
            return sr.getServiceResponse();
        }
    } else {
        let sr = new ServiceResponse(false, appConstants.TOKEN_MISSING);
        return sr.getServiceResponse();
    }
}

const cancelBooking = async (req, res) => {
    let token = req.headers['x-access-token'] || req.headers['auth'];
    const mongoDb = dbVars.db;
    if (token) {
        let result = await mongoDb.collection("users").find({ token: token }).toArray();
        if (result && result.length > 0) {
            let validateFields = [
                {
                    fieldName: "bookingId",
                    value: req.body.bookingId,
                    validate: ["notNull"]
                }
            ]
            if (!utility.validateFields(validateFields)) {
                let sr = new ServiceResponse(false, appConstants.FIELD_PARAM_MISSING);
                return sr.getServiceResponse();
            }

            let bookingId = ObjectId(req.body.bookingId);
            let cancelResult = await mongoDb.collection("booking").updateOne({ _id: bookingId }, { $set: { isCancelled: 1, updateDate: new _Date() } });
            let sr = new ServiceResponse(true, appConstants.BOOKING_CANCELED);
            return sr.getServiceResponse();

        } else {
            let sr = new ServiceResponse(false, appConstants.NOT_VALID_TOKEN);
            return sr.getServiceResponse();
        }
    } else {
        let sr = new ServiceResponse(false, appConstants.TOKEN_MISSING);
        return sr.getServiceResponse();
    }
}



const getAllConfirmedBookings = async (req, res) => {
    let token = req.headers['x-access-token'] || req.headers['auth'];
    const mongoDb = dbVars.db;
    if (token) {
        let result = await mongoDb.collection("users").find({ token: token }).toArray();
        if (result && result.length > 0) {
            let bookingDate = req.query.date;
            let isCancelled = req.query.isCancelled;
            let userId = req.query.uId ? ObjectId(req.query.uId) : null;
            let dbObj = {
                isPaid: 1,
            }
            if (isCancelled === "1") {
                dbObj.isCancelled = 1
            }
            if (isCancelled === "0") {
                dbObj.isCancelled = 0
            }
            if (userId) {
                dbObj.userId = userId
            }
            let bookingResult = await mongoDb.collection("booking").aggregate([
                { $match : dbObj },
                { $lookup:
                   {
                     from: 'users',
                     localField:'userId',
                     foreignField: '_id',
                     as: 'userDetails'
                   }
                 },
                 {
                     $project: {
                         _id: 1,
                         busId: 1,
                         sourceId: 1,
                         destId:1,
                         journeyDate:1,
                         journeyTime:1,
                         userId:1,
                         seatNo:1,
                         totalFair:1,
                         isPaid:1,
                         isCancelled:1,
                         createDate:1,
                         updateDate:1,
                         isRefunded:1,
                         // email:1,
                         // dont include password here
                         //list all fields u need here
                         //now Probably show only "vehicles_name" from mapping.
                         "userDetails.name": 1 ,//if need full mapping then mapping:1
                         "userDetails.contactNo": 1 
                     }
                 }
                ]).toArray();
            if (bookingDate) {
                bookingResult = bookingResult.filter((e) => {
                    if (utility.compareDates(new _Date(e.journeyDate), new _Date(bookingDate)) === 0) {
                        return e
                    }
                })
            }
            let sr = new ServiceResponse(true, bookingResult);
            return sr.getServiceResponse();

        } else {
            let sr = new ServiceResponse(false, appConstants.NOT_VALID_TOKEN);
            return sr.getServiceResponse();
        }
    } else {
        let sr = new ServiceResponse(false, appConstants.TOKEN_MISSING);
        return sr.getServiceResponse();
    }
}

const instamojoResponse = async (req, res) => {
    let token = req.headers['x-access-token'] || req.headers['auth'];
    const mongoDb = dbVars.db;
    if (token) {
        let result = await mongoDb.collection("users").find({ token: token }).toArray();
        if (result && result.length > 0) {
            let bookingId = req.params.bookingId;
            let paymentId = req.query.payment_id;
            let paymentReqId = req.query.payment_request_id;
            let paymentStatus = req.query.payment_status;

            if (bookingId && paymentId && paymentReqId && paymentStatus) {
                let dbObj = {
                    bookingId: bookingId,
                    paymentId: paymentId,
                    paymentReqId: paymentReqId,
                    paymentStatus: paymentStatus,
                    isRefunded:false,
                    createDate: new _Date(),
                    updateDate: new _Date()
                }
                if (paymentStatus === "Credit") {
                    let paymentEntry = await mongoDb.collection("payment").find({ payment_id: paymentId }).toArray();
                    if (paymentEntry && paymentEntry.length > 0) {
                        let bookingResult = await mongoDb.collection("payment").updateOne({ payment_id: paymentId }, { $set: { updateDate: new _Date() } });
                    } else {

                        let bookingResult = await mongoDb.collection("payment").insertOne(dbObj);
                    }
                    let payResult = await mongoDb.collection("booking").updateOne({ _id: ObjectId(bookingId) }, { $set: { isPaid: 1, updateDate: new _Date() } });
                    let bookingDetails = await mongoDb.collection("booking").find({ _id: ObjectId(bookingId) }).toArray();
                    if (bookingDetails && bookingDetails.length > 0) {
                        let smsData = {
                            bookingId: bookingId,
                            name: result[0].name,
                            journeyDate: utility.formatDate(new Date(bookingDetails[0].journeyDate,),"dd/mm/yyyy"),
                            journeyTime: `${new Date(bookingDetails[0].journeyTime).getHours()}:${new Date(bookingDetails[0].journeyTime).getMinutes()}`,
                            fairPrice: bookingDetails[0].totalFair
                        }
                        let all_routes = await getAllRoutes();
                        if(all_routes && all_routes.length > 0){
                            let src = all_routes.filter((e)=>{
                                if(ObjectId(e._id).toString() === bookingDetails[0].sourceId){
                                    return e
                                }
                            })
                            let dest = all_routes.filter((e)=>{
                                if(ObjectId(e._id).toString() === bookingDetails[0].destId){
                                    return e
                                }
                            })
                            if(src && src.length > 0){
                                smsData.src = src[0].routeName
                            }
                            if(dest && dest.length > 0){
                                smsData.dest = dest[0].routeName
                            }
                        }
                        SmsService.sendSms(result[0].contactNo, smsData, appConstants.SMS_TEMPLATE.bookingTemplate)
                    }
                    let sr = new ServiceResponse(true, appConstants.PAYMENT_SUCCEED);
                    return sr.getServiceResponse();
                } else {
                    let bookingResult = await mongoDb.collection("payment").insertOne(dbObj);
                    let sr = new ServiceResponse(false, appConstants.PAYMENT_FAILED);
                    return sr.getServiceResponse();
                }
            } else {
                let sr = new ServiceResponse(false, appConstants.FIELD_PARAM_MISSING);
                return sr.getServiceResponse();
            }

        } else {
            let sr = new ServiceResponse(false, appConstants.NOT_VALID_TOKEN);
            return sr.getServiceResponse();
        }
    } else {
        let sr = new ServiceResponse(false, appConstants.TOKEN_MISSING);
        return sr.getServiceResponse();
    }

}

const refundBooking = async (req, res) => {
    let token = req.headers['x-access-token'] || req.headers['auth'];
    const mongoDb = dbVars.db;
    if (token) {
        let result = await mongoDb.collection("users").find({ token: token }).toArray();
        if (result && result.length > 0) {
            let validateFields = [
                {
                    fieldName: "bookingId",
                    value: req.body.bookingId,
                    validate: ["notNull"]
                }
            ]
            if (!utility.validateFields(validateFields)) {
                let sr = new ServiceResponse(false, appConstants.FIELD_PARAM_MISSING);
                return sr.getServiceResponse();
            }

            let bookingId = ObjectId(req.body.bookingId);
            let refundStatus = req.body.isRefunded;
            let cancelResult = await mongoDb.collection("booking").updateOne({ _id: bookingId }, { $set: { isRefunded: refundStatus, updateDate: new _Date() } });
            let sr = new ServiceResponse(true, appConstants.BOOKING_REFUNDED);
            return sr.getServiceResponse();

        } else {
            let sr = new ServiceResponse(false, appConstants.NOT_VALID_TOKEN);
            return sr.getServiceResponse();
        }
    } else {
        let sr = new ServiceResponse(false, appConstants.TOKEN_MISSING);
        return sr.getServiceResponse();
    }
}

module.exports = {
    getBookingDetails: getBookingDetails,
    createBookingEntry: createBookingEntry,
    payRequest: payRequest,
    getAllConfirmedBookings: getAllConfirmedBookings,
    cancelBooking: cancelBooking,
    instamojoResponse: instamojoResponse,
    refundBooking:refundBooking
}

