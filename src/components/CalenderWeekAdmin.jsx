import React from 'react';
import $ from "jquery";
import axios from "axios";

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

class CalendarWeekAdmin extends React.Component {
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
				],
				onBeforeEventRender: args => {
					args.data.html = `
						<div class="name">${args.data.user.name}</div>
						<div class="time">${dateFormatGetTime(args.data.reservation.start_time)}~${dateFormatGetTime(args.data.reservation.end_time)}</div>
					`;
				},
				onTimeRangeSelected : args => {
					args.preventDefault();
				},
				afterRender : args => {
					// console.log(args);
				},
				onEventMove : args => {
					args.preventDefault();
				},
				onEventResize : args => {
					args.preventDefault();
				},
				onEventClicked : args => {
					args.preventDefault();
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
		// now.setDate(now.getDate() + 1);
		// now.getTime() - (1 * 24 * 60 * 60 * 1000);
		console.log(now.getDay())
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

	setChangeHeader = () => { // 달력 header 커스텀
		const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];
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

	setInitPeriod() { // 달력 노출 시작날짜, 마지막날짜 저장
		// const today = new Date();
		// const numDay = today.getDay();
		//
		// this.setState({
		// 	periodStartDate: new Date(dateFormatYYYYMMDD(today.getTime() - 24 * 60 * 60 * 1000 * (numDay))),
		// 	periodEndDate: new Date(dateFormatYYYYMMDD(today.getTime() + 24 * 60 * 60 * 1000 * ( 6 - numDay))),
		// });

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
				value.backColor = this.props.paletteList[value.reservation.trainer_id];

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
		this.getTrainerReservationApi(value);
	}

	componentDidUpdate(prevProps, prevState) {
		this.setChangeHeader();

		if(this.props.selectMember !== prevProps.selectMember && this.props.selectMember.length !== prevProps.selectMember.length) {
			this.setChangeReservation(this.props.selectMember);
		}

		if(this.state.periodStartDate !== prevState.periodStartDate && this.state.periodEndDate !== prevState.periodEndDate) {
			this.setChangeReservation(this.props.selectMember);
		}
	}

	componentDidMount() {
		this.setChangeHeader();
		this.setInitPeriod();
		this.getTrainerReservationApi(this.props.selectMember);
	}

	render() {
		// const {modifyModalOpen, addSchedule} = this.state;
		return (
			<div className={'calender_weekday_wrap'}>
				<div className={'period_header'}>
					<button className={'btn_prev'} onClick={this.onPressArrowLeft}><Icon.ic20BulletArrow/></button>
					<strong className={'period'}>{dateFormatReset(new Date(this.state.periodStartDate), '.')}~{dateFormatReset(new Date(this.state.periodEndDate), '.', 'day')}</strong>
					<button className={'btn_next'} onClick={this.onPressArrowRight}><Icon.ic20BulletArrow/></button>
					<button className={'btn_today'} onClick={this.onToday}>오늘</button>
				</div>
				<DayPilotCalendar
					{...this.state.calenderOption}
					ref={this.calendarRef}
				/>
			</div>
		);
	}

	// 특정 트레이너 일정
	getTrainerReservationApi = async (value) => {
		try{
			const param = JSON.parse(JSON.stringify({
				trainer_id: value,
				start_time: dateFormatResetWithTime(this.state.periodStartDate),
				end_time: dateFormatResetWithTime(this.state.periodEndDate),
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
			await axios.post("http://13.124.66.16:8080/api/auth/reservation/all/trainertime",
				JSON.stringify(param), requestOption )
				.then(res =>{
					const resData = JSON.parse(JSON.stringify(res.data));
					console.log(resData);
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

export default CalendarWeekAdmin;