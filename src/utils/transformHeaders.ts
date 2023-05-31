import { isObject } from './tools'

/**
 * @description: header['Content-Type'] 键名规范
 * @param {any} headers
 * @param {string} normalizedName = 'Content-Type'
 * @return {*}
 */
function normalizeHeaderName(headers: any, normalizedName: string) {
  if (!headers) return

  Object.keys(headers).forEach(name => {
    if (
      name !== normalizedName &&
      name.toUpperCase() === normalizedName.toUpperCase()
    ) {
      headers[normalizedName] = headers[name]
      delete headers[name]
    }
  })
}

function transformHeaders(headers: any, data: any) {
  normalizeHeaderName(headers, 'Content-Type')

  if (isObject(data)) {
    if (headers && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json;charset=utf-8'
    }
  }

  return headers
}

export { transformHeaders }
