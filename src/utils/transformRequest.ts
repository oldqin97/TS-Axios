import { isObject } from './tools'

function transformRequest(data: any) {
  if (isObject(data)) {
    return JSON.stringify(data)
  }

  return data
}

export { transformRequest }
