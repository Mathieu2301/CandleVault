module.exports = {
  apps: [{
    name: 'CandleVault',
    script: 'main.js',
    watch: '.',
  }],

  deploy: {
    production: {
      user: 'main',
      host: '192.168.0.1',
      ref: 'origin/main',
      repo: 'git@github.com:Mathieu2301/CandleVault.git',
      path: '/home/main/CandleVault',
      ssh_options: 'StrictHostKeyChecking=no',
      'pre-deploy-local': '',
      'post-deploy': 'cd server && npm i && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
    },
  },
};
