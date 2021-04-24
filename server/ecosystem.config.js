module.exports = {
  apps: [
    {
      name: 'candlevault-worker-default',
      script: './main.js',
      max_memory_restart: '100M',
    },
  ],
};
