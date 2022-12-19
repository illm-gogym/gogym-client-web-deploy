import React from 'react';
import {Icon} from "../asset/js/icon";

const Modal = (props) => {
	// 열기, 닫기, 모달 헤더 텍스트를 부모로부터 받아옴
	const { open, close, header, submit, hasFooter } = props;

	const onDimmedClick = (e) => {
		if(e.target.className.indexOf('openModal') === 0) {
			close();
		}
	}

	return (
		// 모달이 열릴때 openModal 클래스가 생성된다.
		<>
			{open ? (
				<div className={open ? 'openModal modal' : 'modal'} onClick={e => onDimmedClick(e)}>
					<section className={'modal_section'}>
						<header className={'header'}>
							{header}
							<button className={'btn_close'} onClick={close}><i><Icon.ic24Close/></i></button>
						</header>
						<main className={'main'}>{props.children}</main>
						{hasFooter !== false &&
							<footer className={'footer'}>
								<button type={'button'} className={'btn_submit'} onClick={close}>{submit ? submit : '확인'}</button>
							</footer>
						}

					</section>
				</div>
			) : null}
		</>
	);
};

export default Modal;