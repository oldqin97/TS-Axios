## 处理请求 url 参数

复杂的 get 请求参数组合

### 01-参数值为字符串

```js
axios({
  method: 'get',
  url: '/simple/get',
  params: {
    a: 1,
    b: 2
  }
})
```

最终请求的 url 是 `/base/get?a=1&b=2`，这样服务端就可以通过请求的 url 解析到我们传来的参数数据了。
实际上就是把 params 对象的 key 和 value 拼接到 url 上。

### 02-参数值为数组

```js
axios({
  method: 'get',
  url: '/base/get',
  params: {
    foo: ['bar', 'baz']
  }
})
```

最终请求的 url 是 `/base/get?foo[]=bar&foo[]=baz`。

### 03-参数值为对象

```js
axios({
  method: 'get',
  url: '/base/get',
  params: {
    foo: {
      bar: 'baz'
    }
  }
})
```

最终请求的 url 是 `/base/get?foo=%7B%22bar%22:%22baz%22%7D`，foo 后面拼接的是 {"bar":"baz"} encode 后的结果。

![decode](https://raw.githubusercontent.com/oldqin97/cloudImg/main/blogs/picture/20230531180213.png)

### 04-参数值为 Date 类型

```js
const date = new Date()

axios({
  method: 'get',
  url: '/base/get',
  params: {
    date
  }
})
```

最终请求的 url 是 `/base/get?date=2019-04-01T05:55:39.030Z`，date 后面拼接的是 date.toISOString() 的结果。

### 05-特殊字符支持

对于字符 `@`、`:`、`$`、`,`、`` 、`[`、`]`，我们是允许出现在 url 中的，不希望被 encode。

```js
axios({
  method: 'get',
  url: '/base/get',
  params: {
    foo: '@:$, '
  }
})
```

最终请求的 url 是 `/base/get?foo=@:\$+`，注意，我们会把空格 转换成 +。

### 06-空值忽略

对于值为 null 或者 undefined 的属性，我们是不会添加到 url 参数中的。

```js
axios({
  method: 'get',
  url: '/base/get',
  params: {
    foo: 'bar',
    baz: null
  }
})
```

最终请求的 url 是 `/base/get?foo=bar`。

### 07-丢弃 url 中的哈希标记

```js
axios({
  method: 'get',
  url: '/base/get#hash',
  params: {
    foo: 'bar'
  }
})
```

最终请求的 url 是 `/base/get?foo=bar`

### 08-保留 url 中已存在的参数

```js
axios({
  method: 'get',
  url: '/base/get?foo=bar',
  params: {
    bar: 'baz'
  }
})
```

最终请求的 url 是 `/base/get?foo=bar&bar=baz`

### 解决需求

根据需求,我们要对 `params` 进行处理, 把参数拼接到 `url` 上

- 首先建立一个工具函数的文件夹 `src/utils`
- `src/utils/buildURL.ts`
- `src/utils/tools.ts`

**tools.ts**

```js
const toString = Object.prototype.toString

function isDate(val: any): val is Date {
  return toString.call(val) === '[object Date]'
}

function isObject(val: any): val is Object {
  return val !== null && typeof val === 'object'
}

export { isDate, isObject }
```

**buildURL.ts**

```js
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
export function buildURL(url: string, params?: any) {
  console.log('url:', url)
  if (!params) return url

  const parts: string[] = []

  Object.keys(params).forEach(key => {
    // 01-参数值为字符串
    let value = params[key]
    console.log('value:', value)

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

  console.log('parts:', parts)
  let serializedParams = parts.join('&')
  console.log('serializedParams:', serializedParams)

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
```

实现了处理 `params` 参数的函数, 然后处理实际逻辑

**index.ts**

```js
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
```

在执行 `xhr` 函数之前,我们先执行 `processConfig` 函数,集中对 `config` 中的数据进行处理, 目前除了对 **url** 和 **params** 处理之外, 未来还会对其他数据进行处理

在 `processConfig` 函数内部, 通过 `transformUrl` 函数修改了 **config.url**, 该函数内部调用了 `buildURL`

### 测试

**client**

```js
import axios from '../../src/index'
axios({
  method: 'get',
  url: '/base/get',
  params: {
    foo: 'test'
  }
})

axios({
  method: 'get',
  url: '/base/get',
  params: {
    foo: ['bar', 'baz']
  }
})

axios({
  method: 'get',
  url: '/base/get',
  params: {
    foo: {
      bar: 'baz'
    }
  }
})

const date = new Date()

axios({
  method: 'get',
  url: '/base/get',
  params: {
    date
  }
})

axios({
  method: 'get',
  url: '/base/get',
  params: {
    foo: '@: $ ,'
  }
})

axios({
  method: 'get',
  url: '/base/get',
  params: {
    foo: 'bar',
    baz: null
  }
})

axios({
  method: 'get',
  url: '/base/get#hash',
  params: {
    foo: 'bar'
  }
})

axios({
  method: 'get',
  url: '/base/get?foo=bar',
  params: {
    bar: 'baz'
  }
})
```

**server**

```js
router.get('/base/get', function(req, res) {
  res.json(req.query)
})
```

![url & params](https://raw.githubusercontent.com/oldqin97/cloudImg/main/blogs/picture/20230531214622.png)
