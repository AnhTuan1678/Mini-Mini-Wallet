const ObjectId = require('mongodb').ObjectId;

module.exports = {
  getBalance: async function (req, res) {
    return res.ok({
      balance: req.pocket.balance,
    });
  },

  transfer: async function (req, res) {
    const amountNum = Number(req.body.amount);
    const recipientPhone = req.body.recipientPhone;

    // Kiểm tra số tiền có hợp lệ không
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return res.badRequest({ message: 'Số tiền chuyển phải là một số dương' });
    }

    const client = Pocket.getDatastore().manager.client;
    const session = client.startSession();

    try {
      let transactionResult;

      await session.withTransaction(async () => {
        // Kiểm tra người nhận và ví của họ
        const recipientCustomer = await Customer.findOne({
          phone: recipientPhone,
        });
        if (!recipientCustomer) {
          throw new Error('Người nhận không tồn tại');
        }
        const recipientPocket = await Pocket.findOne({
          customer: recipientCustomer.id,
        });
        if (!recipientPocket) {
          throw new Error('Không tìm thấy ví người nhận');
        }
        if (recipientPocket.id === req.pocket.id) {
          throw new Error('Không thể chuyển tiền cho chính mình');
        }

        const collection = Pocket.getDatastore().manager.collection(
          Pocket.tableName,
        );

        // Trừ tiền sender
        const sender = await collection.findOneAndUpdate(
          {
            _id: new ObjectId(req.pocket.id),
            balance: { $gte: amountNum },
          },
          { $inc: { balance: -amountNum } },
          { returnDocument: 'after' },
        );
        if (!sender) {
          throw new Error('Số dư không đủ');
        }

        // Cộng tiền receiver
        const recipient = await collection.findOneAndUpdate(
          { _id: new ObjectId(recipientPocket.id) },
          { $inc: { balance: amountNum } },
          { returnDocument: 'after' },
        );
        if (!recipient) {
          throw new Error('Lỗi khi cộng tiền người nhận');
        }

        // Ghi lại transaction
        transactionResult = await Transaction.create({
          type: 'transfer',
          fromPocket: req.pocket.id,
          fromPhone: req.user.phone,
          fromBalanceBefore: sender.balance + amountNum,
          fromBalanceAfter: sender.balance,
          toPocket: recipientPocket.id,
          toPhone: recipientCustomer.phone,
          toBalanceBefore: recipient.balance - amountNum,
          toBalanceAfter: recipient.balance,
          amount: amountNum,
          status: 'success',
        }).fetch();
      });

      await session.endSession();

      return res.ok({
        senderBalance: transactionResult.fromBalanceAfter,
        transaction: transactionResult,
      });
    } catch (err) {
      await session.endSession();
      sails.log.error('Lỗi khi chuyển tiền:', err.message);
      return res.badRequest({
        message: err.message,
      });
    }
  },
};
