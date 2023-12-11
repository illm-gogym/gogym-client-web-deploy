import axios from "axios";
import {getAuthToken, getAuthTrainerId} from '../Util/Authentication';

const getTrainerUserAllApi = async () => {
	try{
		const requestOption ={
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'no-cache',
				'Accept': 'application/json',
				Authorization: `Bearer ${getAuthToken()}`,
			},
		};
		const result = await axios.get("http://59.18.236.206:8080/api/auth/trainer/userall", requestOption )
			.then(res =>{
				const resData = JSON.parse(JSON.stringify(res.data));
				axios.defaults.headers.common['Authorization'] = `Bearer ${getAuthToken()}`;
				// console.log(res.data);
			})
			.catch(ex=>{
				console.log("login requset fail : " + ex);
			})
			.finally(()=>{console.log("login request end")});
		return result;
	}catch(e){
		console.log(e);
	}
}

export {
	getTrainerUserAllApi,
}