import { loginSubmit, otpSubmit, createUser, getUser } from "./userAction";
import { genericPopupAction, clearPostCreated, successAction, scoringAction, getPlayerStyles, appErrorMsgAction } from "./commonActions";
import { createPost, getPost, likePost } from "./postActions";
import {getRoutes,createRoutes,deleteRoutes,createBusType,editBusType,getBusType,deleteBusType,getBus,createBus,editBus, deleteBus, searchBus, editRoutes} from "./busActions";
import {getBookingDetails,bookSeat,cancelBooking,payBooking, bookingStatus, bookingInstamozo, bookingRefund} from "./bookingAction";

const actions = {
    loginSubmit,
    otpSubmit,
    genericPopupAction,
    createUser,
    createPost,
    getPost,
    clearPostCreated,
    likePost,
    getUser,
    successAction,
    scoringAction,
    getPlayerStyles,
    appErrorMsgAction,
    getRoutes,
    createRoutes,
    editRoutes,
    deleteRoutes,
    createBusType,
    editBusType,
    getBusType,
    deleteBusType,
    getBus,
    createBus,
    editBus,
    deleteBus,
    searchBus,
    getBookingDetails,
    bookSeat,
    cancelBooking,
    payBooking,
    bookingStatus,
    bookingInstamozo,
    bookingRefund
}
export default actions;