import React from "react";
import uuid from 'react-uuid';

export const CheckBox = props => {
	const uId = uuid();
	return (
		<li className={'item'}>
			<input
				// key={props.id}
				onClick={(e) => props.handleCheckChildElement(e, props.user_phone)}
				type="checkbox"
				checked={props.isChecked}
				value={props.name}
				className={'input_check'}
				id={uId}
			/>
			<label htmlFor={uId} className={'input_label'}>{props.name}</label>
		</li>
	);
};

export default CheckBox;
