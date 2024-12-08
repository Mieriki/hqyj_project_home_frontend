import axios from "axios";
import { ElMessage, MessageParamsWithType } from "element-plus";
import 'element-plus/dist/index.css'
import { useMeanStore } from "../store";

const authItemName = "authorize"

const accessHeader = () => {
    return {
        'Authorization': `Bearer ${takeAccessToken()}`
    }
}

function unauthorized() {
    return !takeAccessToken()
}

const defaultError = (error: any) => {
    console.error(error)
    ElMessage.error('发生了一些错误，请联系管理员')
}

const defaultFailure = (message: MessageParamsWithType, status: any, url: any) => {
    console.warn(`请求地址: ${url}, 状态码: ${status}, 错误信息: ${message}`)
    ElMessage.warning(message)
}

function takeAccessToken() {
    const str = localStorage.getItem(authItemName) || sessionStorage.getItem(authItemName);
    if(!str) return null
    const authObj = JSON.parse(str)
    if(new Date(authObj.expire) <= new Date()) {
        deleteAccessToken()
        ElMessage.warning("登录状态已过期，请重新登录！")
        return null
    }
    return authObj.token
}

function storeAccessToken(remember, token, expire){
    const authObj = {
        token: token,
        expire: expire
    }
    const str = JSON.stringify(authObj)
    if(remember)
        localStorage.setItem(authItemName, str)
    else
        sessionStorage.setItem(authItemName, str)
}

function deleteAccessToken() {
    localStorage.removeItem(authItemName)
    sessionStorage.removeItem(authItemName)
}

const getMenuRouter = () => {
	return new Promise<any>((resolve, reject) => {
		get(`/menus/get/router`, (data) => {
			resolve(data); 
		})
	});	
}

function analysisCode(code: number) {
	if (code === 200) {
		return true
	} else if (code === 603) {
		deleteAccessToken()
		const meanStore = useMeanStore()
		meanStore.setForce(true)
	}
	return false
}

function internalPost(url: string, data: any, headers: {}, success: (arg0: any) => void, failure: { (message: MessageParamsWithType, status: any, url: any): void; (arg0: any, arg1: any, arg2: any): void; }, error = defaultError){
    axios.post(url, data, { headers: headers }).then(({data}) => {
        if(analysisCode(data.code))
            success(data.data)
        else
            failure(data.message, data.code, url)
    }).catch(err => error(err))
}

function internalGet(url: string, headers: {}, success: (arg0: any) => void, failure: { (message: MessageParamsWithType, status: any, url: any): void; (arg0: any, arg1: any, arg2: any): void; }, error = defaultError){
    axios.get(url, { headers: headers }).then(({data}) => {
        if(analysisCode(data.code))
            success(data.data)
        else
            failure(data.message, data.code, url)
    }).catch(err => error(err))
}

function post(url: string, data: any, success: (arg0: any) => void, failure = defaultFailure) {
    internalPost(url, data, accessHeader(), success, failure)
}

function get(url: string, success: (arg0: any) => void, failure = defaultFailure) {
    internalGet(url, accessHeader(), success, failure)
}

function getUserInfo() {
	return new Promise<any>((resolve, reject) => {
		get(`/admins/get/me`, (data) => {
			console.log('user', data)
			resolve(data); 
		}) 
	});	
}

function login(username, password, remember, success, failure = defaultFailure){
    internalPost('/auth/login', {
        username: username,
        password: password
    }, {
        'Content-Type': 'application/x-www-form-urlencoded'
    }, (data) => {
		console.log("login", data)
        storeAccessToken(remember, data.token, data.expire)
        ElMessage.success(`登录成功，欢迎 ${data.name} 来到我们的系统`)
        success(data)
    }, failure)
}

function logout(success, failure = defaultFailure){
    get('/auth/logout', () => {
        deleteAccessToken()
        ElMessage.success(`退出登录成功，欢迎您再次使用`)
        success()
    }, failure)
}

export { post, get, accessHeader, getMenuRouter, getUserInfo, login, unauthorized, logout }
