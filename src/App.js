import React from 'react';
// import {BrowserRouter, Route, Switch, Router} from "react-router-dom";
import {BrowserRouter as Router, Route, Switch, Link, Redirect} from "react-router-dom";
import {getAuthToken, getAuthTrainerId, getLoginType} from './Util/Authentication';

import Manage from "./routes/admin/Manage";
import ManageDetail from "./routes/admin/ManageDetail";
import ManageClass from "./routes/admin/ManageClass";
import ManageRegister from "./routes/admin/ManageRegister";
import Schedule from "./routes/admin/Schedule";
import AdminLogin from "./routes/admin/AdminLogin";
import UserLogin from "./routes/user/UserLogin";
import UserSchedule from "./routes/user/Schedule";
import Login from "./routes/Login";
import Navigation from "./components/Navigation";

import './scss/App.scss';

class App  extends React.Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
	}

	render() {
		return (
			<div id={'wrap'}>

				<Router  basename={process.env.PUBLIC_URL}>
					<Navigation/>
					<div className={'container'}>
						<Switch>
							<Route path="/" exact>
								{/*/!*{!getAuthToken() ? <Redirect to="/login" /> :  (getLoginType() === 'trainer' ? <Redirect to="/schedule/member" /> :  <Redirect to="/user" /> )}*!/*/}
								<Login />
							</Route>
							{/*<Route path="/home" >*/}
								{/*/!*{!getAuthToken() ? <Redirect to="/login" /> :  (getLoginType() === 'trainer' ? <Redirect to="/schedule/member" /> :  <Redirect to="/user" /> )}*!/*/}
								{/*<Login />*/}
							{/*</Route>*/}
							<Route path="/login">
								<Login />
							</Route>
							<Route path="/admin/login">
								<AdminLogin />
							</Route>
							<Route path="/schedule">
								<Schedule />
								{/*<Redirect to="/schedule/member" />*/}
							</Route>
							<Route path="/manage/list" >
								<Manage />
							</Route>
							<Route path="/manage/detail">
								<ManageDetail />
							</Route>
							<Route path="/manage/class">
								<ManageClass />
							</Route>
							<Route path="/manage/register">
								<ManageRegister />
							</Route>
							<Route path="/user/login">
								<UserLogin />
							</Route>
							<Route path="/user">
								<UserSchedule/>
							</Route>
						</Switch>
					</div>
				</Router>
			</div>
		)
	}
}

export default App;
