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
	}

	render() {
		const { personal, personalList, isLoadDate, scheduleStateList, selectState } = this.state;

		const getPersonalList = personalList.map((value, index) =>
			(value.reservation.usage_state === selectState || selectState === 0) && <li className={'item'} key={uuid()}>
				<span className={classNames('index')}>
					{personalList.length - index}
				</span>
				<span className={classNames('date')}>
					{dateFormatWithTime(value.reservation.start_time, '.', 'day').replace('T', ' ')}

				</span>
				<span className={classNames('state', {'prearrange' : value.reservation.usage_state === -1} )}>
					{value.reservation.usage_state === -1 ? '예정' : '완료'}
				</span>
				<span className={'detail'}>
					<Link to={{pathname:`/manage/class`,  state:value}} className={'btn_detail'}>
						수업 보기
					</Link>
				</span>
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

					<div className={classNames('section', 'full')}>
						<div className={'manage_header'}>
							<div className={'header_area'}>
								<strong>{personal.name}</strong>
								<button type={'button'} className={'btn_edit'}>
									<Icon.ic12Pencil666/>
									회원 정보 수정
								</button>
							</div>

							<ul className={'sort_list'}>
								{scheduleStateList.map((value, index) => {
									return <RadioButton
										handleCheckChildElement={this.handleCheckChildElement}
										{...value}
										key={uuid()}
									/>
								})}
							</ul>
						</div>

						<div className={'manage_content'}>
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
			await axios.post("http://13.125.53.84:8080/api/auth/reservation/all/user",
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
}

// export default withParams(ManageDetail);
export default withRouter(ManageDetail);
