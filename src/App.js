import React from 'react';
// import {BrowserRouter, Route, Switch, Router} from "react-router-dom";
import {BrowserRouter as Router, Route, Switch, Link, Redirect} from "react-router-dom";
import {getAuthToken, getAuthTrainerId, getLoginType} from './Util/Authentication';

import Admin from "./routes/admin/Admin";
import Manage from "./routes/admin/Manage";
import ManageDetail from "./routes/admin/ManageDetail";
import ManageClass from "./routes/admin/ManageClass";
import ManageRegister from "./routes/admin/ManageRegister";
import ScheduleMember from "./routes/admin/ScheduleMember";
import ScheduleTrainer from "./routes/admin/ScheduleTrainer";
import AdminLogin from "./routes/admin/AdminLogin";

import User from "./routes/user/User";
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
					<Switch>
						<Route path="/" exact>
							<Login />
						</Route>

						<Route path='/login/:path?'>
							<User>
								<Switch>
									<Route path='/login' exact component={Login} />
									<Route path='/login/user' component={UserLogin} />
									<Route path='/login/admin' component={AdminLogin} />
								</Switch>
							</User>
						</Route>

						<Route path='/schedule/:path?' exact>
							<Switch>
								<Admin>
									<Route path='/schedule' exact component={ScheduleMember} />
									<Route path='/schedule/member' component={ScheduleMember} />
									<Route path='/schedule/trainer' component={ScheduleTrainer} />
								</Admin>
							</Switch>
						</Route>

						<Route path='/manage/:path?'>
							<Admin>
								<Switch>
									<Route path='/manage' exact component={Manage} />
									<Route path='/manage/detail' component={ManageDetail} />
									<Route path='/manage/class' component={ManageClass} />
									<Route path='/manage/register' component={ManageRegister} />
								</Switch>
							</Admin>
						</Route>

						<Route path='/user/:path?' exact>
							<User>
								<Switch>
									<Route path='/user' exact component={UserSchedule} />
								</Switch>
							</User>
						</Route>
					</Switch>
				</Router>
			</div>
		)
	}
}

export default App;
