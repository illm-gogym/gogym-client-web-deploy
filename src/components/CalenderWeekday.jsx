import React from 'react';
import $ from "jquery";
import {Icon} from "../asset/js/icon";
import {DayPilot, DayPilotCalendar, DayPilotNavigator} from "@daypilot/daypilot-lite-react";
import {getAuthToken, getAuthTrainerId} from '../Util/Authentication';
import {
	dateFormatResetWithTime,
	dateFormatReset,
	dateFormatGetTime,
	dateFormatWithTime,
	dateFormatYYYYMMDD
} from '../Util/DateFormat';
import axios from "axios";
import uuid from "react-uuid";
import Modal from "./Modal";

class CalendarWeekday extends React.Component {

	constructor(props) {
		super(props);
		this.calendarRef = React.createRef();
		this.state = {
			calenderOption: {
				viewType: "Week",
				headerDateFormat: `yyyy-MM-d`, //dddd_d
				headerHeight: '60',
				durationBarVisible: false,
				cellHeight: '20',
				startDate: this.makeNewDate(new Date()),
				events: [
					// {
					// 	id: 1,
					// 	text: "Event 1",
					// 	start: "2022-12-07T10:30:00",
					// 	end: "2022-12-07T11:30:00",
					//  backColor: "#6aa84f"
					// }
				],
				onBeforeEventRender: args => {
					// console.log(args.data);
					args.data.html = `
						<div class="name">${args.data.user.name}</div>
						<div class="time">${dateFormatGetTime(args.data.reservation.start_time)}~${dateFormatGetTime(args.data.reservation.end_time)}</div>
					`;
					// args.data.backColor = "#93c47d";
					// args.data.fontColor = "white";
					// args.data.html= `<div>ttt</div>`
				},
				onTimeRangeSelected : args => {
					// this.calendar.message("Selected range: " + args.start.toString("hh:mm tt") + " - " + args.end.toString("hh:mm tt"));
					// console.log(args.start);
					// console.log(args.end);
				},
				afterRender : args => {
					// console.log(args);
				},
				onEventMove : args => {
					if(!window.confirm("일정을 변경 하시겠습니까?")) {
						args.preventDefault();
					}
				},
				onEventMoved : args => {
					this.setChangeHeader();
					var start = args.newStart.value,
						end = args.newEnd.value;
					// console.log(start);
					// console.log(end);

					// console.log(args.e.id());
					// console.log(args.e)
					this.setUserReservationUpdateApi(args.e.data, start, end);
				},
				// onEventResize : args => {
				// 	if(!window.confirm("일정을 변경 하시겠습니까?")) {
				// 		args.preventDefault();
				// 	}
				// },
				// onEventResized :  args => {
				// 	this.setChangeHeader();
				// 	var start = args.newStart.value,
				// 		end = args.newEnd.value;
				// 	console.log(start);
				// 	console.log(end);
				// },
				onEventResize : args => {
					args.preventDefault();
				},
				onEventClicked : args => {
					const data = args.e.data;
					const start = data.start.value,
						end = data.end.value;
					this.onModifySchedule(data, start, end);
				}
			},
			periodStartDate: new Date(),
			periodEndDate: new Date(),
			scheduleList: [],
			modifyModalOpen: false,
			addSchedule: {
				name: '',
				date: dateFormatYYYYMMDD(new Date()),
				start_time: '',
				end_time: '',
				description: '',
				user_phone: '',
				usage_state: -1
			},
		};
	}

	makeNewDate = (now) => {
		return new Date(now.getFullYear(), now.getMonth(), now.getDate())
	}

	get calendar() {
		return this.calendarRef.current.control;
	}

	onPressArrowLeft = () => { // 달력 전주
		const date = this.state.calenderOption.startDate,
		newDate = new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000);
		this.setState({
			calenderOption: {
				...this.state.calenderOption,
				startDate: newDate
			},
			periodStartDate: new Date(this.state.periodStartDate.getTime() - 7 * 24 * 60 * 60 * 1000),
			periodEndDate: new Date(this.state.periodEndDate.getTime() - 7 * 24 * 60 * 60 * 1000),
		})
	}

	onPressArrowRight = () => { // 달력 다음주
		const date = this.state.calenderOption.startDate,
			newDate = new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000);
		this.setState({
			calenderOption: {
				...this.state.calenderOption,
				startDate: newDate
			},
			periodStartDate: new Date(this.state.periodStartDate.getTime() + 7 * 24 * 60 * 60 * 1000),
			periodEndDate: new Date(this.state.periodEndDate.getTime() + 7 * 24 * 60 * 60 * 1000),
		})
	}

	setChangeHeader = () => { // 달력 header 커스텀
		const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];
		$('.calendar_default_colheader_inner').each(function (index, item) {
			const text = $(item).text();
			const date = new Date(text);
			let today = new Date();
			today = new Date(dateFormatResetWithTime(today));
			let checkToday = date.getTime() === today.getTime() ? true: false;

			let changeText = `<span class='day ${ checkToday? 'today': ''}'>${WEEKDAY[index]}</span> <strong class='num ${ checkToday? 'today': ''}'>${text.split('-')[2]}</strong>`;
			$(item).html(changeText);
		});
	}

	setInitPeriod() { // 달력 노출 시작날짜, 마지막날짜 저장
		const endDate = new Date(this.calendar.visibleEnd().value);
		this.setState({
			periodStartDate: this.calendar.visibleStart(),
			periodEndDate: new Date(endDate.setDate(endDate.getDate() - 1)),
		});
	}

	makeTaskList = (dataList) => { // 일정 목록 배열 -> 캘린더 event용 배열로 커스텀
		const eventList = dataList.map((value, index) => {
				value.id = value.reservation.reservation_id;
				value.text = `${value.user.name}
				 			(${dateFormatGetTime(value.reservation.start_time)}~${dateFormatGetTime(value.reservation.end_time)})`;
				value.start = value.reservation.start_time;
				value.end = value.reservation.end_time;
				// delete value.reservation;
				// delete value.user;
				return value;
			}
		)
		this.setState({
			calenderOption: {
				...this.state.calenderOption,
				events: eventList
			}
		});
	}

	setChangeReservation = (value) => {
		if(this.props.role !== 'admin') {
			this.getUserNameReservationApi(value);
		}  else {
			this.getTrainerReservationApi(value);
		}
	}

	onRefreshCalender = () => {
		window.location.reload(false);
		// this.calendar.Scheduler.update();
		// console.log(this.calendar.events.find('4'))
		// console.log(this.calendarRef.current.updater.enqueueForceUpdate());
	}

	onInputChange = (e) => {
		var target = e.target;

		if(target.name === 'start_time') {
			const time = e.target.value;
			let now = new Date();
			let date = new Date(`${now.getFullYear()} ${now.getMonth()} ${now.getDate()} ${time}`);
			let endTime = `${date.getHours() + 1 < 10? `0${date.getHours() + 1}`: date.getHours() + 1}:${date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()}`;


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

	openModifyModal = () => {
		this.setState({
			modifyModalOpen: true,
		});
	};

	closeModifyModal = () => {
		this.setState({
			modifyModalOpen: false,
		});
	};

	onModifySchedule = (value, start, end) => {
		this.setState({
			addSchedule: {
				name: value.user.name,
				date: dateFormatYYYYMMDD(value.start),
				start_time: dateFormatGetTime(start),
				end_time: dateFormatGetTime(end),
				description: value.reservation.description,
				user_phone: value.reservation.user_phone,
				usage_state:  value.reservation.usage_state,
				reservation: value.reservation,
			},
		});
		this.openModifyModal();
	}

	onSubmit = () => {
		const start = dateFormatWithTime(new Date(`${this.state.addSchedule.date} ${this.state.addSchedule.start_time}`)),
			end = dateFormatWithTime(new Date(`${this.state.addSchedule.date} ${this.state.addSchedule.end_time}`));
		this.setUserReservationUpdateApi(this.state.addSchedule, start, end);

		// window.location.reload();
		// this.calendar.update(this.state.scheduleList);
		// window.location.replace('/schedule/member');
	}

	onDelete = (e, reservation) => {
		if(window.confirm("일정을 삭제 하시겠습니까?")) {
			this.setUserReservationDeleteApi(reservation.reservation_id);
		} else {
			// this.closeModifyModal();
		}
	}

	componentDidUpdate(prevProps, prevState) {
		this.setChangeHeader();

		if(this.props.selectMember !== prevProps.selectMember && this.props.selectMember.length !== prevProps.selectMember.length) {
			this.setChangeReservation(this.props.selectMember);
		} else if(this.props.selectMember !== prevProps.selectMember && this.props.selectMember === 'none') {
			//
		}
	}

	componentDidMount() {
		this.setChangeHeader();
		this.setInitPeriod();

		if(this.props.role !== 'admin')
			this.getUserNameReservationApi(this.props.selectMember);
		else {
			this.getTrainerReservationApi(this.props.selectMember);
		}

	}

	render() {
		const {modifyModalOpen, addSchedule} = this.state;
		return (
			<div className={'calender_weekday_wrap'}>
				<div className={'period_header'}>
					<button className={'btn_prev'} onClick={this.onPressArrowLeft}><Icon.ic20BulletArrow/></button>
					<strong className={'period'}>{dateFormatReset(new Date(this.state.periodStartDate), '.')}~{dateFormatReset(new Date(this.state.periodEndDate), '.', 'day')}</strong>
					<button className={'btn_next'} onClick={this.onPressArrowRight}><Icon.ic20BulletArrow/></button>
				</div>
				<DayPilotCalendar
					{...this.state.calenderOption}
					ref={this.calendarRef}
				/>

				<Modal open={modifyModalOpen} close={this.closeModifyModal} header="일정 수정하기" hasFooter={false}>
					<div className={'schedule_add_area'}>
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
							<select name="" id="plus_member" className={'input'} value={addSchedule.name || '회원선택'} name={'name'} disabled={true} >
								<option>{addSchedule.name}</option>
							</select>
						</div>
						<div className={'plus_input_area'}>
							<label htmlFor="plus_description">설명</label> <textarea id={'plus_description'} className={'input'} rows={'4'} onChange={(e) =>this.onInputChange(e)} name={'description'} value={addSchedule.description || ''}/>
						</div>
						<div className={'sub_footer'}>
							<button className={'btn_default'} type={'button'} onClick={(e) => this.onDelete(e, addSchedule.reservation)}>삭제하기</button>
							<button className={'btn_point'} type={'button'} onClick={this.onSubmit} >수정하기</button>
						</div>
					</div>
				</Modal>
			</div>
		);
	}

	// 특정 사용자 일정
	getUserNameReservationApi = async (value) => {
		try{
			const param = JSON.parse(JSON.stringify({
				user_phone: value
			}));
			// console.log(param);
			const requestOption ={
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'no-cache',
					'Accept': 'application/json',
					Authorization: `Bearer ${getAuthToken()}`,
				},
			};
			await axios.post("http://13.125.53.84:8080/api/auth/reservation/all/user",
				JSON.stringify(param), requestOption )
				.then(res =>{
					const resData = JSON.parse(JSON.stringify(res.data));
					axios.defaults.headers.common['Authorization'] = `Bearer ${getAuthToken()}`;
					this.makeTaskList(resData.data);
					// console.log(resData);
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
			await axios.post("http://13.125.53.84:8080/api/auth/reservation/update",
				JSON.stringify(param), requestOption )
				.then(res =>{
					const resData = JSON.parse(JSON.stringify(res.data));
					axios.defaults.headers.common['Authorization'] = `Bearer ${getAuthToken()}`;
					this.onRefreshCalender();
				})
				.catch(ex=>{
					console.log("login requset fail : " + ex);
				})
				.finally(()=>{console.log("login request end")});
		}catch(e){
			console.log(e.response);
		}
	}

	// 사용자 일정 삭제
	setUserReservationDeleteApi = async (value) => {
		const param = JSON.parse(JSON.stringify({
			reservation_id: value
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
			await axios.post(`http://13.125.53.84:8080/api/auth/reservation/delete/${value}`, {},
				requestOption )
				.then(res =>{
					const resData = JSON.parse(JSON.stringify(res.data));
					axios.defaults.headers.common['Authorization'] = `Bearer ${getAuthToken()}`;
					this.onRefreshCalender();
				})
				.catch(ex=>{
					console.log("login requset fail : " + ex);
				})
				.finally(()=>{console.log("login request end")});
		}catch(e){
			console.log(e.response);
		}
	}

	// 특정 트레이너 일정
	getTrainerReservationApi = async (value) => {
		try{
			const param = JSON.parse(JSON.stringify({
				trainer_id: value,
				start_time: dateFormatResetWithTime(this.state.periodStartDate),
				end_time: dateFormatResetWithTime(this.state.periodEndDate),
			}));
			// console.log(param);
			const requestOption ={
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'no-cache',
					'Accept': 'application/json',
					Authorization: `Bearer ${getAuthToken()}`,
				},
			};
			await axios.post("http://13.125.53.84:8080/api/auth/reservation/all/trainertime",
				JSON.stringify(param), requestOption )
				.then(res =>{
					const resData = JSON.parse(JSON.stringify(res.data));
					axios.defaults.headers.common['Authorization'] = `Bearer ${getAuthToken()}`;
					this.setState({
						scheduleList: resData.data,
					})
					this.makeTaskList(resData.data);
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
}

export default CalendarWeekday;