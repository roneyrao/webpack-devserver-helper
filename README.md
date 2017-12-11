# Webpack devServer helper

A processor to implement data mocking from static file via `devServer.historyApiFallback.rewrites`. Also a tool to parse mock configuration. Another tool is used to process `devServer.proxy` configuration, taking into account the `public path` and other stuff, to simplify its configuration.

## Mock illustration

### config

* folder

	`mock`

* mocked file extension

	`json`

* conversion map

	```
		'article/(\\d+)/comment/(\\d+)' =>  'article_$1_comment_$2'
	```

### url

	`article/235/comment/456`

### result url

	`mock/article_456_comment_235.json`


<a name="WebpackConfigExample"></a>

### Webpack config example
  ```
  const helper =require('webpack-devserver-helper');
  const publicPath = 'root';
  const cfg= [
    ['article/(\\d+)/comment/(\\d+)', 'article_$1_comment_$2_']
  ];
  const mock=helper.staticMock(helper.parseMockConfig(cfg), publicPath);
  module.exports={
    ...,
    devServer: {
      historyApiFallback: {
        verbose: true,
        index: publicPath + '/index.html',
        rewrites: [{
          from: new RegExp(`^api/([^.]+)`),
          to: function(ctx){
            return mock(ctx.match[1]);
          } 
        }]
      },
      setup:function setup(app){
        app.post('/api/:path', function(req, res, next) {
          req.method='GET';
          next();
        });
      }
    }
  };
  ```

## Proxy illustration

### config

* public path

	`root`

* source config

	```
  {
    context: ['/auth', '/api'],
    target: 'http://localhost:3000',
  }
	```

### output

```
[{
  context: ['root/auth', 'root/api'],
  target: 'http://localhost:3000',
}]
```


# Docs

## Functions

<dl>
<dt><a href="#parseMockConfig">parseMockConfig(cfg)</a> ⇒ <code>Object</code></dt>
<dd><p>Generate config of full format from shorthand, for staticMock using.
Acceptible formats refering to @see.</p>
</dd>
<dt><a href="#staticMock">staticMock(mockConfig, publicPath, [ext])</a> ⇒ <code>function</code></dt>
<dd><p>Create a path mapping function used for <code>devServer</code> config.
Config details referring to <a href="#WebpackConfigExample">webpack config example</a>.</p>
</dd>
<dt><a href="#parseProxies">parseProxies(proxies, publicPath, apiPrefix)</a> ⇒ <code>Object</code></dt>
<dd><p>Refine setting for <code>devServer.proxy</code>.
 1) prepend publicPath to key.
 2) rewrites them to empty string, if no &#39;pathRewrite&#39; is specified.
 3) set logLevel to &#39;debug&#39;.</p>
</dd>
</dl>

<a name="parseMockConfig"></a>

## parseMockConfig(cfg) ⇒ <code>Object</code>
Generate config of full format from shorthand, for staticMock using.
Acceptible formats refering to @see.

**Kind**: global function  
**Returns**: <code>Object</code> - - refined config  
**See**: input and output formats
- input
   - {true}  => {folder:'mock'}
   - {string} 'mockDir' => {folder:'mockDir'},
   - {array}
     ```
     ['article/(\\d+)/comment/(\\d+)', 'article_$1_comment_$2_']
     =>
     {folder:'mock', rewrites:[]}
     ```
   - {Object} if 'folder' is missed, set to 'mock', or stay untouched

- output
   ```
   {
     folder:'mock',
     rewrites:[
       ['article/(\\d+)/comment/(\\d+)', 'article_$1_comment_$2_']
     ]
   }
   ```  

| Param | Type | Description |
| --- | --- | --- |
| cfg | <code>Object</code> | passed in shorthand config. |

<a name="staticMock"></a>

## staticMock(mockConfig, publicPath, [ext]) ⇒ <code>function</code>
Create a path mapping function used for `devServer` config.
Config details referring to [webpack config example](#WebpackConfigExample).

**Kind**: global function  
**Returns**: <code>function</code> - - function mapping path to mock data file name.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| mockConfig | <code>Object</code> |  | returned from parseMockConfig() |
| publicPath | <code>string</code> |  | what is configured in webpack |
| [ext] | <code>string</code> | <code>&quot;json&quot;</code> | default file extension mapped when no rewrites matched |

<a name="parseProxies"></a>

## parseProxies(proxies, publicPath, apiPrefix) ⇒ <code>Object</code>
Refine setting for `devServer.proxy`.
 1) prepend publicPath to key.
 2) rewrites them to empty string, if no 'pathRewrite' is specified.
 3) set logLevel to 'debug'.

**Kind**: global function  
**Returns**: <code>Object</code> - the config object with correct format.  
**See**: allowed format for input config:
 - {string} assume apiPrefix is source to match
   `'http://api.com'`
 - {object}
   `{'api':'http://afsfa.com'}`

   or (will be wrapped into array automatically)
   ```js
   {
     context: ['/auth', '/api'],
     target: 'http://localhost:3000',
   }
   ```
 - {array}
   ```
   [{
    context: ["/auth", "/api"],
    target: "http://localhost:3000",
   }].
   ```  

| Param | Type | Description |
| --- | --- | --- |
| proxies | <code>string</code> \| <code>object</code> \| <code>array</code> | input config, ref @see to see allowed format. |
| publicPath | <code>string</code> | the option set in webpack. |
| apiPrefix | <code>string</code> | default url to match when url is missing in config. |


