# etcha

Live edit javascript IDE, no server required:

```js
<script type="module">
    setInterval(() => {
        const savedCode = document.getElementById("editor").textContent;
        const encodedJs = encodeURIComponent(savedCode);
        const dataUri = `data:text/javascript;charset=utf-8,${encodedJs}`;
        import(dataUri);
    }, 100);
</script>
```

## Usage

Just open index.html
