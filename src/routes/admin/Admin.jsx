import React from 'react'
import Nav from '../../components/Navigation'


export default ({ children }) => {
	return (
		<>
			<Nav />
			<div className={'container'}>
				{children}
			</div>
		</>
	)
}

