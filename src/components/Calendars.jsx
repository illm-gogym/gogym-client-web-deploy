import { useState } from 'react';
import Calendar from 'react-calendar';
import React from "react";

import Modal from '../components/Modal';

function Calenders({taskList}) {
	const [date, setDate] = useState(new Date());
	const [dayList, setDayList] = useState([]);
	const [schedule, setSchedule] = useState({name:'', time:''});

	const [modalOpen, setModalOpen] = useState(false);
	const openModal = () => {
		setModalOpen(true);
	};
	const closeModal = () => {
		setModalOpen(false);
	};

	const [modifyModalOpen, setModifyModalOpen] = useState(false);
	const openModifyModal = () => {
		setModifyModalOpen(true);
	};
	const closeModifyModal = () => {
		setModifyModalOpen(false);
	};

	const onClickDay = (value, event) => {
		var clickDay = dateSplitDay(value);

		setDayList(() => {return []});

		taskList.map((value, index) => {
			var day = dateSplitDay(new Date(value.date)),
				time = dateSplitTime(new Date(value.date));
			if(day === clickDay) {
				setDayList((prevState) => {
					return [{'name': value.name, 'time': time}, ...prevState];
				})
			}
		});

		openModal();
	}

	const dateSplitDay = (value) => {
		return value.toLocaleDateString('ko-KR');
	}

	const dateSplitTime = (value) => {
		return value.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
	}

	const checkTask = (activeStartDate, date, view) => {
		var taskArr = taskList.map((value, index) => {
			var currentDate = new Date(value.date);
			var options = { hour: "numeric", minute: "numeric", hour12: false };
			if(date.getMonth() === currentDate.getMonth() && date.getDate() === currentDate.getDate() ) {
				return { name:value.name, time: currentDate.toLocaleTimeString("en-US", options)} ;
			}
		});

		return <span className={'task_area'}>{taskArr.map((value, index) =>
			value !== undefined ? <span className={'task'}>{value.name} {value.time}</span> : null
		)}</span>
	};

	const modifySchedule = (e) => {
		console.log(e);
		openModifyModal();
	}

	return (
		<>
			<div className='calendar-container'>
				<Calendar
					onChange={setDate}
					value={date}
					className={'task_calendar'}
					tileClassName={'task_calender_tile'}
					formatDay={(locale, date) => date.toLocaleString("en", {day: "numeric"})}
					tileContent={ ({ activeStartDate, date, view }) => checkTask(activeStartDate, date, view) }
					onClickDay={(value, event) => onClickDay(value, event)}
				/>
			</div>
			<p className='text-center'>
				<span className='bold'>Selected Date:</span>{' '}
				{date.toDateString()}
			</p>

			<Modal open={modalOpen} close={closeModal} header="오늘의 일정">
				<ul className={'day_list'}>
					{dayList.map((value, index) =>
						<li className={'item'}>
							<span className={'text'}>
								<strong>{value.time}</strong> {value.name} 님
							</span>
							<button type={'button'} className={'btn_manage'} onClick={(e)=>modifySchedule(e)}>일정수정</button>
						</li>
					)}
				</ul>
			</Modal>

			<Modal open={modifyModalOpen} close={closeModifyModal} header="일정 관리">
				<div>
					회원 :
					날짜 :
				</div>
			</Modal>
		</>
	);
}

export default Calenders;