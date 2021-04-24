module.exports = {
  object: {
    encode(o = {}) {
      let e = Object.keys(o).map((k) => `${k}\x01${o[k]}`).join('\x00').split('');
      let m = null;
      e.forEach((c) => { m = (!m || m > c) ? c.charCodeAt(0) : m; });
      e = e.map((c) => String.fromCharCode(c.charCodeAt(0) - m)).join('');

      return `${String.fromCharCode(m)}${e}`;
    },

    decode(s) {
      const m = s[0].charCodeAt(0);
      let e = s.substring(1).split('');
      e = e.map((c) => String.fromCharCode(c.charCodeAt(0) + m)).join('');
      const o = {};
      e.split('\x00').forEach((l) => {
        const p = l.split('\x01');
        [, o[p[0]]] = p;
      });

      return o;
    },
  },

  array: {
    encode(a = []) {
      let e = a.join('\x00').split('');
      let m = null;
      e.forEach((c) => { m = (!m || m > c) ? c.charCodeAt(0) : m; });
      e = e.map((c) => String.fromCharCode(c.charCodeAt(0) - m)).join('');

      return `${String.fromCharCode(m)}${e}`;
    },

    decode: (s) => s.substring(1).split('')
      .map((c) => String.fromCharCode(c.charCodeAt(0) + s[0].charCodeAt(0)))
      .join('')
      .split('\x00'),
  },

  string: {
    encode(s = '') {
      let e = s.split('');
      let m = null;
      e.forEach((c) => { m = (!m || m > c) ? c.charCodeAt(0) : m; });
      e = e.map((c) => String.fromCharCode(c.charCodeAt(0) - m)).join('');

      return `${String.fromCharCode(m)}${e}`;
    },

    decode: (s = '') => s.substring(1).split('')
      .map((c) => String.fromCharCode(c.charCodeAt(0) + s[0].charCodeAt(0)))
      .join(''),
  },
};
