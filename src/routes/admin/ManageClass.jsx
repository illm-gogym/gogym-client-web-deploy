import React from 'react';
import classNames from 'classnames';
import ContentEditable from "react-contenteditable";
import {Icon} from "../../asset/js/icon";

import {getAuthToken, getAuthTrainerId} from '../../Util/Authentication';
import {dateFormatYYYYMMDD, dateFormatYYMMDD, dateFormatGetTime, dateFormatWithTime} from '../../Util/DateFormat';
import {useParams, useLocation, Link, withRouter} from "react-router-dom";
import axios from "axios";

class ManageClass extends React.Component {
	constructor(props) {
		super(props);

		this.editRef = React.createRef();
		this.state = {
			personal: {
				date: "",
				name: "",
				user_phone: "",
			},
			isLoadDate: false,
			isEdit: false,
		}
	}

	historyBack = () => {
		this.props.history.goBack();
	}

	onDelete = () => {
		const reservation = this.state.personal.reservation;
		if(window.confirm("일정을 취소 하시겠습니까?")) {
			this.setUserReservationDeleteApi(reservation.reservation_id);

		} else {
			// this.closeModifyModal();
		}
	}

	onEditChange  = (e) => {
		const text = e.target.value;
		this.setState({
			personal: {
				...this.state.personal,
				reservation: {
					...this.state.personal.reservation,
					description: text,
				}
			},
			isEdit: true,
		})
	}

	onModify = () => {
		this.setUserReservationUpdateApi(this.state.personal, this.state.personal.reservation.start_time, this.state.personal.reservation.end_time);
	}

	componentDidMount() {
		const personal = this.props.location.state;

		this.setState({
			personal: personal,
			isLoadDate: true,
		});
	}

	render() {
		const {isLoadDate, personal, isEdit} = this.state;
		return (
			<div id={'wrap'} className={classNames('manage_wrap')}>
				<div className="container">
					<div className={'notify_area'}>
						<h2>
							<button type={'button'} className={'btn_back'} onClick={this.historyBack}><Icon.ic24BulletArrowLeft333/></button>
							회원 관리
						</h2>
					</div>

					<div className={classNames('section', 'full')}>
						{isLoadDate &&
						<>
							<div className={'class_header'}>
								<strong className={'date'}>{dateFormatYYMMDD(personal.reservation.start_time, '.', 'day')}</strong>
								<span className={'time'}>{dateFormatGetTime(personal.reservation.start_time)} ~ {dateFormatGetTime(personal.reservation.end_time)}</span>
								<span className={'reservation'}>
									<button type={'button'} className={'btn_cancel'} onClick={(e) => this.onDelete()}>일정취소</button>
									<button type={'button'} className={'btn_finish'}>완료하기</button>
								</span>
							</div>
							<ContentEditable
								innerRef={this.editRef}
								html={personal.reservation.description}
								disabled={false}
								onChange={(e) => this.onEditChange(e)}
								className={'class_description'}
								// onChange={(e) => setState((prev) => ({ ...prev, html: e.target.value }))}
							/>
						</>
						}

						<button type={'button'} className={'btn_modify'} disabled={!isEdit} onClick={this.onModify}>수정하기</button>
					</div>
				</div>
			</div>
		);
	}

	setUserReservationUpdateApi = async (value, start, end) => {
		const param = JSON.parse(JSON.stringify({
			description: value.reservation.description,
			end_time: dateFormatWithTime(end),
			reservation_id: value.reservation.reservation_id,
			start_time: dateFormatWithTime(start),
			usage_state: value.reservation.usage_state,
			user_phone: value.reservation.user_phone,
		}));
		// console.log(param);
		try{
			const requestOption ={
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'no-cache',
					'Accept': 'application/json',
					Authorization: `Bearer ${getAuthToken()}`,
				},
			};
			await axios.post("http://13.125.53.84:8080/api/auth/reservation/update",
				JSON.stringify(param), requestOption )
				.then(res =>{
					const resData = JSON.parse(JSON.stringify(res.data));
					axios.defaults.headers.common['Authorization'] = `Bearer ${getAuthToken()}`;
					this.props.history.goBack();
				})
				.catch(ex=>{
					console.log("login requset fail : " + ex);
				})
				.finally(()=>{console.log("login request end")});
		}catch(e){
			console.log(e.response);
		}
	}

	// 일정 삭제
	setUserReservationDeleteApi = async (value) => {
		const param = JSON.parse(JSON.stringify({
			reservation_id: value
		}));
		try{
			const requestOption ={
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'no-cache',
					'Accept': 'application/json',
					Authorization: `Bearer ${getAuthToken()}`,
				},
			};
			await axios.post(`http://13.125.53.84:8080/api/auth/reservation/delete/${value}`, {},
				requestOption )
				.then(res =>{
					const resData = JSON.parse(JSON.stringify(res.data));
					axios.defaults.headers.common['Authorization'] = `Bearer ${getAuthToken()}`;
					this.props.history.goBack();
				})
				.catch(ex=>{
					console.log("login requset fail : " + ex);
				})
				.finally(()=>{console.log("login request end")});
		}catch(e){
			console.log(e.response);
		}
	}
}

export default withRouter(ManageClass);
