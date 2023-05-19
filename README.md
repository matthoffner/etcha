# Etcha

javascript live monacode editor with experimental https://github.com/xenova/transformers.js support.

[Demo here](https://etcha-code.netlify.app/)

Basically this:

```js
const initialValue = editor.getValue();
const encodedJs = encodeURIComponent(initialValue);
const dataUri = "data:text/javascript;charset=utf-8," + encodedJs;
import(dataUri);
```

## Credits

* [monacode](https://github.com/lukejacksonn/monacode)

## License

Licensed under the [MIT](https://github.com/Microsoft/monaco-editor/blob/master/LICENSE.md) License.
