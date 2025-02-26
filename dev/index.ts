import autohue from '../src/index';
autohue("https://cdn.pixabay.com/photo/2025/01/09/17/48/boat-9322331_640.jpg", {
  maxSize: 100,
  threshold: 1,
}).then((res) => {
  const demoEl = document.querySelector('.demo') as HTMLElement;
  demoEl!.style.background = `linear-gradient(to right, ${res.backgroundColor.left}, ${res.backgroundColor.right})`
})