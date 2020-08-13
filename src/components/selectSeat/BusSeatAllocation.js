import React, { Component } from "react";
import s from "./busSeat.module.scss";
import global from "../../utils/common";
import Modal from "../common/modal";
import lodash from "lodash";
import { Link } from "react-router-dom";

class BusSeatAllocation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            seats: null,
            selectedSeat: [],
            showPayNowPopup: false,
            selfBookingDetails: null
        }
    }
    componentDidMount() {
        this.setState({
            seats: this.getSeatFormat()
        })
    }
    // shouldComponentUpdate(nextProps,nextState){
    //     if(nextProps.bookingDetails && !lodash.isEqual(nextProps.bookingDetails,this.props.bookingDetails)){
    //         this.setState({
    //             seats: this.getSeatFormat(),
    //             selectedSeat: [],
    //             showPayNowPopup: false,
    //             selfBookingDetails: null
    //         })
    //         return true;
    //     }
    //     return true;
    // }
    handleSeatChange(i, j) {
        let seats = [...this.state.seats];
        let selectedSeat = [...this.state.selectedSeat]
        console.log(seats[i][j])
        if (seats[i][j]) {
            if (!seats[i][j].checked) {
                selectedSeat.push(seats[i][j].name)
            } else {
                let index = selectedSeat.indexOf(seats[i][j].name);
                if (index > -1) {
                    selectedSeat.splice(index, 1);
                }
            }
            seats[i][j].checked = !seats[i][j].checked;
            console.log(seats)
            this.setState({
                seats: seats,
                selectedSeat: selectedSeat
            })
        }
    }
    // getBusTypeName = (id) => {
    //     const { successReducer } = this.props;
    //     let busType = successReducer && successReducer.getBusType && successReducer.getBusType.busTypeList || [];
    //     let filtered = busType.filter((e) => {
    //         if (e._id === id)
    //             return e
    //     })
    //     console.log("Filtered", filtered, busType, id)
    //     if (filtered.length > 0)
    //         return `${filtered[0].maxSeat}X${filtered[0].maxRows}:${filtered[0].desc}`

    //     return ""
    // }
    getBusTypeObj = (id) => {
        const { successReducer } = this.props;
        let busType = successReducer && successReducer.getBusType && successReducer.getBusType.busTypeList || [];
        let filtered = busType.filter((e) => {
            if (e._id === id)
                return e
        })
        console.log("Filtered", filtered, busType, id)
        if (filtered.length > 0)
            return filtered[0]

        return ""
    }
    getSeatFormat = () => {
        let { busData } = this.props;
        let bustypeData = this.getBusTypeObj(busData.busType)
        let obj = [];
        bustypeData && bustypeData.seatMatrix && bustypeData.seatMatrix.map((ele) => {
            let arr = []
            ele.map((e) => {
                arr.push({ name: e, checked: false, disabled: this.checkIfSeatIsAllocated(e) })
            })
            obj.push(arr)
        })
        return obj;
    }
    // getSeatFormat = () => {
    //     let { busData } = this.props;
    //     let str = this.getBusTypeName(busData.busType);
    //     let strSplit = str.split(":");
    //     let tSeat = parseInt(strSplit[0]);
    //     let row = parseInt(strSplit[1]);
    //     let matrix = strSplit[3].split("X");
    //     let sInRow = parseInt(matrix[0]) + parseInt(matrix[1]);
    //     let sInLastRow = tSeat - (row - 1) * sInRow;
    //     let blankSpace = sInLastRow - sInRow;
    //     let obj = [];
    //     for (let i = 0, seatNo = 1, ch = 65; i < row; i++ , ch++) {
    //         let arr = [];
    //         if (i % 2 === 0) {
    //             seatNo = (i + 1) * sInRow - (sInRow - 1);
    //         } else {
    //             if (i + 1 === row) {
    //                 seatNo = tSeat;
    //             } else {
    //                 seatNo = (i + 1) * sInRow;
    //             }

    //         }
    //         for (let j = 1, incr = 1; j <= sInRow + blankSpace; j++) {
    //             if (i === row - 1) {
    //                 // arr.push({ name: `${String.fromCharCode(ch)}${incr}`, checked: false, disabled: this.checkIfSeatIsAllocated(`${String.fromCharCode(ch)}${incr}`) })
    //                 arr.push({ name: `${seatNo}`, checked: false, disabled: this.checkIfSeatIsAllocated(`${seatNo}`) })
    //                 if (i % 2 === 0) {
    //                     seatNo++;
    //                 } else {
    //                     seatNo--;
    //                 }
    //                 incr++;
    //             } else {
    //                 if (j <= parseInt(matrix[0])) {
    //                     // arr.push({ name: `${String.fromCharCode(ch)}${incr}`, checked: false, disabled: this.checkIfSeatIsAllocated(`${String.fromCharCode(ch)}${incr}`) })
    //                     arr.push({ name: `${seatNo}`, checked: false, disabled: this.checkIfSeatIsAllocated(`${seatNo}`) })
    //                     if (i % 2 === 0) {
    //                         seatNo++;
    //                     } else {
    //                         seatNo--;
    //                     }
    //                     incr++;
    //                 } else {
    //                     if (j <= parseInt(matrix[0]) + blankSpace) {
    //                         arr.push(null)
    //                     } else {
    //                         // arr.push({ name: `${String.fromCharCode(ch)}${incr}`, checked: false, disabled: this.checkIfSeatIsAllocated(`${String.fromCharCode(ch)}${incr}`) })
    //                         arr.push({ name: `${seatNo}`, checked: false, disabled: this.checkIfSeatIsAllocated(`${seatNo}`) })
    //                         if (i % 2 === 0) {
    //                             seatNo++;
    //                         } else {
    //                             seatNo--;
    //                         }
    //                         incr++;
    //                     }
    //                 }
    //             }

    //         }
    //         obj.push(arr);
    //     }
    //     console.log(obj);
    //     return obj;
    // }
    checkIfSeatIsAllocated = (seatNo) => {
        let { bookingDetails, userDataReducer } = this.props;
        let { selectedSeat } = this.state;
        if (userDataReducer && bookingDetails) {
            for (let i = 0; i < bookingDetails.bookingDetailsList.length; i++) {
                const element = bookingDetails.bookingDetailsList[i];
                if (element.seatNo.indexOf(seatNo) > -1) {
                    if (element.userId === userDataReducer._id && element.isPaid === 0) {
                        this.setState({
                            selectedSeat: [...selectedSeat, ...element.seatNo],
                            selfBookingDetails: element,
                            showPayNowPopup: true
                        })
                    }
                    return true;
                }
            }

        } else {
            return false
        }
    }
    bookSeat = () => {
        let searchParms = global.getUrlParams()
        let busId = searchParms.get("busId")
        let sourceId = searchParms.get("sourceId")
        let destId = searchParms.get("destId")
        let journeyDate = searchParms.get("journeyDate")
        let journeyTime = searchParms.get("journeyTime")

        let { bookSeatAction, userDataReducer } = this.props;
        if (userDataReducer) {
            let reqObj = {
                busId: busId,
                sourceId: sourceId,
                destId: destId,
                journeyDate: journeyDate,
                journeyTime: journeyTime,
                userId: userDataReducer._id,
                seatNo: this.state.selectedSeat,
                totalFair: this.state.selectedSeat.length * parseInt(this.props.busData.fairPrice)
            }
            bookSeatAction(reqObj)
        }
    }

    // checkIfSeatsLocked = (bookingList) => {
    //     let { userDataReducer } = this.props;
    //     let obj = null;
    //     let flag = false;
    //     bookingList.map((e) => {
    //         if (e.userId === userDataReducer._id) {
    //             obj = { ...e };
    //             flag = true
    //         }
    //     })
    //     this.setState({
    //         selfBookingDetails: obj
    //     })
    //     return flag
    // }
    cancelBooking = () => {
        let { preCancelBookingAction } = this.props;
        let { selfBookingDetails } = this.state
        if (selfBookingDetails) {
            let reqObj = {
                bookingId: selfBookingDetails._id
            }
            preCancelBookingAction(reqObj)
        }
    }
    payNow = () => {
        let { payBookingAction } = this.props;
        let { selfBookingDetails } = this.state
        if (selfBookingDetails) {
            console.log('APyNow', selfBookingDetails, payBookingAction)
            let reqObj = {
                bookingId: selfBookingDetails._id
            }
            payBookingAction(reqObj)
        }
    }
    getPayNowComp = () => {
        let { selectedSeat, selfBookingDetails } = this.state;
        return (
            <div className={s.payNowContainer}>
                <p className={s.hint}>*Your seat has been locked for 10 minutes, please pay as soon as possible</p>
                <p>Your selected seats are {selectedSeat.join(",")}</p>
                <p>Total Fair Rs. {selfBookingDetails.totalFair}</p>
                <p>Booking Id: {selfBookingDetails._id}</p>
                <div className={s.buttons}>
                    <button className={s.cancelBtn} onClick={this.cancelBooking}>Cancel Booking</button>
                    <button onClick={this.payNow}>Pay Now</button>
                </div>
            </div>
        )
    }
    render() {
        let { seats, selectedSeat, showPayNowPopup } = this.state;
        let { busData, successReducer } = this.props;
        return (
            <div className={s.busSeatAlloc}>
                {
                    seats &&
                    seats.map((e, i) => {
                        return (
                            <div className={s.row}>
                                {
                                    e &&
                                    e.map((ele, j) => {
                                        return (
                                            <div className={s.block} key={new Date().getMilliseconds() + i + j}>
                                                {
                                                    ele && ele.name &&
                                                    <React.Fragment>
                                                        {
                                                            ele.disabled ?
                                                                <input type="checkbox" disabled onChange={() => { this.handleSeatChange(i, j) }} checked={ele.checked} />
                                                                :
                                                                <input type="checkbox" onChange={() => { this.handleSeatChange(i, j) }} checked={ele.checked} />
                                                        }

                                                        <span>{ele.name}</span>
                                                    </React.Fragment>
                                                }
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        )
                    })
                }
                {
                    selectedSeat && selectedSeat.length > 0 &&
                    <div className={s.selectedSeat}>
                        <p>Your selected seats are {selectedSeat.join(",")}</p>
                        <p>Total Fair {selectedSeat.length * parseInt(busData.fairPrice)}</p>
                        <div className={s.btnBar}>
                            <Link className={s.back} to="/">Back</Link>
                            <button onClick={this.bookSeat}>Book Now</button>
                        </div>
                    </div>
                }

                {
                    showPayNowPopup &&
                    <Modal
                        isShowCross={false}
                        customComp={this.getPayNowComp()}
                        onCloseHandler={() => { }}
                        disableOverlayClick = {true}
                    />
                }
            </div>
        )
    }
}

export default BusSeatAllocation;