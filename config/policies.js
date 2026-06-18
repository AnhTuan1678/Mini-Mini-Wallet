module.exports.policies = {
  '*': false,

  CustomerController: {
    create: true,
    login: true,
    getPocket: ['isLoggedIn', 'attachPocket'],
  },

  PocketController: {
    getBalance: ['isLoggedIn', 'attachPocket'],
    // deposit: ['isLoggedIn', 'attachPocket'],
    // withdraw: ['isLoggedIn', 'attachPocket'],
    transfer: ['isLoggedIn', 'attachPocket'],
  },

  TransactionController: {
    getTransactions: ['isLoggedIn', 'attachPocket'],
  },
};
