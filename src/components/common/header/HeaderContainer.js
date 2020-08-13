import { connect } from 'react-redux';
import actions  from '../../../store/actions';
import Header from "./index";

const mapStateToProps = (state) => {
    return {
        successReducer:state.successReducer || null
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        loaderAction: (val) => dispatch(actions.loaderAction(val)),
        successAction:(data) => dispatch(actions.successAction(data))
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(Header);