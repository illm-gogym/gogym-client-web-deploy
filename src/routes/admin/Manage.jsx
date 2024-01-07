import React from 'react';
import { Link, Redirect, withRouter  } from 'react-router-dom';
import classNames from 'classnames';
import {Icon} from "../../asset/js/icon";

import {getAuthToken, getAuthTrainerId} from '../../Util/Authentication';
import {dateFormatYYYYMMDD, dateFormatWithTime, dateFormatGetMMDD} from '../../Util/DateFormat';
import axios from "axios";
import uuid from 'react-uuid';

class Manage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			memberList: [
				// {id: '221003', name: '김문수', date: '22.10.03', reservation: 1},
				// {id: '221001', name: '김동수', date: '22.10.01', reservation: 0},
				// {id: '220920', name: '라강민', date: '22.09.20', reservation: 0},
				// {id: '228010', name: '이선아', date: '22.08.10', reservation: 0}
			]
		}
	}

	getUserInfoApi = async () => {
		try{
			// let trainer_id = this.state.trainer_id;
			// const trainer_id = {trainer_id: localStorage.getItem('login-id')};
			const requestOption ={
				// params : trainer_id,
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'no-cache',
					'Accept': 'application/json',
					Authorization: `Bearer ${getAuthToken()}`,
					// 'Authorization': `${localStorage.getItem('access-token')}`
				},
			};
			await axios.get("http://gogym.co.kr:8080/api/auth/trainer/userall", requestOption )
				.then(res =>{
					const resData = JSON.parse(JSON.stringify(res.data));
					axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('access-token')}`;
					this.setState({
						memberList : [
							...resData.data
						]
					})
				})
				.catch(ex=>{
					console.log("login requset fail : " + ex);
				})
				.finally(()=>{console.log("login request end")});
		}catch(e){
			console.log(e);
		}
	}

	componentDidMount() {
		this.getUserInfoApi();
	}

	render() {
		const {memberList} = this.state;
		if(!getAuthToken()) {
			return <Redirect replace to="/login/admin" />;
		}
		return (
			<div className={classNames('home_wrap')}>
				<div className={'notify_area'}>
					<h2>회원 관리</h2>
				</div>
				<div className={'section'}>
					<div className={'article'}>
						<div className={'article_content'}>
							<strong className={'title'}>새로운 회원을 등록하세요.</strong>
							<p className={'description'}>신규 회원을 등록하고 한눈에 관리해 보세요!</p>
						</div>
						<Link to={'/manage/register'} className={'btn_article'} >
							회원 등록하기
						</Link>
						{/*<span  className={'btn_article'} >*/}
						{/*회원 등록하기*/}
						{/*</span>*/}
					</div>
				</div>
				<div className={'section'}>
					<h3>회원 ({memberList.length}명)</h3>
					<ul className={'member_list'}>
						{memberList.map((value, index) =>
							<li key={uuid()} className={'item'}>
								<Link to={{pathname:`/manage/detail`, state: value}}>
									<strong>{value.name}</strong>
									{console.log(value)}
									<span className={'date'}>{dateFormatYYYYMMDD(value.ins_dtm, '.')} ~ {dateFormatYYYYMMDD(value.upd_dtm, '.')}</span>
									<i className={'arrow'}><Icon.ic24BulletArrowRight/></i>
								</Link>
							</li>
						)}
					</ul>
				</div>
			</div>
		);
	}
}

// export default Manage;
export default withRouter(Manage);
