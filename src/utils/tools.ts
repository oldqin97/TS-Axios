const toString = Object.prototype.toString

function isDate(val: any): val is Date {
  return toString.call(val) === '[object Date]'
}

function isObject(val: any): val is Object {
  return val !== null && typeof val === 'object'
}

export { isDate, isObject }
