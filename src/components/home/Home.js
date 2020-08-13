import React, { Component } from "react";
import s from "./home.module.scss";
import DefaultLayout from "../common/defaultLayout/DefaultLayout";

export default class Home extends Component {
  render() {
    return (
      <DefaultLayout screenName="home">
        <div className={s.mainCont}>
          Homw
        </div>

      </DefaultLayout>
    );
  }
}
