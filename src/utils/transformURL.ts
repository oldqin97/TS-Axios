import { isDate, isObject } from './tools'

/**
 * @description: 解码替换 @ : $ , blank [ ]
 * @param {string} val
 * @return {*}
 */
function encode(val: string) {
  return encodeURIComponent(val)
    .replace(/%40/g, '@')
    .replace(/%3A/gi, ':')
    .replace(/%24/g, '$')
    .replace(/%2C/gi, ',')
    .replace(/%20/g, '+')
    .replace(/%5B/gi, '[')
    .replace(/%5D/gi, ']')
}

/**
 * @description: 解析params参数,并且添加到url上
 * @param {string} url
 * @param {any} params
 * @return {string} url
 */
function transformURL(url: string, params?: any) {
  if (!params) return url

  const parts: string[] = []

  Object.keys(params).forEach(key => {
    // 01-参数值为字符串
    let value = params[key]

    // 06-空值忽略
    if (value === null || typeof value === 'undefined') return

    let values: string[]

    // 02-参数值为数组
    if (Array.isArray(value)) {
      values = value
      key += '[]'
    } else {
      values = [value]
    }

    values.forEach(val => {
      // 04-参数值为 Date 类型
      if (isDate(val)) {
        val = val.toISOString()
      }

      //  03-参数值为对象
      if (isObject(val)) {
        val = JSON.stringify(val)
      }

      // 05-特殊字符支持
      parts.push(`${encode(key)}=${encode(val)}`)
    })
  })

  let serializedParams = parts.join('&')

  if (serializedParams) {
    const markIndex = url.indexOf('#')
    // 07-丢弃 url 中的哈希标记
    if (markIndex !== -1) {
      url = url.slice(0, markIndex)
    }

    // 08-保留 url 中已存在的参数
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams
  }

  return url
}

export { transformURL }
