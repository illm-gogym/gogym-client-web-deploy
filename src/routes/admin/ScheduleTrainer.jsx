import React from "react";
import classNames from 'classnames';
import {NavLink, withRouter, Link, Redirect} from "react-router-dom";
import axios from "axios";
import uuid from 'react-uuid';

import Navigation from "../../components/Navigation";
import {Icon} from "../../asset/js/icon";
import {dateFormatYYYYMMDD, dateFormatWithTime, dateFormatGetTime, dateFormatResetWithTime} from '../../Util/DateFormat';
import Modal from "../../components/Modal";
import {CheckBox} from "../../components/CheckBox";
import CalenderWeekAdmin from "../../components/CalenderWeekAdmin";
import {getAuthToken, getAuthTrainerId} from "../../Util/Authentication";
import {getPalette} from "../../Util/Palette";

let lastScrollY = 0;

class ScheduleTrainer extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			personalType: 'member',
			modalOpen: false,
			memberList: [],
			originTaskList: [
				// {'date': '2022. 11. 21 09:00', 'name': '한예슬'},
			],
			taskList: [
				// {'date': '2022. 11. 21 09:00', 'name': '한예슬'},
			],
			addScheduleList: [],
			addSchedule: {
				name: '',
				date: dateFormatYYYYMMDD(new Date()),
				start_time: '',
				end_time: '',
				description: '',
				user_phone: '',
				usage_state: -1
			},
			selectMember: [],
			selectAllCheck: false,
			menuOpen: false,
			paletteList: {},
		};
	}

	handleAllChecked = event => { // 체크박스 전체제어
		let memberList = this.state.memberList;
		memberList.forEach(members => (members.isChecked = event.target.checked));
		this.setState({
			selectAllCheck: !this.state.selectAllCheck,
			memberList: memberList
		});

		this.onSelectMember();
	};

	handleCheckChildElement = (event, value) => { // 체크박스 개별제어
		let memberList = this.state.memberList;
		memberList.forEach(members => {
			if (members.trainer_id === value.trainer_id)
				members.isChecked = event.target.checked;
		});
		this.setState({
			memberList: memberList,
		});

		this.onSelectMember(value);
	};

	initTrainerMine = (list) => {
		let selectList = [], paletteList = {};
		list.forEach((members, index) => {
			if (members.trainer_id === getAuthTrainerId()) {
				selectList.push(members.trainer_id);
			}
			const source = {[members.trainer_id] : getPalette(index) };
			Object.assign(paletteList, source);
		});

		this.setState({
			selectMember: selectList,
			paletteList: paletteList,
		});
	}

	onSelectMember = () => {
		let memberList = this.state.memberList;
		let selectList = [];
		let selectCheckAll = true;
		memberList.forEach(members => {
			if (members.isChecked === true) {
				selectList.push(members.trainer_id);
			} else {
				selectCheckAll = false
			}
		});
		this.setState({
			selectMember: selectList,
			memberList: memberList,
			selectAllCheck: selectCheckAll,
		});
	}

	makeCheckMemberList = () => { // checkbox 컴포넌트 제어 isChecked 추가
		const list = this.state.memberList.map((members, index) => {
			if(members.trainer_id === getAuthTrainerId())
				members.isChecked = true;
			else
				members.isChecked = false;
			return members;
		});

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
		this.getTrainerAllApi();
	}

	handleScroll = (e) => {
		const scrollY = e.target.scrollTop;
		const direction = scrollY > lastScrollY ? "down" : "up";
		lastScrollY = scrollY;

		if(direction === 'down' && scrollY >= 20 && scrollY <= 65 ) {
			e.target.scrollTop = 65;
			lastScrollY = 65;
		} else if(direction === 'up' && scrollY < 20) {
			e.target.scrollTop = 0;
			lastScrollY = 0;
		}
	}

	render() {
		const { memberList, selectAllCheck,  menuOpen, selectMember, paletteList} = this.state;

		if(!getAuthToken()) {
			return <Redirect to="/login/admin" />;
		}
		return (
			<div className={classNames('schedule_wrap', 'type_trainer')} onScroll={this.handleScroll}>
				<div className={'notify_area'}>
					<h2>트레이너</h2>
				</div>

				<div className={'section'}>
					<div className={'tab_area'}>
						{/*<div className={'tab'}>*/}
							{/*<strong className={'text'}>트레이너</strong>*/}
							{/*<div className={'menu_area'}>*/}
								{/*<button className={classNames('btn_menu', {'open': menuOpen})} onClick={this.onMenuOpen}><Icon.ic20BulletArrow/></button>*/}
								{/*<div className={'ly_menu'}>*/}
									{/*<NavLink to={'/schedule/member'} activeClassName={'active'} className={'menu'} onClick={this.onMenuOpen}>내 회원</NavLink>*/}
									{/*<NavLink to={'/schedule/trainer'} activeClassName={'active'} className={'menu'} onClick={this.onMenuOpen} >트레이너</NavLink>*/}
								{/*</div>*/}
							{/*</div>*/}
						{/*</div>*/}
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
									<label htmlFor="checkedall" className={'input_label'}><span className={'text'}>전체 보기</span></label>
								</li>
								{memberList.map((value, index) => {
									return <CheckBox
										handleCheckChildElement={this.handleCheckChildElement}
										{...value}
										paletteList={this.state.paletteList}
										key={uuid()}
									/>
								})}
							</div>
						</div>
					</div>

					<div className={'calender_wrap'}>
						<CalenderWeekAdmin selectMember={selectMember} role={'admin'} paletteList={paletteList}/>
					</div>
				</div>
			</div>
		);
	}

	getTrainerAllApi = async () => {
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
					// console.log(resData.data);
					this.setState({
						memberList : [
							...resData.data
						]
					});
					this.initTrainerMine(resData.data);
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

};

export default withRouter(ScheduleTrainer);
// export default withParams(Schedule);
// export default Schedule;
