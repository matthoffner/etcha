# Etcha

Super basic javascript live editor now with monacode.

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
