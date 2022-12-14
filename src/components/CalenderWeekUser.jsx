import React from 'react';
import $ from "jquery";
import axios from "axios";
import TimePicker from 'rc-time-picker';
import moment from "moment";
import 'rc-time-picker/assets/index.css';
import classNames from 'classnames';

import {Icon} from "../asset/js/icon";
import {DayPilot, DayPilotCalendar, DayPilotNavigator} from "@daypilot/daypilot-lite-react";
import {getAuthToken, getAuthTrainerId} from '../Util/Authentication';
import {Palette} from '../Util/Palette';
import {
	dateFormatResetWithTime,
	dateFormatReset,
	dateFormatGetTime,
	dateFormatWithTime,
	dateFormatYYYYMMDD,
	dateFormatGetMMDD
} from '../Util/DateFormat';
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
				cellHeight: '16',
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
					// console.log(args);
					this.props.onAddSchedule('', args);
					// this.calendar.message("Selected range: " + args.start.toString("hh:mm tt") + " - " + args.end.toString("hh:mm tt"));
				},
				afterRender : args => {
					// console.log(args);
				},
				onEventMove : args => {
					var start = dateFormatGetTime(args.newStart.value),
						end =  dateFormatGetTime(args.newEnd.value);
					if(!window.confirm(`${dateFormatGetMMDD(args.newStart.value, '.', 'day')} ${start} ??? ????????? ?????? ???????????????????`)) {
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
					// console.log(args.e).
					this.setUserReservationUpdateApi(args.e.data, start, end);
				},
				// onEventResize : args => {
				// 	if(!window.confirm("????????? ?????? ???????????????????")) {
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

	onPressArrowLeft = () => { // ?????? ??????
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

	onPressArrowRight = () => { // ?????? ?????????
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

	onToday = () => {
		const today = new Date(dateFormatResetWithTime(new Date()));
		const day = today.getDay();
		const startDate = new Date(today.getTime() +  (-day) * 24 * 60 * 60 * 1000),
			endDate = new Date(today.getTime() +  (7 - day - 1) * 24 * 60 * 60 * 1000);

		this.setState({
			calenderOption: {
				...this.state.calenderOption,
				startDate: today
			},
			periodStartDate: startDate,
			periodEndDate: endDate,
		})
	}

	setChangeHeader = () => { // ?????? header ?????????
		const WEEKDAY = ['???', '???', '???', '???', '???', '???', '???'];
		$('.calendar_default_colheader_inner').each(function (index, item) {
			const text = $(item).text();
			const date = new Date(dateFormatResetWithTime(text));
			let today = new Date();
			today = new Date(dateFormatResetWithTime(today));
			let checkToday = date.getTime() === today.getTime() ? true: false;

			let changeText = `<span class='day ${ checkToday? 'today': ''}'>${WEEKDAY[index]}</span> <strong class='num ${ checkToday? 'today': ''}'>${text.split('-')[2]}</strong>`;
			$(item).html(changeText);
		});
	}

	setInitPeriod() { // ?????? ?????? ????????????, ??????????????? ??????
		const endDate = new Date(this.calendar.visibleEnd().value);
		this.setState({
			periodStartDate: this.calendar.visibleStart(),
			periodEndDate: new Date(endDate.setDate(endDate.getDate() - 1)),
		});
	}

	makeTaskList = (dataList) => { // ?????? ?????? ?????? -> ????????? event??? ????????? ?????????
		const eventList = dataList.map((value, index) => {
				value.id = value.reservation.reservation_id;
				value.text = `${value.user.name}
				 			(${dateFormatGetTime(value.reservation.start_time)}~${dateFormatGetTime(value.reservation.end_time)})`;
				value.start = value.reservation.start_time;
				value.end = value.reservation.end_time;
				value.backColor = this.props.paletteList[value.user.userPhone];

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
		this.getUserNameReservationApi(value);
	}

	onRefreshCalender = () => {
		window.location.reload(false);
		// this.calendar.Scheduler.update();
		// console.log(this.calendar.events.find('4'))
		// console.log(this.calendarRef.current.updater.enqueueForceUpdate());
	}

	onTimePickerChange = (value, type) => {
		let now = new Date(value);
		let date = new Date(`${now.getFullYear()} ${now.getMonth()} ${now.getDate()} ${dateFormatGetTime(value)}`);
		var endTime = `${date.getHours() + 1 < 10? `0${date.getHours() + 1}`: date.getHours() + 1}:${date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()}`;

		if(type === 'start_time') {
			this.setState({
				addSchedule : {
					...this.state.addSchedule,
					[type]: dateFormatGetTime(now),
					end_time: endTime,
				}
			})
		} else {
			console.log(dateFormatGetTime(now));
			this.setState({
				addSchedule : {
					...this.state.addSchedule,
					[type]: dateFormatGetTime(now),
				}
			})
		}
	}

	onInputChange = (e) => {
		var target = e.target;
		console.log(target);

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
	}

	onDelete = (e, reservation) => {
		if(window.confirm("????????? ?????? ???????????????????")) {
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
		this.getUserNameReservationApi(this.props.selectMember);
	}

	render() {
		const {modifyModalOpen, addSchedule} = this.state;
		return (
			<div className={'calender_weekday_wrap'}>
				<div className={'period_header'}>
					<button className={'btn_prev'} onClick={this.onPressArrowLeft}><Icon.ic20BulletArrow/></button>
					<strong className={'period'}>{dateFormatReset(new Date(this.state.periodStartDate), '.')}~{dateFormatReset(new Date(this.state.periodEndDate), '.', 'day')}</strong>
					<button className={'btn_next'} onClick={this.onPressArrowRight}><Icon.ic20BulletArrow/></button>
					<button className={'btn_today'} onClick={this.onToday}>??????</button>
				</div>

				<DayPilotCalendar
					{...this.state.calenderOption}
					ref={this.calendarRef}
				/>

				<Modal open={modifyModalOpen} close={this.closeModifyModal} header="?????? ????????????" hasFooter={false}>
					<div className={'schedule_add_area'}>
						<div className={'plus_input_area'}>
							<label htmlFor="plus_date">??????</label> <input type="date" id={'plus_date'} onChange={(e) =>this.onInputChange(e)} className={'input'} name={'date'} value={addSchedule.date || ''}/>
						</div>
						<div className={'plus_input_area'}>
							<label htmlFor="plus_start_time">??????</label>
							<TimePicker className={classNames('input', 'time')} popupClassName={'time_select_layer'} minuteStep={30} showSecond={false} onChange={(e) => this.onTimePickerChange(e, 'start_time')} format={'HH:mm'} use12Hours value={moment(`${addSchedule.date} ${addSchedule.start_time}`, 'YYYY-MM-DD HH:mm')} />
							{/*<input type="time" id={'plus_start_time'} className={'input'} onChange={(e) =>this.onInputChange(e)} name={'start_time'} value={addSchedule.start_time || ''}/>*/}
							<span className={'dash'}>-</span>
							<TimePicker className={classNames('input', 'time')}  popupClassName={'time_select_layer'} minuteStep={30} showSecond={false} onChange={(e) => this.onTimePickerChange(e, 'end_time')} format={'HH:mm'} use12Hours value={moment(`${addSchedule.date} ${addSchedule.end_time}`, 'YYYY-MM-DD HH:mm')} />
							{/*<input type="time" id={'plus_end_time'} className={'input'} onChange={(e) =>this.onInputChange(e)} name={'end_time'} value={addSchedule.end_time || ''}/>*/}
						</div>
						<div className={'plus_input_area'}>
							<label htmlFor="plus_member">??????</label>
							{/*<input type="text" id={'plus_member'} className={'input'} onChange={(e) =>this.onInputChange(e)} name={'name'} value={addSchedule.name || ''}/>*/}
							<select name="" id="plus_member" className={'input'} value={addSchedule.name || '????????????'} name={'name'} disabled={true} >
								<option>{addSchedule.name}</option>
							</select>
						</div>
						<div className={'plus_input_area'}>
							<label htmlFor="plus_description">??????</label>
							<textarea id={'plus_description'} className={classNames('input', 'textarea')} rows={'4'} onChange={(e) =>this.onInputChange(e)} name={'description'} value={addSchedule.description || ''}/>
						</div>
						<div className={'sub_footer'}>
							<button className={'btn_default'} type={'button'} onClick={(e) => this.onDelete(e, addSchedule.reservation)}>????????????</button>
							<button className={'btn_point'} type={'button'} onClick={this.onSubmit} >????????????</button>
						</div>
					</div>
				</Modal>
			</div>
		);
	}

	// ?????? ????????? ??????
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

	// ?????? ?????? ??????
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

	// ????????? ?????? ??????
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
}

export default CalendarWeekday;