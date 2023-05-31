import { AxiosRequestConfig } from './types'
import { buildURL } from './utils/buildURL'
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
}

/**
 * @description: 处理 url 和 params
 * @param {AxiosRequestConfig} config
 * @return {*}
 */
function transformUrl(config: AxiosRequestConfig) {
  const { url, params } = config
  return buildURL(url, params)
}

export default axios
