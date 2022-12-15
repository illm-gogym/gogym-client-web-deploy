import React from "react";
import {Link, NavLink, Redirect} from 'react-router-dom';
import classNames from 'classnames';

class Login extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div id={'wrap'} >
				<NavLink to={'/admin/login'}>관리자 로그인</NavLink>
				<NavLink to={'/user/login'}>관리자 로그인</NavLink>
			</div>
		)
	}
}
export default Login;
