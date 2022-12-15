import React from "react";
import {Link, NavLink, Redirect} from 'react-router-dom';
import classNames from 'classnames';

class AdminLogin extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div id={'wrap'} >
				관리자로그인
			</div>
		)
	}
}
export default AdminLogin;
