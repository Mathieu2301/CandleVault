<!-- eslint-disable -->
<template>
  <svg
    viewBox="0 0 32 42"
    :class="{ active }"
  >
    <g transform="matrix(1,0,0,1,-438.286,-264.004)">
      <g transform="matrix(-1,-1.22465e-16,1.22465e-16,-1,858.787,564.935)">
        <path id="top" d="M390,270L420,270L420,270C420,270 420.195,250.19 405,265C389.805,279.81 390,279.967 390,279.967"/>
      </g>
      <g transform="matrix(-1,-2.44929e-16,-2.44929e-16,1,858.786,5)">
        <path id="bottom" d="M390,270L420,270L420,270C420,270 420.195,250.19 405,265C389.805,279.81 390,279.967 390,279.967"/>
      </g>
      <g transform="matrix(-1,-1.22465e-16,1.22465e-16,-1,858.787,569.935)">
        <path d="M390,284.967L420,284.967"/>
      </g>
    </g>
  </svg>
</template>

<script>
export default {
  name: 'MenuButton',

  props: {
    active: Boolean,
  },
};
</script>

<style scoped>
svg {
  cursor: pointer;
}

svg path {
  fill: none;
  stroke-width: 3px;
}

#top, #bottom {
  stroke-dasharray: 30, 75.39;
  transition: all 800ms cubic-bezier(0.4, -0.5, 0, 1.25);
}

svg.active #top,
svg.active #bottom {
  stroke-dasharray: 75.39;
  stroke-dashoffset: -60;
}

svg {
  transform: rotate(0deg);
  transition: 500ms cubic-bezier(0.6, -0.25, 0.2, 1.15);
}

svg.active {
  transform: rotate(540deg);
  transition-duration: 800ms;
}

.rocket #top { stroke-dasharray: 30, 88 }
</style>
