const Authentication =  JSON.parse(localStorage.getItem('access-info'));

export function getAuthToken() {
	return Authentication === null ? false : Authentication.token;
};

export function getAuthTrainerId() {
	return Authentication  === null ? false : Authentication.trainer_id;
};

export function getUserData() {
	return Authentication.user_id === undefined ? false : {
		user_id: Authentication.user_id,
		user_name: Authentication.user_name,
	}
};

export function getLoginType() {
	return Authentication.trainer_id === undefined ? 'user' : 'trainer';
};