import React from 'react';
import classNames from 'classnames';
import {Icon} from "../../asset/js/icon";

import {getAuthToken, getAuthTrainerId} from '../../Util/Authentication';
import {dateFormatYYYYMMDD, dateFormatWithTime} from '../../Util/DateFormat';
import Navigation from '../../components/Navigation';
import {useParams, useLocation, Link, withRouter} from "react-router-dom";
import axios from "axios";
import uuid from 'react-uuid';
import {CheckBox} from "../../components/CheckBox";
import {RadioButton} from "../../components/RadioButton";

function withParams(Component) {
	return props => <Component {...props} params={useParams()} location={useLocation()}/>;
}

class ManageDetail extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			personal: {
				date: "",
				name: "",
				user_phone: "",
			},
			scheduleStateList: [
				{name: '전체', group: 'sort', isChecked: true, user_state: 0},
				{name: '완료', group: 'sort', isChecked: false, user_state: 1},
				{name: '예정', group: 'sort', isChecked: false, user_state: -1},
			],
			personalList: [],
			ticketInfo: {
				registration: {},
				user: {}
			},
			isLoadDate: false,
			selectState: 0,
		}
	}

	historyBack = () => {
		this.props.history.goBack();
	}

	handleCheckChildElement = (event, value) => { // 라이도버튼 개별제어
		// const state = ['전체', '완료', '예정'];
		const state = {
			'전체': 0,
			"예정": -1,
			"완료" : 1
		};

		let scheduleStateList = this.state.scheduleStateList;
		scheduleStateList.forEach(status => {
			if (status.name === value)
				status.isChecked = true;
			else
				status.isChecked = false;
		});

		this.setState({
			scheduleStateList: scheduleStateList,
			selectState: state[value],
		});

		if(event.target.checked) {
		}
	};

	onFinish = (value, state) => {
		if(window.confirm("일정을 완료 하시겠습니까?")) {
			value.reservation.usage_state = Number(value.reservation.usage_state) * -1;
			this.setUserReservationUpdateApi(value, value.reservation.start_time, value.reservation.end_time);
		}
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.state.personalList.length !== prevState.personalList.length) {
			this.setState({
				isLoadDate: true,
			});
		}
	}

	componentDidMount() {
		const { match, location, history } = this.props;

		const personal = this.props.location.state;
		this.setState({
			personal: personal,
		});
		this.getUserNameReservationApi([personal.user_phone]);
		this.getUserNameTicketApi(personal.user_phone);
	}

	render() {
		const { personal, personalList, isLoadDate, scheduleStateList, selectState, ticketInfo } = this.state;

		const getPersonalList = personalList.map((value, index) =>
			(value.reservation.usage_state === selectState || selectState === 0) &&
			<li className={'item'} key={uuid()}>
				<div className="inner">
					<span className={classNames('index')}>
						{personalList.length - index}
					</span>
					<span className={classNames('date')}>
						{dateFormatYYYYMMDD(value.reservation.start_time, '.', 'day').replace('T', ' ')}
					</span>
					<span className={classNames('state', {'prearrange' : value.reservation.usage_state === -1} )}>
						{value.reservation.usage_state === -1 ? '예정' : '완료'}
					</span>
					{
						value.reservation.usage_state === -1 &&
							<button className={'btn_detail'} type={'button'} onClick={() => this.onFinish(value)}>
								완료하기
							</button>
					}
					<span className={'ic_arrow'}>
						<Icon.ic24BulletArrowRight/>
					</span>
				</div>
				<Link to={{pathname:`/manage/class`,  state:value}}/>
			</li>
		);

		return (
			<div id={'wrap'} className={classNames('manage_wrap')}>
				{/*<Navigation/>*/}
				<div className="container">
					<div className={'notify_area'}>
						<h2>
							<button type={'button'} className={'btn_back'} onClick={this.historyBack}><Icon.ic24BulletArrowLeft333/></button>
							개인 관리
						</h2>
					</div>
					<div className={classNames('section')}>
						<div className={'manage_header'}>
							<strong>{personal.name}</strong>
							<button type={'button'} className={'btn_edit'}>
								<Icon.ic12Pencil666/>
								회원 정보 수정
							</button>
						</div>
						<div className={'manage_ticket'}>
							<dl className={'ticket_info'}>
								<dt>
									남은 수강권
								</dt>
								<dd>
									<strong className={'highlight'}>{ticketInfo.registration.remaining} 남음</strong> (총 {ticketInfo.registration.total} 회)
								</dd>
								<dt>
									수강 기간
								</dt>
								<dd>
									{dateFormatYYYYMMDD(ticketInfo.registration.ins_dtm, '.', '2digits')} ~
									{dateFormatYYYYMMDD(ticketInfo.registration.date, '.', '2digits')}
								</dd>
							</dl>
							<dl className={'ticket_info'}>
								<dt>
									생년월일
								</dt>
								<dd>
									{dateFormatYYYYMMDD(ticketInfo.user.date, '.')}
								</dd>
								<dt>
									전화번호
								</dt>
								<dd>
									{ticketInfo.user.user_phone}
								</dd>
								{/*<dt>*/}
									{/*주소*/}
								{/*</dt>*/}
								{/*<dd>*/}
									{/*주소관련 정보가 따로 안옵니다. 주소 꼭 필요할까요?*/}
								{/*</dd>*/}
							</dl>

						</div>
					</div>
					<div className={classNames('section', 'full')}>
						<div className={'manage_header'}>
							<div className={'header_area'}>
								<strong>운동 기록</strong>
							</div>
						</div>

						<div className={'manage_content'}>
							<ul className={'sort_list'}>
								{scheduleStateList.map((value, index) => {
									return <RadioButton
										handleCheckChildElement={this.handleCheckChildElement}
										{...value}
										key={uuid()}
									/>
								})}
							</ul>
							<div className={'personal_list'}>
								{isLoadDate ? getPersonalList : null}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	getUserNameReservationApi = async (value) => {
		try{
			const param = JSON.parse(JSON.stringify({
				user_phone: value
			}));
			const requestOption ={
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'no-cache',
					'Accept': 'application/json',
					Authorization: `Bearer ${getAuthToken()}`,
				},
			};
			await axios.post("/api/auth/reservation/all/user",
				JSON.stringify(param), requestOption )
				.then(res =>{
					const resData = JSON.parse(JSON.stringify(res.data));
					axios.defaults.headers.common['Authorization'] = `Bearer ${getAuthToken()}`;
					this.setState({
						personalList : [
							...resData.data
						]
					})
				})
				.catch(ex=>{
					console.log("login requset fail : " + ex);
					// console.log(ex.response.status);
				})
				.finally(()=>{console.log("login request end")});
		}catch(e){
			console.log(e.response);
		}
	}

	getUserNameTicketApi = async (value) => {
		try{
			const param = JSON.parse(JSON.stringify({
				user_phone: value
			}));

			console.log(param);
			const requestOption ={
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'no-cache',
					'Accept': 'application/json',
					Authorization: `Bearer ${getAuthToken()}`,
				},
			};
			await axios.post("/api/auth/registration/byuser",
				JSON.stringify(param), requestOption )
				.then(res =>{
					const resData = JSON.parse(JSON.stringify(res.data));
					axios.defaults.headers.common['Authorization'] = `Bearer ${getAuthToken()}`;
					this.setState({
						ticketInfo : resData.data
					})
				})
				.catch(ex=>{
					console.log("login requset fail : " + ex);
					// console.log(ex.response.status);
				})
				.finally(()=>{console.log("login request end")});
		}catch(e){
			console.log(e.response);
		}
	}

	// 회원 일정 수정
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
			await axios.post("/api/auth/reservation/update",
				JSON.stringify(param), requestOption )
				.then(res =>{
					const resData = JSON.parse(JSON.stringify(res.data));
					axios.defaults.headers.common['Authorization'] = `Bearer ${getAuthToken()}`;
					window.location.reload();
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

// export default withParams(ManageDetail);
export default withRouter(ManageDetail);
