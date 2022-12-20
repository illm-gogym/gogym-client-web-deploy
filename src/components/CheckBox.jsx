import React from "react";
import uuid from 'react-uuid';

export const CheckBox = props => {
	const uId = uuid();
	// console.log(props.paletteList);
	return (
		<li className={'item'}>
			<input
				onClick={(e) => props.handleCheckChildElement(e, props)}
				type="checkbox"
				defaultChecked={props.isChecked}
				value={props.name}
				className={'input_check'}
				id={uId}
			/>
			<label htmlFor={uId} className={'input_label'} style={{color: props.paletteList[props.user_phone === undefined? props.trainer_id : props.user_phone]}}>
				<span className={'text'}>{props.name}</span>
			</label>
		</li>
	);
};

export default CheckBox;
