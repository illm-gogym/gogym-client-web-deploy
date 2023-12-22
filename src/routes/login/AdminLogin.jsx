import React from "react";
import axios from "axios";
import {Link, NavLink, Redirect} from 'react-router-dom';
import {Icon} from "../../asset/js/icon";
import { useParams, withRouter } from 'react-router-dom';

import {getAuthToken, getAuthTrainerId, getLoginType} from '../../Util/Authentication';

class AdminLogin extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			modalOpen: false,
			loginInfo: {
				password: '',
				trainer_id: ''
			}
		}
	}

	onInputChange = (e) => {
		var target = e.target;

		this.setState({
			loginInfo: {
				...this.state.loginInfo,
				[target.name]: target.value,
			},
		});
	}

	onEnterCheck = (e) => {
		if (e.key === 'Enter' || e.keyCode === 13) {
			this.loginApi();
		}
	}

	render() {
		const {loginInfo} = this.state;
		if(getAuthToken()) {
			return <Redirect replace to="/schedule/member" />;
		}
		return (
			<div className={'login_main_wrap'} >
				<h1 className={'title'}>
					<span className="blind">GoGym</span>
					<Icon.logoGo/>
					<Icon.logoGym/>
					<Icon.logoAdmin className={'logo_admin'} />
				</h1>
				<p className={'description'}>
					PT 회원 예약 서비스(관리자용)
				</p>

				<div className={'form'}>
					<label htmlFor="form_email">아이디</label>
					<input id={'form_email'} type="text" placeholder={'아이디를 입력해 주세요'} name={'trainer_id'} value={loginInfo.trainer_id || ''} onChange={(e) =>this.onInputChange(e)} onKeyUp={(e) => this.onEnterCheck(e)}/>
				</div>

				<div className={'form'}>
					<label htmlFor="form_pwd">비밀번호</label>
					<input id={'form_pwd'} type="password" placeholder={'비밀번호를 입력해 주세요'} name={'password'} value={loginInfo.password || ''} onChange={(e) =>this.onInputChange(e)} onKeyUp={(e) => this.onEnterCheck(e)}/>
				</div>

				<button type={'submit'} className={'btn_login'} onClick={this.loginApi}>로그인</button>

				<NavLink to={'/login/user'} className={'btn_change'}>회원 로그인 가기</NavLink>
			</div>
		)
	}

	loginApi = async () => {
		if(this.state.loginInfo.trainer_id == '' || this.state.loginInfo.password == '') {
			alert('아이디 또는 비밀번호를 확인해주세요.');
			return;
		}

		try{
			console.log('관리자 로그인');
			let loginInfo = JSON.parse(JSON.stringify(this.state.loginInfo));
			const requestOption ={
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'no-cache',
					'Accept': 'application/json'
				}
			};

			console.log(loginInfo);
			await axios.post("http://gogym.co.kr:8080/api/authenticate/login/trainer" ,
				JSON.stringify(loginInfo), requestOption )

				.then(res =>{
					const accessToken = JSON.parse(JSON.stringify(res.data));

					const myObject = {
						token : accessToken.token,
						trainer_id : loginInfo.trainer_id
					};
					console.log(myObject);
					localStorage.setItem('access-info', JSON.stringify(myObject));
					// console.log(localStorage.getItem('access-info'));
					// API 요청하는 콜마다 헤더에 accessToken 담아 보내도록 설정
					// axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

					console.log(localStorage.getItem('access-info'));
					window.location.replace('/schedule/member');
					// window.location.reload(false);
					// this.props.location.href;
				})
				.catch(ex=>{
					console.log("login requset fail : " + ex);
					alert('로그인 정보를 확인해주세요.')
				})
				.finally(()=>{console.log("login request end")});
		}catch(e){
			console.log(e);
		}
	}
}
// export default AdminLogin;
export default withRouter(AdminLogin);