/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {
  '/': { view: 'pages/homepage' },

  'GET /ping': 'PingController.ping',
  'POST /customer/create': 'CustomerController.create',
  'POST /customer/login': 'CustomerController.login',
  'POST /customer/balance': 'CustomerController.getBalance',
};
