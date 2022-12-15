import React from "react";
import {Link, NavLink, Redirect} from 'react-router-dom';
import classNames from 'classnames';

class UserLogin extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div id={'wrap'} >
				회원로그인
			</div>
		)
	}
}
export default UserLogin;
