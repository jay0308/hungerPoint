import React, { Component } from "react";
import s from "./footer.module.scss";
import HomeIcon from "@material-ui/icons/Home";
import ListIcon from "@material-ui/icons/List";
import HeadsetMicIcon from "@material-ui/icons/HeadsetMic";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import global from "../../../utils/common";
import {Link} from "react-router-dom";
class Footer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false,
    };
  }
  handleChange = () => {
    this.setState({
      active: true,
    });
  };
  render() {
    let { screenName } = this.props;
    return (
      <div className={s.footerSec}>
        {global.isMobile() && (
          <div className={`${s.footerMenu}`}>
            Hungerspoint | It's too yummy...
          </div>
        )}
      </div>
    );
  }
}

export default Footer;
