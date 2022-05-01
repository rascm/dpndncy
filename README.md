![dpndncy](https://github.com/rascm/dpndncy/blob/main/img/logo.png)

dpndncy is an asynchronous javascript and css loader.

Examples:

```js
const deps = new dpndncy();
deps.addScript('path/to.js');
deps.addStyle('path/to.css');
deps.addModule('path/to/es6module.js');

deps.addScript('path/to/jquery.js', {
  crossOrigin : 'anonymous'
});

deps.ready(function(result) {
 // will execute when dependencies are loaded
 $('body').css('color', 'green');
});
```
