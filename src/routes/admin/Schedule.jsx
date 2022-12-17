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

class Schedule extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			personalType: 'member',
			modalOpen: false,
			selectCard: false,
			selectCardIndex: -1,
			trainerList: [
				{name: getAuthTrainerId(), isChecked: true, user_phone: '01011112222'},
			],
			memberList: [],
			originTaskList: [
				// {'date': '2022. 11. 21 09:00', 'name': '한예슬'},
			],
			taskList: [
				// {'date': '2022. 11. 21 09:00', 'name': '한예슬'},
			],
			addScheduleList: [],
			addSchedule: {
				name: null,
				date: dateFormatYYYYMMDD(new Date()),
				start_time: null,
				end_time: null,
				description: '',
				user_phone: null,
				usage_state: -1
			},
			selectMember: 'all',
			selectAllCheck: true,
			selectTrainerMember: 'all',
			selectTrainerAllCheck: false,
			menuOpen: false,
		};
	}

	openModal = () => {
		this.setState({
			modalOpen: true
		});
	};

	closeModal = () => {
		this.addUserReservationApi();

		this.setState({
			modalOpen: false,
		});
	};

	onAddSchedule = (e) => {
		this.openModal();
	}

	getUserPhone = (name) => {
		let phone = null;
		this.state.memberList.map((value, index) => {
			if(value.name === name) {
				phone = value.user_phone;
			}
		});

		return phone;
	}

	onInputChange = (e) => {
		var target = e.target;

		if(target.name === 'start_time') {
			const time = e.target.value;
			let now = new Date();
			let date = new Date(`${now.getFullYear()} ${now.getMonth()} ${now.getDate()} ${time}`);
			let endTime = `${date.getHours() < 10? `0${date.getHours() + 1}`: date.getHours() + 1}:${date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()}`;
			console.log(endTime);

			this.setState({
				addSchedule : {
					...this.state.addSchedule,
					[target.name]: target.value,
					end_time: endTime,
				}
			})
		} else if (target.name === 'name') {
			const phone = this.getUserPhone(target.value);
			this.setState({
				addSchedule : {
					...this.state.addSchedule,
					[target.name]: target.value,
					user_phone: phone,
				}
			})
		} else {
			this.setState({
				addSchedule : {
					...this.state.addSchedule,
					[target.name]: target.value,
				}
			})
		}
	}

	onCardReset = () => {
		this.setState({
			addSchedule: {
				name: '',
				date: dateFormatYYYYMMDD(new Date()),
				start_time: '',
				end_time: '',
				description: ''
			},
			selectCardIndex: -1,
			selectCard: false,
		})
	}

	onClickCard = (e, index) => {
		var data = this.state.addScheduleList[index];

		this.setState({
			selectCard: true,
			selectCardIndex: index,
			addSchedule: {
				name: data.name,
				date: data.date,
				start_time: data.start_time,
				end_time: data.end_time,
				description: data.description
			},
		})
	}

	onCopy = (e, index) => {
		var data = this.state.addScheduleList[index];
		var newSchedule = {
			name: data.name,
			date: data.date,
			start_time: data.start_time,
			end_time: data.end_time,
			description: data.description
		};

		this.setState({
			selectCardIndex: index + 1,
			selectCard: true,
			addScheduleList : [
				...this.state.addScheduleList,
				newSchedule
			],
			addSchedule: {
				name: data.name,
				date: data.date,
				start_time: data.start_time,
				end_time: data.end_time,
				description: data.description
			},
		})
	}

	onSubmit = () => {
		this.setState({
			addScheduleList: [
				...this.state.addScheduleList,
				this.state.addSchedule,
			],
		})
		this.onCardReset();
	}

	onModify = () => {
		var tempList = this.state.addScheduleList;
		tempList.splice(this.state.selectCardIndex, 1, this.state.addSchedule);

		this.setState({
			addScheduleList: [
				...tempList
			],
			selectCardIndex: -1,
			selectCard: false,
		})
		this.onCardReset();
	}

	onRemoveCard = (e, index) => {
		var tempList = this.state.addScheduleList;
		tempList.splice(index, 1);

		this.setState({
			addScheduleList : [
				...tempList
			],
			selectCard: false,
		})
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
				value.isChecked = true;
				return value;});

		this.setState({
			memberList : list
		})
	}

	setPersonalType(type) { // 현재 페이지 trainer? member? 체크
		this.setState({
			personalType: type,
		})
		this.makeCheckMemberList();
	}

	makeSendScheduleList = () => {
		this.state.addScheduleList.map((value, index) => {
				let startDate = new Date(`${value.date} ${value.start_time}`);
				let endDate= new Date(`${value.date} ${value.end_time}`);
				value.start_time = dateFormatWithTime(startDate);
				value.end_time = dateFormatWithTime(endDate);
				value.user_phone = this.getUserPhone(value.name);
				value.usage_state = '-1';
				delete value.date;
				delete value.name;
			}
		)
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
		const path = this.props.location.pathname.substring(10);
		this.setPersonalType(path);

		this.unlisten = this.props.history.listen((location, action) => {
			const path = location.pathname.substring(10);
			this.setPersonalType(path);

		});

		this.getTrainerUserAllApi();
	}

	render() {
		const {modalOpen, personalType, addScheduleList, memberList, trainerList, selectAllCheck, selectCard, addSchedule, selectCardIndex, menuOpen, selectMember, selectTrainerAllCheck} = this.state;
		const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];

		if(!getAuthToken()) {
			return <Redirect to="/login" />;
		}
		return (
			<div className={classNames('schedule_wrap')}>
				<div className={'notify_area'}>
					<h2>스케줄 관리</h2>
				</div>

				<div className={'section'}>
					<div className={'tab_area'}>
						<div className={'tab'}>
							<strong className={'text'}>{personalType === 'member' ? '내 회원' : '트레이너'}</strong>
							<div className={'menu_area'}>
								<button className={classNames('btn_menu', {'open': menuOpen})} onClick={this.onMenuOpen}><Icon.ic20BulletArrow/></button>
								<div className={'ly_menu'}>
									<NavLink to={'/schedule/trainer'} activeClassName={'active'} className={'menu'} onClick={this.onMenuOpen} >트레이너</NavLink>
									<NavLink to={'/schedule/member'} activeClassName={'active'} className={'menu'} onClick={this.onMenuOpen}>내 회원</NavLink>
								</div>
							</div>
						</div>
						<div className={'list_area'}>
							<div className={'person_list'}>
								{personalType === 'member' ?
									<>
										<li className={'item'}>
											<input
												type="checkbox"
												onClick={this.handleAllChecked}
												value="checkedall"
												checked={selectAllCheck}
												className={'input_check'}
												id={'checkedall'}
											/>
											<label htmlFor="checkedall" className={'input_label'}>전체 보기</label>
										</li>
										{memberList.map((value, index) => {
											return <CheckBox
												handleCheckChildElement={this.handleCheckChildElement}
												{...value}
											/>
										})}
									</> :
									<>
										<li className={'item'}>
											<input
												type="checkbox"
												onClick={this.handleAllChecked}
												value="checkedall"
												checked={selectTrainerAllCheck}
												className={'input_check'}
												id={'check_all'}
											/>
											<label htmlFor="check_all" className={'input_label'}>전체 보기</label>
										</li>
										{trainerList.map((value, index) => {
											return <CheckBox
												handleCheckChildElement={this.handleCheckChildElement}
												{...value}
											/>
										})}
									</>
								}
							</div>
						</div>
					</div>

					<div className={'calender_wrap'}>
						{personalType === 'member' && <button type={'button'} className={'btn_add'} onClick={(e) => this.onAddSchedule(e)}><Icon.ic16AddSchedule/>일정 추가</button>}
						<CalenderWeekday selectMember={selectMember}/>
					</div>
				</div>

				<Modal open={modalOpen} close={this.closeModal} header="일정 추가하기" submit={`일정 ${addScheduleList.length}개 추가하기`}>
					<div className={'schedule_add_area'}>
						<div className={'plus_area'}>
							<button type={'button'} className={'btn_plus'} onClick={this.onCardReset}><Icon.ic24Plus/></button>
							<ul className={'plus_list'}>
								{addScheduleList.map((value, index) =>
									<li className={classNames('item', {selected: index === selectCardIndex? true : false})} key={uuid()}>
										<div className={'inner'} onClick={(e) => this.onClickCard(e, index)}>
											<div className={'name'}>{value.name}</div>
											<div className={'text'}>{value.date} {WEEKDAY[new Date(value.date).getDay()]} </div>
											<div className={'text'}>
												{value.start_time}~{value.end_time}
											</div>
										</div>
										<button type={'button'} className={'btn_delete'} onClick={(e) => this.onRemoveCard(e, index)}><Icon.ic14Close/></button>
										<button type={'button'} className={'btn_copy'} onClick={(e) => this.onCopy(e, index)}><Icon.ic14Copy/></button>
									</li>
								)}
							</ul>
						</div>
						<div className={'plus_input_area'}>
							<label htmlFor="plus_date">날짜</label> <input type="date" id={'plus_date'} onChange={(e) =>this.onInputChange(e)} className={'input'} name={'date'} value={addSchedule.date || ''}/>
						</div>
						<div className={'plus_input_area'}>
							<label htmlFor="plus_start_time">시간</label>
							<input type="time" id={'plus_start_time'} className={'input'} onChange={(e) =>this.onInputChange(e)} name={'start_time'} value={addSchedule.start_time || ''}/>
							<span className={'dash'}>-</span>
							<input type="time" id={'plus_end_time'} className={'input'} onChange={(e) =>this.onInputChange(e)} name={'end_time'} value={addSchedule.end_time || ''}/>
						</div>
						<div className={'plus_input_area'}>
							<label htmlFor="plus_member">회원</label>
							{/*<input type="text" id={'plus_member'} className={'input'} onChange={(e) =>this.onInputChange(e)} name={'name'} value={addSchedule.name || ''}/>*/}
							<select name="" id="plus_member" className={'input'} value={addSchedule.name || '회원선택'} name={'name'} onChange={(e) =>this.onInputChange(e)}>
								<option disabled>회원선택</option>
								{memberList.map((value, index) =>
									<option className={'item'} key={uuid()} value={value.name} >
										{value.name}
									</option>
								)}
							</select>
						</div>
						<div className={'plus_input_area'}>
							<label htmlFor="plus_description">설명</label> <textarea id={'plus_description'} className={'input'} rows={'4'} onChange={(e) =>this.onInputChange(e)} name={'description'} value={addSchedule.description || ''}/>
						</div>
						{selectCard ?
							<button className={'btn_add'} type={'button'} onClick={this.onModify}>수정하기</button>
							: <button className={'btn_add'} type={'button'} onClick={this.onSubmit}>등록하기</button>
						}
					</div>
				</Modal>

			</div>
		);
	}

	getTrainerUserAllApi = async () => {
		try{
			const requestOption ={
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'no-cache',
					'Accept': 'application/json',
					Authorization: `Bearer ${getAuthToken()}`,
				},
			};
			const result = await axios.get("http://13.125.53.84:8080/api/auth/trainer/userall", requestOption )
				.then(res =>{
					const resData = JSON.parse(JSON.stringify(res.data));
					axios.defaults.headers.common['Authorization'] = `Bearer ${getAuthToken()}`;
					this.setState({
						memberList : [
							...resData.data
						]
					});
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

	addUserReservationApi = async () => {
		try{
			this.makeSendScheduleList();
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
					window.location.reload('/schedule/member');
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

export default withRouter(Schedule);
// export default withParams(Schedule);
// export default Schedule;