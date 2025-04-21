const open = require('open');

setTimeout(() => {
    open('http://localhost:3000', {
      app: {
        name: 'chrome',
        arguments: ['--new-window']
      }
    });
  }, 2000);
