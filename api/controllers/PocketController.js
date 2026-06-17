const ObjectId = require('mongodb').ObjectId;

module.exports = {
  getBalance: async function (req, res) {
    return res.ok({
      balance: req.pocket.balance,
    });
  },

  deposit: async function (req, res) {
    const { amount } = req.body;
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.badRequest({
        message: 'Deposit amount must be a positive number',
      });
    }
    try {
      const updatedPocket = await Pocket.getDatastore()
        .manager.collection(Pocket.tableName)
        .findOneAndUpdate(
          { _id: new ObjectId(req.pocket.id) },
          { $inc: { balance: amount } },
          { returnDocument: 'after' },
        );
      if (!updatedPocket) {
        return res.serverError({
          message: 'Failed to update pocket balance',
        });
      }
      return res.ok({
        balance: updatedPocket.balance,
      });
    } catch (err) {
      return res.serverError({
        message: `Failed to deposit: ${err.message}`,
      });
    }
  },

  withdraw: async function (req, res) {
    const { amount } = req.body;
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.badRequest({
        message: 'Withdrawal amount must be a positive number',
      });
    }
    if (req.pocket.balance < amount) {
      return res.badRequest({
        message: 'Insufficient balance',
      });
    }
    try {
      const updatedPocket = await Pocket.getDatastore()
        .manager.collection(Pocket.tableName)
        .findOneAndUpdate(
          {
            _id: new ObjectId(req.pocket.id),
            balance: { $gte: amount },
          },
          { $inc: { balance: -amount } },
          { returnDocument: 'after' },
        );
      if (!updatedPocket) {
        return res.serverError({
          message: 'Failed to update pocket balance',
        });
      }
      return res.ok({
        balance: updatedPocket.balance,
      });
    } catch (err) {
      return res.serverError({
        message: `Failed to withdraw: ${err.message}`,
      });
    }
  },

  transfer: async function (req, res) {
    const amountNum = Number(req.body.amount);
    const recipientPhone = req.body.recipientPhone;

    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return res.badRequest({ message: 'Invalid amount' });
    }

    try {
      const recipientCustomer = await Customer.findOne({ phone: recipientPhone });
      if (!recipientCustomer) {
        return res.badRequest({ message: 'Recipient not found' });
      }

      const recipientPocket = await Pocket.findOne({ customer: recipientCustomer.id });
      if (!recipientPocket) {
        return res.serverError({ message: 'Recipient pocket not found' });
      }

      const collection = Pocket.getDatastore().manager.collection(Pocket.tableName);

      const sender = await collection.findOneAndUpdate(
        {
          _id: new ObjectId(req.pocket.id),
          balance: { $gte: amountNum },
        },
        { $inc: { balance: -amountNum } },
        { returnDocument: 'after' },
      );
      if (!sender) {
        return res.badRequest({ message: 'Insufficient balance' });
      }

      const recipient = await collection.findOneAndUpdate(
        { _id: new ObjectId(recipientPocket.id) },
        { $inc: { balance: amountNum } },
        { returnDocument: 'after' },
      );

      if (!recipient) {
        // rollback đơn giản (best effort)
        await collection.updateOne(
          { _id: new ObjectId(req.pocket.id) },
          { $inc: { balance: amountNum } },
        );

        return res.serverError({ message: 'Transfer failed at recipient step' });
      }

      return res.ok({
        senderBalance: sender.balance,
        amountTransferred: amountNum,
      });
    } catch (err) {
      return res.serverError({
        message: `Failed to transfer: ${err.message}`,
      });
    }
  },
};
