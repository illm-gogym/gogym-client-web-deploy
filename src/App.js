import React from 'react';
// import {BrowserRouter, Route, Switch, Router} from "react-router-dom";
import {BrowserRouter as Router, Route, Switch, Link, Redirect} from "react-router-dom";
import {getAuthToken, getAuthTrainerId} from './Util/Authentication';

import About from "./routes/admin/About";
import Manage from "./routes/admin/Manage";
import Schedule from "./routes/admin/Schedule";
import AdminLogin from "./routes/admin/AdminLogin";
import UserLogin from "./routes/user/UserLogin";
import Home from "./routes/Home";
import Login from "./routes/Login";
import Navigation from "./components/Navigation";

import './scss/App.scss';

function App() {
	return (
		<Router  basename={process.env.PUBLIC_URL}>
			<Navigation/>

			<Switch>
				<Route path="/about">
					<About />
				</Route>
				<Route path="/schedule">
					<Schedule />
				</Route>
				<Route path="/manage">
					<Manage />
				</Route>
				<Route path="/login">
					<Login />
				</Route>
				<Route path="/admin/login">
					<AdminLogin />
				</Route>
				<Route path="/user/login">
					<UserLogin />
				</Route>
				<Route path="/">
					{!getAuthToken() ? <Redirect to="/login" /> : <Schedule />}
				</Route>
			</Switch>
		</Router>
	);
}

export default App;
