const ObjectId = require('mongodb').ObjectId;

module.exports = {
  getBalance: async function (req, res) {
    return res.ok({
      balance: req.pocket.balance,
    });
  },

  // deposit: async function (req, res) {
  //   const { amount } = req.body;
  //   if (!Number.isFinite(amount) || amount <= 0) {
  //     return res.badRequest({
  //       message: 'Số tiền nạp phải là một số dương',
  //     });
  //   }
  //   try {
  //     const updatedPocket = await Pocket.getDatastore()
  //       .manager.collection(Pocket.tableName)
  //       .findOneAndUpdate(
  //         { _id: new ObjectId(req.pocket.id) },
  //         { $inc: { balance: amount } },
  //         { returnDocument: 'after' },
  //       );
  //     if (!updatedPocket) {
  //       return res.serverError({
  //         message: 'Lỗi khi cập nhật số dư ví',
  //       });
  //     }
  //     const transaction = await Transaction.create({
  //       type: 'deposit',
  //       toPocket: req.pocket.id,
  //       toPhone: req.pocket.customer.phone,
  //       toBalanceAfter: updatedPocket.balance,
  //       toBalanceBefore: updatedPocket.balance - amount,
  //       amount: amount,
  //     }).fetch();
  //     return res.ok({
  //       balance: updatedPocket.balance,
  //       transaction,
  //     });
  //   } catch (err) {
  //     sails.log.error('Lỗi nạp tiền:', err.message);
  //     return res.serverError({
  //       message: 'Lỗi nạp tiền: ' + err.message,
  //       error: err.message,
  //     });
  //   }
  // },

  // withdraw: async function (req, res) {
  //   const { amount } = req.body;
  //   if (!Number.isFinite(amount) || amount <= 0) {
  //     return res.badRequest({
  //       message: 'Số tiền rút phải là một số dương',
  //     });
  //   }
  //   if (req.pocket.balance < amount) {
  //     return res.badRequest({
  //       message: 'Số dư không đủ để thực hiện giao dịch rút tiền',
  //     });
  //   }
  //   try {
  //     const updatedPocket = await Pocket.getDatastore()
  //       .manager.collection(Pocket.tableName)
  //       .findOneAndUpdate(
  //         {
  //           _id: new ObjectId(req.pocket.id),
  //           balance: { $gte: amount },
  //         },
  //         { $inc: { balance: -amount } },
  //         { returnDocument: 'after' },
  //       );
  //     if (!updatedPocket) {
  //       return res.serverError({
  //         message: 'Lỗi khi cập nhật số dư ví',
  //       });
  //     }
  //     const transaction = await Transaction.create({
  //       type: 'withdraw',
  //       fromPocket: req.pocket.id,
  //       fromPhone: req.pocket.customer.phone,
  //       fromBalanceAfter: updatedPocket.balance,
  //       fromBalanceBefore: updatedPocket.balance + amount,
  //       amount: amount,
  //     }).fetch();
  //     return res.ok({
  //       balance: updatedPocket.balance,
  //       transaction,
  //     });
  //   } catch (err) {
  //     sails.log.error('Lỗi rút tiền:', err.message);
  //     return res.serverError({
  //       message: 'Lỗi rút tiền: ' + err.message,
  //       error: err.message,
  //     });
  //   }
  // },

  transfer: async function (req, res) {
    const amountNum = Number(req.body.amount);
    const recipientPhone = req.body.recipientPhone;

    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return res.badRequest({ message: 'Số tiền chuyển phải là một số dương' });
    }

    try {
      const recipientCustomer = await Customer.findOne({
        phone: recipientPhone,
      });
      if (!recipientCustomer) {
        return res.notFound({ message: 'Người nhận không tồn tại' });
      }

      const recipientPocket = await Pocket.findOne({
        customer: recipientCustomer.id,
      });
      if (!recipientPocket) {
        return res.serverError({ message: 'Không tìm thấy ví của người nhận' });
      }

      const collection = Pocket.getDatastore().manager.collection(
        Pocket.tableName,
      );

      const sender = await collection.findOneAndUpdate(
        {
          _id: new ObjectId(req.pocket.id),
          balance: { $gte: amountNum },
        },
        { $inc: { balance: -amountNum } },
        { returnDocument: 'after' },
      );
      if (!sender) {
        return res.badRequest({
          message: 'Số dư không đủ để thực hiện giao dịch chuyển tiền',
        });
      }

      const recipient = await collection.findOneAndUpdate(
        { _id: new ObjectId(recipientPocket.id) },
        { $inc: { balance: amountNum } },
        { returnDocument: 'after' },
      );

      if (!recipient) {
        await collection.updateOne(
          { _id: new ObjectId(req.pocket.id) },
          { $inc: { balance: amountNum } },
        );

        const transaction = await Transaction.create({
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
          status: 'failed',
        }).fetch();
        return res.serverError({
          message: 'Lỗi khi chuyển tiền',
          transaction,
        });
      }

      const transaction = await Transaction.create({
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
      }).fetch();

      return res.ok({
        senderBalance: sender.balance,
        transaction,
      });
    } catch (err) {
      sails.log.error('Lỗi khi chuyển tiền:', err.message);
      return res.serverError({
        message: 'Lỗi khi chuyển tiền: ' + err.message,
      });
    }
  },
};
