/**
 * PingController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  ping: function (req, res) {
    return res.ok({
      time: new Date(),
      message: 'Pong!',
    });
  },
};
