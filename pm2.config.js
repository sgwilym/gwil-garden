module.exports = {
  apps: [
    {
      name: 'CSS',
      script: 'npm run css',
      ignore_watch: ['.'],
    },
    {
      name: 'Remix',
      script: 'npm run dev',
      ignore_watch: ['.'],
    },
  ],
};