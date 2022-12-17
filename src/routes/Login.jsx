import React from "react";
import {Link, NavLink, Redirect} from 'react-router-dom';
import classNames from 'classnames';
import $ from 'jquery';

import {Icon} from "../asset/js/icon";
import {getAuthToken, getLoginType} from "../Util/Authentication";

class Login extends React.Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		// $('.aside').hide();
	}

	render() {
		if(getAuthToken()) {
			if(getLoginType() === 'trainer') {
				return <Redirect to="/schedule/member" />;
			}
			else
				return <Redirect to="/user" />;
		}
		return (
			<div className={'login_wrap'} >
				<div className={'logo_area'}>
					<span className="blind">GoGym</span>
					{ <Icon.logoGo/>}
					{ <Icon.logoGym/>}
				</div>
				<NavLink to={'/admin/login'} className={'btn_type'}>관리자 로그인</NavLink>
				<NavLink to={'/user/login'}  className={'btn_type'}>회원 로그인</NavLink>
			</div>
		)
	}
}
export default Login;
