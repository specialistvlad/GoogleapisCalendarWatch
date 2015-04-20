# Demo app for googleapis-calendar-watch
## Information about demo project and module
Registered domain [https://secure-mountain-3276.herokuapp.com](https://secure-mountain-3276.herokuapp.com)

### Task
1. We require a node.js module that has only one dependency, the googleapis module.
2. Auto authenticate to google
3. Callback that allow to know if calendar updated

### ./keys folder

This folder contains secrets information from google developer console

### How to generate *.pem key

First, you should have gotten a .p12 file and a secret to decrypt
the file when you created the service account in Google API console.
Run the following command to decrypt the p12 file.

```sh
$ openssl pkcs12 -in googleapi-privatekey.p12 -out googleapi-privatekey.pem -nocerts -nodes
```
## Heroku Documentation

### How to run
### Running Locally

Make sure you have [Node.js](http://nodejs.org/) and the [Heroku Toolbelt](https://toolbelt.heroku.com/) installed.

```sh
$ npm install
$ npm start
```

Your app should now be running on [localhost:5000](http://localhost:5000/).

### Deploying to Heroku

```sh
$ git push heroku master
```

For more information about using Node.js on Heroku, see these Dev Center articles:

- [Getting Started with Node.js on Heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
- [Heroku Node.js Support](https://devcenter.heroku.com/articles/nodejs-support)
- [Node.js on Heroku](https://devcenter.heroku.com/categories/nodejs)
- [Best Practices for Node.js Development](https://devcenter.heroku.com/articles/node-best-practices)
- [Using WebSockets on Heroku with Node.js](https://devcenter.heroku.com/articles/node-websockets)
