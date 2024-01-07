import React from 'react';
import classNames from 'classnames';
import { withRouter} from "react-router-dom";

import Modal from "../../components/Modal";
import {dateFormatYYYYMMDD, dateFormatWithTime} from '../../Util/DateFormat';
import {isPhone} from '../../Util/Validator';
import {getAuthToken, getAuthTrainerId} from '../../Util/Authentication';

import axios from 'axios';

class ManageRegister extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			modalOpen: false,
			userInfo: {
				birth: this.onToday(),
				gender: 'Man',
				gym_id: 1800,
				name: '',
				password: '0',
				phone: '',
				role: 'ROLE_USER',
				remaining: 0,
				total: 0,
				trainer_id: getAuthTrainerId() ? getAuthTrainerId() : '',
				until: dateFormatYYYYMMDD(new Date()),
				start_date: dateFormatYYYYMMDD(new Date()),
				end_time:  dateFormatYYYYMMDD(new Date()),
			},
			submitDisabled: true,
		}
	}

	onToday = () => {
		const dateNow = new Date();
		const today = dateNow.toISOString().slice(0, 10);
		return today;
	}

	openModal = () => {
		this.setState({
			modalOpen: true
		});
	};

	closeModal = () => {
		this.setState({
			modalOpen: false
		});

		this.setInputReset();

		window.location.reload(false);
		window.location.replace('/manage');
	};

	onInputChange = (e) => {
		var target = e.target;

		if(target.name === 'phone') {
			this.setState({
				...this.state,
				userInfo: {
					...this.state.userInfo,
					[target.name]:target.value,
					password: target.value.substr(target.value.length - 4, target.value.length),
				}
			});
		} else if(target.name === 'total') {
			this.setState({
				...this.state,
				userInfo: {
					...this.state.userInfo,
					[target.name]: parseInt(target.value)
				}
			});
		} else if(target.name.indexOf('_time')) {
			this.setState({
				...this.state,
				userInfo: {
					...this.state.userInfo,
					[target.name]: target.value,
					until: this.state.userInfo.end_time,
				}
			});
		} else {
			this.setState({
				...this.state,
				userInfo: {
					...this.state.userInfo,
					[target.name]: target.value,
				}
			});
		}
	}

	onSubmit = () => {
		this.setUserinfoApi();
	}

	validate = () => {
		var objArr = Object.values(this.state.userInfo);
		if(objArr.indexOf('') === -1) {
			this.setState({
				...this.state,
				submitDisabled: false,
			});
		}
	}

	setInputReset = () => {
		this.setState({
			userInfo: {
				birth: this.onToday(),
				gender: 'Man',
				gym_id: 1800,
				name: '',
				password: '0',
				phone: '',
				role: 'ROLE_USER',
				remaining: 0,
				total: 0,
				trainer_id: getAuthTrainerId() ? getAuthTrainerId() : '',
				start_date: new Date(),
				until: new Date(),
			}
		});
	}

	componentDidMount() {
	}

	render() {
		const {modalOpen, userInfo, submitDisabled} = this.state;

		return (
			<div id={'wrap'} className={classNames('register_wrap')}>
				<div className="container">
					<div className={'notify_area'}>
						<h2 onClick={this.getUserinfoApi}>회원 등록</h2>
					</div>

					<form className="form_area" autoComplete={'on'}>
						<div className={'form_box'}>
							<input type="text" className={'form_input'} placeholder={'이름을 입력해 주세요'} required={true} onChange={(e) =>this.onInputChange(e)} onKeyUp={this.validate}  name={'name'}/>
							<label className={'form_label'}>이름</label>
						</div>
						<div className={'form_box'}>
							<input type="input" className={classNames('keyboard')} placeholder={'생년월일을 입력해 주세요'} required={true} onChange={(e) =>this.onInputChange(e)} onKeyUp={this.validate} name={'birth'} value={userInfo.birth}/>
							<input type="date" className={'form_input'} placeholder={'생년월일을 입력해 주세요'} required={true} onChange={(e) =>this.onInputChange(e)} onKeyUp={this.validate} name={'birth'} value={userInfo.birth}/>
							<label className={'form_label'}>생년월일</label>
							<p className={'form_detail'}>예) 1992-02-28</p>
						</div>
						<div className={'form_box'}>
							<input type="number" className={'form_input'} placeholder={'01012345678'} required={true} onChange={(e) =>this.onInputChange(e)} onKeyUp={this.validate} name={'phone'}/>
							<label className={'form_label'}>전화번호</label>
							<p className={'form_detail'}>‘-’ 없이 숫자만 입력해 주세요 </p>
						</div>
						<div className={'form_box'}>
							<input type="text" className={'form_input'} placeholder={'0'} required={true} onChange={(e) =>this.onInputChange(e)} onKeyUp={this.validate}  name={'total'}/>
							<label className={'form_label'}>수강권 (횟수)</label>
							<p className={'form_detail'}>안내문구 작성하기</p>
						</div>

						<div className={classNames('form_box')}>
							<label htmlFor="plus_start_time" className={'form_label'}>기간</label>
							<div className={'multi'}>
								<input type="date" id={'plus_start_time'} value={userInfo.start_date} className={'form_input'} onChange={(e) =>this.onInputChange(e)} name={'start_date'} />
								<span className={'dash'}>-</span>
								<input type="date" id={'plus_end_time'} value={userInfo.end_time} className={'form_input'} onChange={(e) =>this.onInputChange(e)} name={'end_time'}/>
							</div>
						</div>
					</form>

					<div className={'register_area'}>
						<button type={'submit'} className={'btn_register'} disabled={submitDisabled} onClick={this.onSubmit} >등록 완료</button>
					</div>
				</div>

				<Modal open={modalOpen} close={this.closeModal} header=" ">
					<div className={'title'}><strong>{userInfo.name}</strong> 님의 ID와 PW가 생성되었습니다.</div>
					<p className={'description'}>
						회원전용 앱을 설치한 후 아래 아이디와 비밀번호를 입력할 수 있습니다. <br/>
						아이디는 휴대폰 번호이며 비밀번호는 휴대폰 번호 뒷 4자리 입니다.
					</p>
					<ul className={'user_information'}>
						<li className={'row'}>
							<span className={'cell'}>ID</span>
							<span className={'cell'}>{userInfo.phone}</span>
						</li>
						<li className={'row'}>
							<span className={'cell'}>PW</span>
							<span className={'cell'}>{userInfo.phone.substr(userInfo.phone.length -4, userInfo.phone.length)}</span>
						</li>
					</ul>
				</Modal>
			</div>
		);
	}

	setUserinfoApi = async () => {
		try{
			let userInfo = JSON.parse(JSON.stringify(this.state.userInfo));
			const requestOption ={
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'no-cache',
					'Accept': 'application/json',
					Authorization: `Bearer ${getAuthToken()}`,
				}
			};
			console.log(userInfo);
			await axios.post("http://gogym.co.kr:8080/api/auth/user/signup" ,
				JSON.stringify(userInfo), requestOption )
				.then(res =>{
					const resData = JSON.parse(JSON.stringify(res.data));
					axios.defaults.headers.common['Authorization'] = `Bearer ${getAuthToken()}`;
					this.openModal();
				})
				.catch(ex=>{
					console.log("login requset fail : " + ex);
				})
				.finally(()=>{console.log("login request end")});
		}catch(e){
			console.log(e);
		}
	}
}

// export default ManageRegister;
export default withRouter(ManageRegister);

