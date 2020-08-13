import React, { Component } from "react";
import s from "./busDetails.module.scss";
import "./mui-override.css";
import { TextField, Checkbox, Select, MenuItem, InputLabel } from '@material-ui/core';
import DateFnsUtils from '@date-io/date-fns';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import {
    MuiPickersUtilsProvider,
    KeyboardTimePicker,
    KeyboardDatePicker
} from '@material-ui/pickers';

class AddBusForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            busName: "",
            busNo: "",
            busType: "",
            fairPrice: "",
            isFixed: true,
            runDaily: true,
            journeyDate: new Date(),
            routesUp: [
                {
                    routeId: "",
                    km: "",
                    time: "00:01",

                }
            ],
            routesDown: [
                {
                    routeId: "",
                    km: "",
                    time: "00:01",

                }
            ]
        }
    }
    componentDidMount() {
        let { isEditBus, busData } = this.props;
        if (isEditBus && busData) {
            let obj = {
                busName: busData.busName,
                busNo: busData.busNo,
                busType: busData.busType,
                fairPrice: busData.fairPrice,
                isFixed: busData.isFixed,
                runDaily: busData.runDaily,
                journeyDate: busData.journeyDate,
                routesUp: busData.routes.up,
                routesDown: busData.routes.down
            }
            this.setState(obj)
        }
    }
    addRoutUp = () => {
        let routesUp = [...this.state.routesUp]
        routesUp.push({
            routeId: "",
            km: "",
            time: "",

        })
        this.setState({
            routesUp: routesUp
        })
    }
    addRoutDown = () => {
        let routesDown = [...this.state.routesDown]
        routesDown.push({
            routeId: "",
            km: "",
            time: "",

        })
        this.setState({
            routesDown: routesDown
        })
    }
    deleteroutesUp = (index) => {
        let routesUp = [...this.state.routesUp]
        routesUp = routesUp.filter((e, i) => {
            if (i !== index) {
                return e
            }
        })
        this.setState({
            routesUp: routesUp
        })
    }
    deleteRouteDown = (index) => {
        let routesDown = [...this.state.routesDown]
        routesDown = routesDown.filter((e, i) => {
            if (i !== index) {
                return e
            }
        })
        this.setState({
            routesDown: routesDown
        })
    }
    // form field inputs
    handleBusName = (e) => {
        this.setState({
            busName: e.target.value
        })
    }
    handleBusNo = (e) => {
        this.setState({
            busNo: e.target.value
        })
    }
    handleBusType = (e) => {
        this.setState({
            busType: e.target.value
        })
    }
    handleBusFairPrice = (e) => {
        this.setState({
            fairPrice: e.target.value
        })
    }
    handleIsFixed = (e) => {
        this.setState({
            isFixed: !this.state.isFixed
        })
    }
    handleDateChange = (date) => {
        this.setState({
            journeyDate: date
        })
    }
    handleRunDaily = (e) => {
        this.setState({
            runDaily: !this.state.runDaily
        })
    }
    handleSelectRoute = (e, i, type) => {
        let { routesUp, routesDown } = this.state
        if (type === "up") {
            routesUp[i].routeId = e.target.value
        } else {
            routesDown[i].routeId = e.target.value
        }
        this.setState({
            routesUp,
            routesDown
        })
    }
    handleTime = (date, i, type) => {
        let { routesUp, routesDown } = this.state

        if (type === "up") {
            routesUp[i].time = date
        } else {
            routesDown[i].time = date
        }
        console.log(routesUp[i].time)
        this.setState({
            routesUp,
            routesDown
        })
    }
    handleKm = (e, i, type) => {
        let { routesUp, routesDown } = this.state
        if (type === "up") {
            routesUp[i].km = e.target.value
        } else {
            routesDown[i].km = e.target.value
        }
        this.setState({
            routesUp,
            routesDown
        })
    }
    handleSubmit = () => {
        let { busName, busNo, busType, fairPrice, isFixed, journeyDate, runDaily, routesUp, routesDown } = this.state;
        let obj = {
            busName: busName,
            busNo: busNo,
            busType: busType,
            fairPrice: fairPrice,
            isFixed: isFixed,
            journeyDate: journeyDate,
            runDaily: runDaily,
            routes: {
                up: routesUp,
                down: routesDown
            }
        }

        console.log(obj)
        let { createBusAction, onCloseHandler, editBusAction, isEditBus, busData } = this.props;
        
        if(isEditBus){
            obj._id = busData._id
            editBusAction(obj)
        }else   
            createBusAction(obj);
        this.setState({
            busName: "",
            busNo: "",
            busType: "",
            fairPrice: "",
            isFixed: true,
            runDaily: true,
            journeyDate: new Date(),
            routesUp: [
                {
                    routeId: "",
                    km: "",
                    time: "00:01",

                }
            ],
            routesDown: [
                {
                    routeId: "",
                    km: "",
                    time: "00:01",

                }
            ]
        })
        onCloseHandler();
    }


    renderRoutesForm = (index, routeType) => {
        let { successReducer } = this.props;
        let { routesUp, routesDown } = this.state;
        return (
            <div className={s.routesForm}>
                <div className={s.routeCol} style={{ width: "30%" }}>
                    <InputLabel id="select-route-label">Select Routes</InputLabel>
                    <Select labelId="select-route-label" onChange={(e) => { this.handleSelectRoute(e, index, routeType) }} value={routeType === "up" ? routesUp[index].routeId : routesDown[index].routeId}>
                        {
                            successReducer && successReducer.getRoutes &&
                            successReducer.getRoutes.routes.map((e, i) => {
                                return (
                                    <MenuItem value={e._id}>{e.routeName}</MenuItem>
                                )
                            })
                        }
                    </Select>
                </div>
                <div className={s.routeCol} style={{ width: "10%" }}>
                    <TextField type="text" placeholder="km" value={routeType === "up" ? routesUp[index].km : routesDown[index].km} onChange={(e) => { this.handleKm(e, index, routeType) }} />
                </div>
                <div className={s.routeCol} style={{ width: "40%" }}>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardTimePicker
                            margin="normal"
                            id="time-picker"
                            // label="Time picker"
                            value={routeType === "up" ? routesUp[index].time : routesDown[index].time}
                            onChange={(date) => { this.handleTime(date, index, routeType) }}
                            KeyboardButtonProps={{
                                'aria-label': 'change time',
                            }}
                        />
                    </MuiPickersUtilsProvider>
                </div>
                <div className={s.routeCol} style={{ width: "20%" }}>
                    <button onClick={routeType === "up" ? () => { this.deleteroutesUp(index) } : () => { this.deleteRouteDown(index) }}>Delete</button>
                </div>
            </div>
        )
    }
    render() {
        let { successReducer } = this.props;
        const { busName, busNo, busType, fairPrice, isFixed, runDaily, journeyDate, routesUp, routesDown } = this.state;
        return (
            <div className={s.addBusForm}>
                <h2>Add Bus</h2>
                <div className={s.formInner}>
                    <div className={s.formField}>
                        <TextField label={"Bus Name"} type="text" onChange={this.handleBusName} value={busName} />
                    </div>
                    <div className={s.formField}>
                        <TextField label={"Bus Number"} type="text" onChange={this.handleBusNo} value={busNo} />
                    </div>
                    <div className={s.formField}>
                        <InputLabel id="select-bus-type-label">Select Bus Type</InputLabel>
                        <Select labelId="select-bus-type-label" value={busType} onChange={this.handleBusType}>

                            {
                                successReducer && successReducer.getBusType &&
                                successReducer.getBusType.busTypeList.map((e, i) => {
                                    return (
                                        <MenuItem value={e._id}>{e.maxSeat}X{e.maxRows}:{e.desc}</MenuItem>
                                    )
                                })
                            }
                        </Select>
                    </div>
                    <div className={s.formField}>
                        <div className={s.formFieldLeft}>
                            <TextField label="Fair Price" type="text" value={fairPrice} onChange={this.handleBusFairPrice} />
                        </div>
                        <div className={s.formFieldRight}>
                            <FormControlLabel
                                value="start"
                                control={<Checkbox checked={isFixed} onChange={this.handleIsFixed} />}
                                label="Is Fixed?"
                                labelPlacement="start"
                            />

                        </div>
                    </div>
                    <div className={s.formField}>
                        <div className={s.formFieldLeft}>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <KeyboardDatePicker
                                    margin="normal"
                                    id="date-picker-dialog"
                                    label="Date picker dialog"
                                    format="dd/MM/yyyy"
                                    value={journeyDate}
                                    onChange={this.handleDateChange}
                                    KeyboardButtonProps={{
                                        'aria-label': 'change date',
                                    }}
                                />
                            </MuiPickersUtilsProvider>
                            {/* <TextField laebl="Journey Date" type="date" value={journeyDate} /> */}
                        </div>
                        <div className={s.formFieldRight}>
                            <FormControlLabel
                                value="start"
                                control={<Checkbox label="Runs Daily?" onChange={this.handleRunDaily} checked={runDaily} />}
                                label="Runs Daily?"
                                labelPlacement="start"
                            />

                        </div>
                    </div>
                    <div className={`${s.formField} ${s.column}`}>
                        <label>Routes Up</label>
                        {
                            routesUp.map((e, i) => {
                                return this.renderRoutesForm(i, "up")
                            })
                        }
                        <button onClick={this.addRoutUp}>Add</button>
                    </div>
                    <div className={`${s.formField} ${s.column}`}>
                        <label>Routes Down</label>
                        {
                            routesDown.map((e, i) => {
                                return this.renderRoutesForm(i, "down")
                            })
                        }
                        <button onClick={this.addRoutDown}>Add</button>
                    </div>
                    <button onClick={this.handleSubmit} className={s.submitBtn}>Submit</button>
                </div>
            </div>
        )
    }
}

export default AddBusForm;