module.exports.routes = {
  'POST /customer/create': 'CustomerController.create',
  'POST /customer/login': 'CustomerController.login',
  'POST /customer/pocket': 'CustomerController.getPocket',

  'POST /pocket/balance': 'PocketController.getBalance',
  'POST /pocket/transfer': 'PocketController.transfer',

  'POST /transaction/history': 'TransactionController.getTransactions',
};
