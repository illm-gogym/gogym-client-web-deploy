import React from 'react'
import Nav from '../../components/Navigation'


export default ({ children }) => {
	let lastScrollY = 0;
	const handleScroll = (e) => {
		const scrollY = e.target.scrollTop;
		const direction = scrollY > lastScrollY ? "down" : "up";
		lastScrollY = scrollY;

		if(direction === 'down' && scrollY >= 20 && scrollY <= 70 ) {
			e.target.scrollTop = 70;
			lastScrollY = 70;
		} else if(direction === 'up' && scrollY < 20) {
			e.target.scrollTop = 0;
			lastScrollY = 0;
		}
	}

	return (
		<>
			<Nav />
			<div className={'container'} >
				{children}
			</div>
		</>
	)
}

