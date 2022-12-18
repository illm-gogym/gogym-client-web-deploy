import React from "react";
import uuid from 'react-uuid';

export const RadioButton = props => {
	const uId = uuid();
	return (
		<li className={'item'}>
			<input
				onClick={(e) => props.handleCheckChildElement(e, props.name)}
				type="radio"
				defaultChecked={props.isChecked}
				value={props.name}
				name={props.group}
				className={'input_check'}
				id={uId}
			/>
			<label htmlFor={uId} className={'input_label'}>{props.name}</label>
		</li>
	);
};

export default RadioButton;
