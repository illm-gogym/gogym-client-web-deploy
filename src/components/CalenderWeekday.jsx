import React from 'react';
import $ from "jquery";
import {Icon} from "../asset/js/icon";
import {DayPilot, DayPilotCalendar, DayPilotNavigator} from "@daypilot/daypilot-lite-react";
import {getAuthToken, getAuthTrainerId} from '../Util/Authentication';
import {dateFormatResetWithTime, dateFormatReset, dateFormatGetTime} from '../Util/DateFormat';
import axios from "axios";

const palette = [];

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
				cellHeight: '15',
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
					console.log(start);
					console.log(end);
				},
				onEventResize : args => {
					if(!window.confirm("일정을 변경 하시겠습니까?")) {
						args.preventDefault();
					}
				},
				onEventResized :  args => {
					this.setChangeHeader();
					var start = args.newStart.value,
						end = args.newEnd.value;
					console.log(start);
					console.log(end);
				},
				onEventClicked : args => {
					console.log(args);
				}
			},
			periodStartDate: '',
			periodEndDate: ''
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
		dataList.map((value, index) => {
				value.id = value.reservation.reservation_id;
				value.text = `${value.user.name}
				 			(${dateFormatGetTime(value.reservation.start_time)}~${dateFormatGetTime(value.reservation.end_time)})`;
				value.start = value.reservation.start_time;
				value.end = value.reservation.end_time;
				delete value.reservation;
				delete value.user;
			}
		)
		this.setState({
			calenderOption: {
				...this.state.calenderOption,
				events: dataList
			}
		});
	}

	setChangeReservation = (value) => {
		if(!value) {
			this.getUserReservationApi();
		} else {
			this.getUserNameReservationApi(value);
		}
	}

	componentDidUpdate(prevProps) {
		this.setChangeHeader();

		if(this.props.selectMember !== prevProps.selectMember && this.props.selectMember !== 'all') {
			this.setChangeReservation(this.props.selectMember);
		} else if(this.props.selectMember !== prevProps.selectMember && this.props.selectMember === 'none') {
			//
		}
	}

	componentDidMount() {
		// console.log(this.props.selectMember);
		this.setChangeHeader();
		this.setInitPeriod();
		this.getUserReservationApi();
	}

	render() {
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
			</div>
		);
	}

	getUserReservationApi = async () => {
		try{
			const requestOption ={
				// params : param,
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'no-cache',
					'Accept': 'application/json',
					Authorization: `Bearer ${getAuthToken()}`,
				},
			};
			await axios.get("http://13.125.53.84:8080/api/auth/reservation/all", requestOption )
				.then(res =>{
					const resData = JSON.parse(JSON.stringify(res.data));
					axios.defaults.headers.common['Authorization'] = `Bearer ${getAuthToken}`;
					// console.log(resData.data);
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

	getUserNameReservationApi = async (value) => {
		console.log('name');
		try{
			// console.log(value);
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
			await axios.post("http://13.125.53.84:8080/api/auth/reservation/all/user",
				JSON.stringify(param), requestOption )
				.then(res =>{
					const resData = JSON.parse(JSON.stringify(res.data));
					axios.defaults.headers.common['Authorization'] = `Bearer ${getAuthToken()}`;
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