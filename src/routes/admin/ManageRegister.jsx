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
				birth: '',
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
				start_time: dateFormatYYYYMMDD(new Date()),
				end_time:  dateFormatYYYYMMDD(new Date()),
			},
			submitDisabled: true,
		}
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
				birth: '',
				gender: 'Man',
				gym_id: 1800,
				name: '',
				password: '0',
				phone: '',
				role: 'ROLE_USER',
				remaining: 0,
				total: 0,
				trainer_id: getAuthTrainerId() ? getAuthTrainerId() : '',
				until: "2022-12-31",
				start_time: new Date(),
				end_time: new Date(),
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
						<h2 onClick={this.getUserinfoApi}>?????? ??????</h2>
					</div>

					<form className="form_area" autoComplete={'on'}>
						<div className={'form_box'}>
							<input type="text" className={'form_input'} placeholder={'????????? ????????? ?????????'} required={true} onChange={(e) =>this.onInputChange(e)} onKeyUp={this.validate}  name={'name'}/>
							<label className={'form_label'}>??????</label>
						</div>
						<div className={'form_box'}>
							<input type="date" className={'form_input'} placeholder={'??????????????? ????????? ?????????'} required={true} onChange={(e) =>this.onInputChange(e)} onKeyUp={this.validate} name={'birth'}/>
							<label className={'form_label'}>????????????</label>
							<p className={'form_detail'}>???) 1992-02-28</p>
						</div>
						<div className={'form_box'}>
							<input type="number" className={'form_input'} placeholder={'01012345678'} required={true} onChange={(e) =>this.onInputChange(e)} onKeyUp={this.validate} name={'phone'}/>
							<label className={'form_label'}>????????????</label>
							<p className={'form_detail'}>???-??? ?????? ????????? ????????? ????????? </p>
						</div>
						<div className={'form_box'}>
							<input type="text" className={'form_input'} placeholder={'0'} required={true} onChange={(e) =>this.onInputChange(e)} onKeyUp={this.validate}  name={'total'}/>
							<label className={'form_label'}>????????? (??????)</label>
							<p className={'form_detail'}>???????????? ????????????</p>
						</div>

						<div className={classNames('form_box', 'multi')}>
							<label htmlFor="plus_start_time" className={'form_label'}>??????</label>
							<input type="date" id={'plus_start_time'} value={userInfo.start_time} className={'form_input'} onChange={(e) =>this.onInputChange(e)} name={'start_time'} />
							<span className={'dash'}>-</span>
							<input type="date" id={'plus_end_time'} value={userInfo.end_time} className={'form_input'} onChange={(e) =>this.onInputChange(e)} name={'end_time'}/>
						</div>
					</form>

					<div className={'register_area'}>
						<button type={'submit'} className={'btn_register'} disabled={submitDisabled} onClick={this.onSubmit} >?????? ??????</button>
					</div>
				</div>

				<Modal open={modalOpen} close={this.closeModal} header=" ">
					<div className={'title'}><strong>{userInfo.name}</strong> ?????? ID??? PW??? ?????????????????????.</div>
					<p className={'description'}>
						???????????? ?????? ????????? ??? ?????? ???????????? ??????????????? ????????? ??? ????????????. <br/>
						???????????? ????????? ???????????? ??????????????? ????????? ?????? ??? 4?????? ?????????.
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
			await axios.post("http://13.125.53.84:8080/api/auth/user/signup" ,
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

