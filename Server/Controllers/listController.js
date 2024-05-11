const { randomUUID } = require('crypto');

const listController = {
  createProduct: async (req, res) => {
    const ItemID = randomUUID();
    const {title, description, date} = req.body;
    const params = {
        TableName: 'Items',
        Item: {
            ItemId: ItemID,
            title: title,
            description: description,
            date: date,
        }
    };
    dynamoDb.put(params, (err, data) => {
        if (err) {
            res.status(500).json(err);
        } else {
            res.status(200).json('Item added successfully', data);
        }
    });
  },
};
module.exports = listController;