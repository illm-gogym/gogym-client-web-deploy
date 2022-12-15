import React from 'react';
// import {BrowserRouter, Route, Switch, Router} from "react-router-dom";
import {BrowserRouter as Router, Route, Switch, Link, Redirect} from "react-router-dom";
import {getAuthToken, getAuthTrainerId} from './Util/Authentication';

import About from "./routes/admin/About";
import Manage from "./routes/admin/Manage";
import Schedule from "./routes/admin/Schedule";
import AdminLogin from "./routes/admin/AdminLogin";
import UserLogin from "./routes/user/UserLogin";
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
			<Router  basename={process.env.PUBLIC_URL}>
				<Navigation/>

				<Switch>
					<Route path="/" exact>
						{!getAuthToken() ? <Redirect to="/login" /> : <Redirect to="/schedule/member" />}
					</Route>
					<Route path="/login">
						<Login />
					</Route>
					<Route path="/admin/login">
						<AdminLogin />
					</Route>

					<Route path="/schedule">
						<Schedule />
					</Route>
					<Route path="/manage">
						<Manage />
					</Route>
					<Route path="/user/login">
						<UserLogin />
					</Route>
				</Switch>
			</Router>
		)
	}
}

export default App;
