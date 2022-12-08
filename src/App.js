import React from 'react';
import {BrowserRouter, Route, Switch} from "react-router-dom";

import About from "./routes/admin/About";
import Home from "./routes/Home";
import Contact from "./routes/user/Contact";
import Navigation from "./components/Navigation";

import './scss/App.scss';

function App() {
	return (
		<BrowserRouter basename={process.env.PUBLIC_URL}>
			<Navigation />
			<Switch>
				<Route exact path="/" component={Home} />
				<Route path="/about" component={About} />
				<Route path="/contact" component={Contact} />
			</Switch>
		</BrowserRouter>
	);
}

export default App;
