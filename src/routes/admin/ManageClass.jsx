import React from 'react';
import classNames from 'classnames';
import ContentEditable from "react-contenteditable";
import {Icon} from "../../asset/js/icon";

import {getAuthToken, getAuthTrainerId} from '../../Util/Authentication';
import {dateFormatYYYYMMDD, dateFormatGetTime} from '../../Util/DateFormat';
import {useParams, useLocation, Link, withRouter} from "react-router-dom";
import axios from "axios";

class ManageClass extends React.Component {
	constructor(props) {
		super(props);

		this.editRef = React.createRef();
		this.state = {
			personal: {
				date: "",
				name: "",
				user_phone: "",
			},
			isLoadDate: false,
			isEdit: false,
		}
	}

	historyBack = () => {
		this.props.history.goBack();
	}

	onEditChange  = (e) => {
		const text = e.target.value;
		this.setState({
			personal: {
				...this.state.personal,
				reservation: {
					...this.state.personal.reservation,
					description: text,
				}
			},
			isEdit: true,
		})
	}

	componentDidMount() {
		const personal = this.props.location.state;

		this.setState({
			personal: personal,
			isLoadDate: true,
		});

		console.log(personal);
	}

	render() {
		const {isLoadDate, personal, isEdit} = this.state;
		return (
			<div id={'wrap'} className={classNames('manage_wrap')}>
				<div className="container">
					<div className={'notify_area'}>
						<h2>
							<button type={'button'} className={'btn_back'} onClick={this.historyBack}><Icon.ic24BulletArrowLeft333/></button>
							회원 관리
						</h2>
					</div>

					<div className={classNames('section', 'full')}>
						{isLoadDate &&
						<>
							<div className={'title'}>
								{dateFormatYYYYMMDD(personal.reservation.start_time, '.', 'day')}
							</div>
							<ContentEditable
								innerRef={this.editRef}
								html={personal.reservation.description}
								disabled={false}
								onChange={(e) => this.onEditChange(e)}
								className={'class_description'}
								// onChange={(e) => setState((prev) => ({ ...prev, html: e.target.value }))}
							/>
						</>
						}

						<button type={'button'} className={'btn_modify'} disabled={!isEdit}>수정하기</button>
					</div>
				</div>
			</div>
		);
	}
}

export default withRouter(ManageClass);
