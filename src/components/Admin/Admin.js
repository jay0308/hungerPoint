import React from 'react';
import DefaultLayoutContainer from '../common/defaultLayout/DefaultLayoutContainer';
import s from "./style.module.scss";
import { TextField } from '@material-ui/core';

class Admin extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            bookingId: "",
            todo: ""
        }
    }
    setBookingId = (e) => {
        this.setState({
            bookingId: e.target.value
        })
    }
    handleRadioBtn = (e) => {
        this.setState({
            todo: e.target.value
        })
    }
    handleSubmit = () => {
        let { bookingId, todo } = this.state;
        if(bookingId && todo){
            let { bookingInstamojoAction, cancelBookingAction } = this.props;
            if (todo === "pay") {
                let qs = `?payment_id=admin&payment_request_id=admin&payment_status=Credit`;
                bookingInstamojoAction(bookingId, qs)
            } else {
                let reqObj = {
                    bookingId: bookingId
                  }
                cancelBookingAction(reqObj)
            }

        }else{
            alert("Please fill all the fields")
        }
    }
    renderCancelPayForm = () => {
        let { bookingId } = this.state;
        return (
            <div className={s.cancelPayForm}>
                <div className={s.inner}>
                    <div className={s.field}>
                        <TextField label="Enter Booking Id" type="text" value={bookingId} onChange={(e) => { this.setBookingId(e) }} />
                    </div>
                    <div className={s.field}>
                        <label>
                            Mark paid
                            <input type="radio" name="bokkingStatus" value="pay" onChange={this.handleRadioBtn} />
                        </label>
                        <label>
                            Mark Cancelled
                            <input type="radio" name="bokkingStatus" value="cancel" onChange={this.handleRadioBtn} />
                        </label>
                    </div>
                    <div className={s.field}>
                        <button onClick={this.handleSubmit}>Submit</button>
                    </div>
                </div>
            </div>
        )
    }
    render() {
        return (
            <DefaultLayoutContainer
                screenName="admin"
            >
                <div className={s.adminHomeCont}>
                    <div className={s.adminHeader}>
                        <h2>Admin</h2>
                    </div>
                    {this.renderCancelPayForm()}
                </div>
            </DefaultLayoutContainer>
        )
    }
}

export default Admin;