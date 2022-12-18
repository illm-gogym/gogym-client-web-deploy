import React from "react";
import classNames from 'classnames';
import {NavLink, withRouter, Link, Redirect} from "react-router-dom";
import axios from "axios";
import uuid from 'react-uuid';

import Navigation from "../../components/Navigation";
import {Icon} from "../../asset/js/icon";
import {dateFormatYYYYMMDD, dateFormatWithTime, dateFormatGetMMDD} from '../../Util/DateFormat';
import Modal from "../../components/Modal";
import {CheckBox} from "../../components/CheckBox";
import CalenderWeekday from "../../components/CalenderWeekday";
import {getAuthToken, getAuthTrainerId} from "../../Util/Authentication";

class ScheduleTrainer extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			memberList: [
				// {name: getAuthTrainerId(), isChecked: true, user_phone: '01011112222'},
			],
			taskList: [
				// {'date': '2022. 11. 21 09:00', 'name': '한예슬'},
			],
			selectMember: 'all',
			selectAllCheck: false,
		};
	}

	handleAllChecked = event => { // 체크박스 전체제어
		let memberList = this.state.memberList;
		memberList.forEach(members => (members.isChecked = event.target.checked));
		this.setState({
			selectAllCheck: !this.state.selectAllCheck,
			memberList: memberList
		});

		if(event.target.checked) {
			this.setState({
				selectMember: false,
			});
		} else {
			this.setState({
				selectMember: 'none',
			});
		}
	};

	handleCheckChildElement = (event, value) => { // 체크박스 개별제어
		let memberList = this.state.memberList;
		memberList.forEach(members => {
			if (members.user_phone === value)
				members.isChecked = event.target.checked;
		});
		this.setState({
			memberList: memberList,
			selectAllCheck: false,
		});

		if(event.target.checked) {
			this.onSelectMember(value);
		} else {

		}
	};

	onSelectMember = (value) => {
		let memberList = this.state.memberList;
		memberList.forEach(members => {
			if (members.user_phone === value)
				members.isChecked = true;
			else
				members.isChecked = false;
		});
		this.setState({
			selectMember: value,
			memberList: memberList,
			selectAllCheck: false,
		});
	}

	makeCheckMemberList = () => { // checkbox 컴포넌트 제어 isChecked 추가
		const list = this.state.memberList.map((value, index) => {
			value.isChecked = value.trainer_id === getAuthTrainerId() ? true : false;
			return value;});

		this.setState({
			memberList : list
		})
	}


	onMenuOpen = () => {
		this.setState({
			menuOpen: !this.state.menuOpen
		})
	}

	componentDidUpdate(prevProps, prevState) {
		if(this.state.memberList.length !== prevState.memberList.length) {
			this.makeCheckMemberList();
		}
	}

	componentDidMount() {
		this.getTrainerListApi();
	}

	render() {
		const {modalOpen, personalType, addScheduleList, memberList, trainerList, selectAllCheck, selectCard, addSchedule, selectCardIndex, menuOpen, selectMember, selectTrainerAllCheck} = this.state;
		const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];

		if(!getAuthToken()) {
			return <Redirect to="/login/admin" />;
		}
		return (
			<div className={classNames('schedule_wrap')}>
				<div className={'notify_area'}>
					<h2>스케줄 관리</h2>
				</div>

				<div className={'section'}>
					<div className={'tab_area'}>
						<div className={'tab'}>
							<strong className={'text'}>트레이너</strong>
							<div className={'menu_area'}>
								<button className={classNames('btn_menu', {'open': menuOpen})} onClick={this.onMenuOpen}><Icon.ic20BulletArrow/></button>
								<div className={'ly_menu'}>
									<NavLink to={'/schedule/member'} activeClassName={'active'} className={'menu'} onClick={this.onMenuOpen}>내 회원</NavLink>
									<NavLink to={'/schedule/trainer'} activeClassName={'active'} className={'menu'} onClick={this.onMenuOpen} >트레이너</NavLink>
								</div>
							</div>
						</div>
						<div className={'list_area'}>
							<div className={'person_list'}>
								<li className={'item'}>
									<input
										type="checkbox"
										onClick={this.handleAllChecked}
										value="checkedall"
										defaultChecked={selectAllCheck}
										className={'input_check'}
										id={'checkedall'}
									/>
									<label htmlFor="checkedall" className={'input_label'}>전체 보기</label>
								</li>
								{memberList.map((value, index) => {
									return <CheckBox
										handleCheckChildElement={this.handleCheckChildElement}
										{...value}
										key={uuid()}
									/>
								})}
							</div>
						</div>
					</div>

					<div className={'calender_wrap'}>
						 <button type={'button'} className={'btn_add'} onClick={(e) => this.onAddSchedule(e)}><Icon.ic16AddSchedule/>일정 추가</button>
						<CalenderWeekday selectMember={selectMember}/>
					</div>
				</div>
			</div>
		);
	}

	getTrainerListApi = async () => {
		try{
			const requestOption ={
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'no-cache',
					'Accept': 'application/json',
					Authorization: `Bearer ${getAuthToken()}`,
				},
			};
			const result = await axios.get("http://13.125.53.84:8080/api/auth/trainer/all", requestOption )
				.then(res =>{
					const resData = JSON.parse(JSON.stringify(res.data));
					axios.defaults.headers.common['Authorization'] = `Bearer ${getAuthToken()}`;
					this.setState({
						memberList : [
							...resData.data
						]
					});
					console.log(resData.data);
				})
				.catch(ex=>{
					console.log("login requset fail : " + ex);
				})
				.finally(()=>{console.log("login request end")});
			return result;
		}catch(e){
			console.log(e);
		}
	}

	getOtherTrainerReservationApi = async () => {
		try{
			const obj = { reservations : this.state.addScheduleList };
			const scheduleList = JSON.parse(JSON.stringify(obj));
			console.log(scheduleList);
			const requestOption ={
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'no-cache',
					'Accept': 'application/json',
					Authorization: `Bearer ${getAuthToken()}`,
				}
			};
			await axios.post("http://13.125.53.84:8080/api/auth/reservation/add" ,
				JSON.stringify(scheduleList), requestOption )
				.then(res =>{
					const resData = JSON.parse(JSON.stringify(res.data));
					axios.defaults.headers.common['Authorization'] = `Bearer ${getAuthToken()}`;
					// console.log(resData);
				})
				.catch(ex=>{
					console.log("login requset fail : " + ex);
				})
				.finally(()=>{console.log("login request end")});
		}catch(e){
			console.log(e);
		}
	}
};

export default withRouter(ScheduleTrainer);
// export default withParams(Schedule);
// export default Schedule;
