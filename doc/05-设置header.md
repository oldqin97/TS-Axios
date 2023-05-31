## 设置 header

之前 把 data 转换成了 `JSON 字符串`，但是数据发送到服务端的时候，服务端并不能正常解析我们发送的数据

因为我们并没有给请求 `header` 设置正确的 `Content-Type`

```js
axios({
  method: 'post',
  url: '/base/post',
  headers: {
    'content-type': 'application/json;charset=utf-8'
  },
  data: {
    a: 1,
    b: 2
  }
})
```

并且在当我们传入的 data 为普通对象的时候，headers 如果没有配置 Content-Type 属性，需要自动设置请求 header 的 Content-Type 字段为：application/json;charset=utf-8。

## transformHeaders 函数

```js
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
```

因为请求 `header` 属性是大小写不敏感的，比如我们之前的例子传入 `header` 的属性名 `content-type` 就是全小写的，所以我们先要把一些 `header` 属性名规范化

**types/index.ts**

```js
export interface AxiosRequestConfig {
  url: string
  method?: Method
  data?: any
  params?: any
  headers?: any
}
```

**index.ts**

```js
function processConfig(config: AxiosRequestConfig) {
  config.url = transformUrl(config)
  config.headers = transformHeaderData(config)
  config.data = transformRequestData(config)
}
```

因为我们处理 header 的时候依赖了 data，所以要在处理请求 body 数据之前处理请求 header。

```js
function transformHeaderData(config: AxiosRequestConfig) {
  const { headers = {}, data } = config
  return transformHeaders(headers, data)
}
```

**xhr.js**

给 XMLHttpRequest 设置 headers

```js
function xhr(config: AxiosRequestConfig) {
  const { data = null, url, method = 'GET', headers } = config

  const request = new XMLHttpRequest()

  request.open(method.toUpperCase(), url, true)

  Object.keys(headers).forEach(name => {
    if (data === null && name.toLowerCase() === 'content-type') {
      delete headers[name]
    } else {
      request.setRequestHeader(name, headers[name])
    }
  })

  request.send(data)
}

export default xhr
```

当我们传入的 data 为空的时候，请求 header 配置 Content-Type 是没有意义的，于是我们把它删除。

### 测试

**client**

```js
axios({
  method: 'post',
  url: '/base/post',
  data: {
    a: 1,
    b: 2
  }
})

const arr = new Int32Array([21, 31])

axios({
  method: 'post',
  url: '/base/buffer',
  data: arr
})

axios({
  method: 'post',
  url: '/base/post',
  headers: {
    'content-type': 'application/json;charset=utf-8'
  },
  data: {
    a: 1,
    b: 2
  }
})

const paramsString = 'q=URLUtils.searchParams&topic=api'
const searchParams = new URLSearchParams(paramsString)

axios({
  method: 'post',
  url: '/base/post',
  data: searchParams
})
```

**server**

```js
router.post('/base/post', function(req, res) {
  res.json(req.body)
})

router.post('/base/buffer', function(req, res) {
  let msg = []
  req.on('data', chunk => {
    if (chunk) {
      msg.push(chunk)
    }
  })
  req.on('end', () => {
    let buf = Buffer.concat(msg)
    res.json(buf.toJSON())
  })
})
```

当我们请求的数据是普通对象并且没有配置 headers 的时候，会自动为其添加 Content-Type:application/json;charset=utf-8；同时我们发现当 data 是某些类型如 URLSearchParams 的时候，浏览器会自动为请求 header 加上合适的 Content-Type
