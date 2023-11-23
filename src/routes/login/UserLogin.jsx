import React from "react";
import axios from "axios";
import {Link, NavLink, Redirect, withRouter} from 'react-router-dom';
import {Icon} from "../../asset/js/icon";
import {getAuthToken, getAuthTrainerId, getLoginType} from '../../Util/Authentication';

class UserLogin extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			modalOpen: false,
			loginInfo: {
				password: '',
				user_id: ''
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
			this.userLoginApi();
		}
	}

	render() {
		const {loginInfo} = this.state;
		if(getAuthToken()) {
			return <Redirect replace to="/" />;
		}
		return (
			<div className={'login_main_wrap'} >
				<h1 className={'title'}>
					<span className="blind">GoGym</span>
					<Icon.logoGo/>
					<Icon.logoGym/>
				</h1>
				<p className={'description'}>
					PT 회원 서비스
				</p>

				<div className={'form'}>
					<label htmlFor="form_email">아이디</label>
					<input id={'form_email'} type="text" placeholder={'아이디를 입력해 주세요'} name={'user_phone'} value={loginInfo.user_phone || ''} onChange={(e) =>this.onInputChange(e)}  onKeyUp={(e) => this.onEnterCheck(e)}/>
				</div>

				<div className={'form'}>
					<label htmlFor="form_pwd">비밀번호</label>
					<input id={'form_pwd'} type="password" placeholder={'비밀번호를 입력해 주세요'} name={'password'} value={loginInfo.password || ''} onChange={(e) =>this.onInputChange(e)}  onKeyUp={(e) => this.onEnterCheck(e)} />
				</div>

				<button type={'submit'} className={'btn_login'} onClick={this.userLoginApi}>로그인</button>

				<NavLink to={'/login/admin'} className={'btn_change'}>관리자 로그인 가기</NavLink>
			</div>
		)
	}

	userLoginApi = async () =>  {
		if(this.state.loginInfo.user_phone == null || this.state.loginInfo.password == null) {
			alert('아이디 또는 비밀번호를 확인해주세요.');
			return;
		}

		try{
			console.log('사용자 로그인');
			let userLoginInfo = {
				password: this.state.loginInfo.password,
				user_phone: this.state.loginInfo.user_phone,
			}
			console.log(userLoginInfo);
			const requestOption ={
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'no-cache',
					'Accept': 'application/json'
				}
			};
			await axios.post("/api/authenticate/login/user" ,
				JSON.stringify(userLoginInfo), requestOption )

				.then(res =>{
					const accessToken = JSON.parse(JSON.stringify(res.data));
					console.log(accessToken);
					// API 요청하는 콜마다 헤더에 accessToken 담아 보내도록 설정
					// axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
					// localStorage.setItem('login-id', loginInfo.trainer_id);
					const myObject = {
						token : accessToken.token,
						user_id : accessToken.user.user_phone,
						user_name : accessToken.user.name,
					};
					localStorage.setItem('access-info', JSON.stringify(myObject));
					window.location.replace('/user');
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
// export default UserLogin;
export default withRouter(UserLogin);