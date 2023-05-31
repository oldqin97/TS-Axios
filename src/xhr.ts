import { AxiosRequestConfig } from './types'

function xhr(config: AxiosRequestConfig) {
  const { data = null, url, method = 'GET' } = config
  
  const request = new XMLHttpRequest()
  
  request.open(method.toUpperCase(), url, true)
  
  request.send(data)
  }
  
  export default xhr
