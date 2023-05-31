## 处理 body 数据

我们通过执行 `XMLHttpRequest` 对象实例的 `send` 方法来发送请求，并通过该方法的参数设置请求 `body` 数据
`send` 方法的参数支持 `Document` 和 `BodyInit` 类型，`BodyInit` 包括了 `Blob`, `BufferSource`, `FormData`, `URLSearchParams`, `ReadableStream`、`USVString`，当没有数据的时候，我们还可以传入 `null`

我们最常用的是传递一个普通对象到服务器

```js
axios({
  method: 'post',
  url: '/base/post',
  data: {
    a: 1,
    b: 2
  }
})
```

这个时候 `data` 是不能直接传给 `send` 函数的，我们需要把它转换成 JSON 字符串。

- 新建文件 `utils/transformRequest.ts`

修改 `isObject` 函数

```js
function isObject(val: any): val is Object {
  return toString.call(val) === '[object Object]'
}
```

之前的处理逻辑对于 `FormData`、`ArrayBuffer` 这些类型，isObject 判断也为 true，但是这些类型的数据我们是不需要做处理的，而只有我们定义的普通 JSON 对象才能满足。

**transformRequest.ts**

```js
import { isObject } from './tools'

function transformRequest(data: any) {
  if (isObject(data)) {
    console.log('data:', data)
    return JSON.stringify(data)
  }

  return data
}

export { transformRequest }
```

实现了处理 `body` 的函数, 然后处理实际逻辑

**index.ts**

```js
function processConfig(config: AxiosRequestConfig) {
  config.url = transformUrl(config)
  config.data = transformRequestData(config)
}

// ...

/**
 * @description: 转换 data中的对象为字符串对象
 * @param {AxiosRequestConfig} config
 * @return {*}
 */
function transformRequestData(config: AxiosRequestConfig) {
  return transformRequest(config.data)
}
```

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

![body](https://raw.githubusercontent.com/oldqin97/cloudImg/main/blogs/picture/20230531220919.png)

![post](https://raw.githubusercontent.com/oldqin97/cloudImg/main/blogs/picture/20230531221048.png)

**我们做了请求数据的处理，把 data 转换成了 JSON 字符串，但是数据发送到服务端的时候，服务端并不能正常解析我们发送的数据**

![buffer](https://raw.githubusercontent.com/oldqin97/cloudImg/main/blogs/picture/20230531221105.png)
