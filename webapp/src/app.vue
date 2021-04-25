<template>
  <router-view/>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Questrial&display=swap');

:root {
  --color1: #dddddd;
  --color2: #131722;
  --color3: #1e222d;
  --color4: #434651;
  --color5: #fe4282;
  --color6: #fc6f0f;
  --color7: #1a6dc5;
  --color7-s: #208fe6;
  --color8: #0da371;
  --color8-s: #1ab581;
  --font: #ffffff;
  --lightFont: #e7e7e7;
  --green: #0da371;
  --yellow: #ecb317;
  --orange: #fc6f0f;
  --red: #e03737;
}

.redBg { background-color: var(--red) !important; }
.greenBg { background-color: var(--green) !important; }
.greyBg { background-color: var(--color4) !important; }

body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  font-size: 17px;
  margin: 0;
  background-color: var(--color2);
}

body * {
  color: var(--font);
  font-family: Trebuchet MS, roboto, ubuntu, sans-serif;
  font-family: Questrial, Arial, sans-serif;
  transition-duration: 100ms;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
  -webkit-appearance: none;
  text-shadow: 0 0 2px #00000020;
}

body *:not(input),
body input[type=submit] { user-select: none }

::placeholder { color: #838383 }

.container {
  width: fit-content;
  margin: 0 auto;
  padding: 20px;
}

.container.withHead { margin-top: 60px }
.container.full { width: auto }

.content {
  margin: 0 auto;
  max-width: 500px;
}

.title {
  font-size: 30px;
  margin-bottom: 30px;
}

.title svg {
  fill: var(--lightFont);
  width: 80px;
  background-color: var(--color7);
  border-radius: 25px;
  padding: 10px;
  margin-bottom: 15px;
}

.fullpage {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  overflow-y: auto;
  display: grid;
  align-items: center;
  z-index: 100;
  background-color: var(--color3);
}

.fullpage.dark { background-color: var(--color2) }

.tabs {
  display: grid;
  grid-template-columns: 50% 50%;
  max-width: 700px;
  margin: 0 auto;
  align-items: center;
}

.tab {
  padding: 10px 0;
  display: grid;
  align-items: center;
  background-color: var(--color2);
  opacity: 0.6;
}

.tab.selected {
  background-color: var(--color3);
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  opacity: 1;
  cursor: default;
}

.tab:not(.selected) { cursor: pointer }

.block {
  background-color: var(--color3);
  margin: 0 auto;
  padding: 20px;
  max-width: 700px;
  border-radius: 5px;
}

.fullpage.dark .block { background-color: var(--color3) }

.block.small { max-width: 500px }

form {
  display: grid;
}

.inputLine {
  border: 1px solid var(--color4);
  border-radius: 3px;
  margin: 2px 0;
  display: grid;
  grid-template-columns: 50px auto;
  background-color: var(--color3);
  max-width: 850px;
}

.inputLine.triple {
  grid-template-columns: 70px auto 50px;
}

.inputLine > select:first-child,
.inputLine > .text:first-child {
  border-right: 1px solid var(--color4);
}

.inputLine.textInput > *:first-child { font-size: 15px }

.inputLine > svg {
  width: 50px;
  height: calc(100% - 10px);
  margin: 5px 0;
  fill: var(--color1);
  padding: 0 13px;
}

.textInput {
  grid-template-columns: min-content auto 45px;
}

.textInput .text {
  white-space: nowrap;
  display: grid;
  align-items: center;
  padding: 0 10px;
}

.textInput input {
  min-width: 0;
  padding-right: 0;
  user-select: all;
  pointer-events: all;
  overflow: hidden;
}

.textInput input { cursor: text }
.textInput svg { cursor: pointer }

input, select, .button {
  background-color: transparent;
  border: none;
  max-width: 800px;
  min-width: 0;
  padding: 10px;
  font-size: 16px;
  outline: none;
  display: grid;
  align-items: center;
}

select { cursor: pointer }

option { background-color: var(--color3) }

.wIcon { grid-template-columns: min-content auto }

input[type=submit], .button {
  margin: 3px 0;
  background-color: var(--color4);
  cursor: pointer;
  border-radius: 4px;
  opacity: 0.8;
}

.disabled, :disabled {
  opacity: 0.7;
  pointer-events: none;
}

.button:hover { opacity: 1 }

input[type=submit], .button.green { background-color: var(--color8) }
input[type=submit]:hover, .button.green:hover { background-color: var(--color8-s) }

.button > svg {
  width: 30px;
  fill: var(--color1);
  margin-right: 15px;
  padding: 3px;
}

.button.bigRed {
  grid-template-columns: auto;
  background-color: var(--red);
  max-width: 400px;
  margin: 20px auto 10px;
}

.minText {
  margin-top: 10px;
  font-size: 15px;
  text-decoration: underline;
  opacity: 0.7;
  cursor: pointer;
}

.msgBlock.error { background-color: var(--red) }
.msgBlock.warning { background-color: var(--orange) }
.msgBlock.success { background-color: var(--green) }

.msgBlock {
  margin: 5px 0;
  padding: 10px;
  color: var(--lightFont);
  display: flex;
  align-items: center;
  padding-right: 17px;
  transition-duration: 300ms;
  height: fit-content;
  cursor: pointer;
}

.msgBlock, .msgBlock * {
  transition-duration: 400ms;
  transition-timing-function: cubic-bezier(0.71, -0.02, 0.15, 1.6);
}

.msgBlock:not(.open), .msgBlock:not(.open) * {
  transition-duration: 1000ms;
  margin: 0;
  padding: 0;
  opacity: 0;
  font-size: 0;
  pointer-events: none;
}

.msgBlock:not(.open) svg {
  height: 0;
}

.msgBlock svg {
  height: 40px;
  fill: var(--lightFont);
  margin-right: 10px; /* Flex gap is not supported by many browsers */
}

.controls {
  display: grid;
  position: fixed;
  grid-template: min-content auto / 0 auto;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  pointer-events: none;
}

.statusBar {
  display: grid;
  grid-template-columns: min-content auto;
  align-content: center;
  background-color: var(--color3);

  grid-column: 1 / 3;
  z-index: 1000;
  pointer-events: all;
  box-shadow: var(--color2) 3px 1px 6px;
}

body.noScroll .statusBar {
  box-shadow: var(--color2) 300px  1px 6px;
}

.statusBar .path {
  display: flex;
}

.statusBar .path .step {
  color: var(--color1);
  font-size: 18px;
  display: grid;
  grid-template-columns: auto auto;
  align-content: center;
  cursor: pointer;
  transition-duration: 400ms;
}

.statusBar .path .step svg {
  width: 6px;
  height: 100%;
  margin: 0 10px;
  fill: var(--lightFont);
}

.statusBar > svg {
  stroke: var(--color7-s);
  height: 55px;
  padding: 10px 15px;
}

.sideMenu {
  height: 100%;
  width: calc(100vw + 50px);
  display: grid;
  max-width: 400px;
  grid-template-rows: min-content auto;
  background-color: var(--color3);
  padding-left: 100px;
  transition-duration: 500ms;
  transition-timing-function: cubic-bezier(0.7, -0.1, 0, 1.1);
  z-index: 200;
  overflow-y: auto;
  pointer-events: all;
}

.sideMenu.open {
  box-shadow: var(--color2) 3px 1px 6px;
  transform: translateX(-100px);
  border: none;
}

.sideMenu .noItems {
  font-size: 20px;
  height: 90%;
  display: grid;
  align-items: center;
}

.rowButton {
  opacity: 0.8;
  cursor: pointer;
  background-color: var(--color3);
}

.rowButton > div > svg {
  fill: var(--color1);
  height: 100%;
  width: 100%;
  padding: 7px;
}

.rowButton > div {
  display: grid;
  text-align: left;
  line-height: 60px;
  padding-left: 10px;
  padding-right: 5px;
  font-size: 18px;
  border: 1px solid #3a3d48;
  border-radius: 3px;
}

.rowButton.active {
  opacity: 0.9;
}

.rowButton.active > div { opacity: 1 }

.rowButton > iframe {
  height: 90px;
  width: 100%;
  pointer-events: none;
}

.rowSeparator {
  height: 2px;
  background-color: var(--color4);
  margin: 2px 0;
}

.topButton {
  grid-template-columns: 38px auto 23px !important;
  padding-right: 10px !important;
}

.blur {
  transition-duration: 500ms;
  pointer-events: none;
  z-index: -1;
}

table {
  margin: 0 auto;
  width: 100%;
  min-width: 300px;
  max-width: 800px;
  border-spacing: 1px 2px;
}

tr {
  height: 50px;
  background-color: var(--color7);
  opacity: 0.9;
}

tr:hover { opacity: 1 }

td { padding: 0 10px }

#captcha {
  display: flex;
  justify-content: center;
  margin: 5px 0;
}

.inputLine.hidden,
.anim.hidden,
.hidden .anim,
.hidden input,
.minText.hidden,
.block.hidden, .block.hidden * {
  transition-duration: 200ms;
  margin: 0;
  padding: 0;
  font-size: 0;
  height: 0;
  border: 0;
  pointer-events: none;
}

.separator { height: 25px }
.clickable { cursor: pointer }

@media screen and (max-width: 300px) {
  .statusBar .path *:not(.step:last-child) {
    font-size: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
    opacity: 0;
    width: 0;
  }

  .statusBar .path .step:last-child {
    font-size: 20px;
  }
}

@media screen and (max-width: 380px) {
  .statusBar .path .step:first-child {
    font-size: 0 !important;
    padding: 0;
  }

  .container.withHead { margin-top: 55px }
  .container { padding: 10px 6px }
  .block { padding: 15px }
  .separator { height: 15px }
}

@media screen and (max-width: 999px) {
  .sideMenu {
    transform: translateX(-100%);
  }

  .blur.active {
    /* backdrop-filter: blur(5px); */
    backdrop-filter: brightness(0.8);
    cursor: pointer;
    pointer-events: all;
  }

  body.noScroll {
    overflow-y: hidden;
  }
}

@media screen and (min-width: 1000px) {
  .statusBar > svg {
    opacity: 0;
    width: 0;
    padding: 10px;
    pointer-events: none;
  }

  .sideMenu {
    transform: translateX(-100px);
  }
}

</style>
