export default function onSwipe(cb) {
  let xDown = null;
  let yDown = null;

  function handleTouchStart(evt) {
    xDown = evt.touches[0].clientX;
    yDown = evt.touches[0].clientY;
  }

  function handleTouchMove(evt) {
    if (!xDown || !yDown) return;

    const xDiff = xDown - evt.touches[0].clientX;
    const yDiff = yDown - evt.touches[0].clientY;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      cb(xDiff > 0 ? 'left' : 'right', Math.abs(xDiff));
    } else {
      cb(yDiff > 0 ? 'up' : 'down', Math.abs(yDiff));
    }

    xDown = null;
    yDown = null;
  }

  document.addEventListener('touchstart', handleTouchStart, false);
  document.addEventListener('touchmove', handleTouchMove, false);
}
