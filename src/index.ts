import { AxiosRequestConfig } from './types'
import { transformURL } from './utils/transformURL'
import { transformRequest } from './utils/transformRequest'
import { transformHeaders } from './utils/transformHeaders'
import xhr from './xhr'

function axios(config: AxiosRequestConfig) {
  processConfig(config)
  xhr(config)
}

/**
 * @description: 处理 config 参数
 * @param {AxiosRequestConfig} config
 * @return {*}
 */
function processConfig(config: AxiosRequestConfig) {
  config.url = transformUrl(config)
  config.headers = transformHeaderData(config)
  config.data = transformRequestData(config)
}

/**
 * @description: 处理 url 和 params
 * @param {AxiosRequestConfig} config
 * @return {*}
 */
function transformUrl(config: AxiosRequestConfig) {
  const { url, params } = config
  return transformURL(url, params)
}

/**
 * @description: 转换 data中的对象为字符串对象
 * @param {AxiosRequestConfig} config
 * @return {*}
 */
function transformRequestData(config: AxiosRequestConfig) {
  return transformRequest(config.data)
}

/**
 * @description: 处理请求 header
 * @param {AxiosRequestConfig} config
 * @return {*}
 */
function transformHeaderData(config: AxiosRequestConfig) {
  const { headers = {}, data } = config
  return transformHeaders(headers, data)
}

export default axios
