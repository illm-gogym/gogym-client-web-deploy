import React from "react";
import { Link, Navigate } from 'react-router-dom';
import classNames from 'classnames';
import {Icon} from "../asset/js/icon";
import {nanoid} from "nanoid";

class Home extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			memberList: [
				{id: '221003', name: '김문수', date: '22.10.03', reservation: 1},
			]
		}
	}

	render() {
		const {memberList} = this.state;

		return (
			<div id={'wrap'} className={classNames('home_wrap')}>
				<div className="container">
					<div className={'notify_area'}>
						<h2>회원 관리</h2>
					</div>
					<div className={'section'}>
						<div className={'article'}>
							<div className={'article_content'}>
								<strong className={'title'}>새로운 회원을 등록하세요.</strong>
								<p className={'description'}>신규 회원을 등록하고 한눈에 관리해 보세요!</p>
							</div>
							<Link to={'/register'} className={'btn_article'} >
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
								<li key={nanoid()} className={'item'}>
									<Link to={`/manage/detail`} state={{personal:value}}>
										<strong>{value.name}</strong>
										<span className={'date'}>{value.date}</span>
										<i className={'arrow'}><Icon.ic24BulletArrowRight/></i>
									</Link>
								</li>
							)}
						</ul>
					</div>
				</div>
			</div>
		)
	}
}
export default Home;
