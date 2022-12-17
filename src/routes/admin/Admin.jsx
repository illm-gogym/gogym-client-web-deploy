import React from 'react'
import Nav from '../../components/Navigation'


export default ({ children }) => {
	console.log('render Main');

	return (
		<>
			<Nav />
			<div className={'container'}>
				{children}
			</div>
		</>
	)
}

