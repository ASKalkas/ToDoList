const { randomUUID } = require("crypto");
const dynamoDb = require("../dynamodb-config");

const listController = {
	addItem: async (req, res) => {
		const ItemID = randomUUID();
		const { title, description, date } = req.body;
		try {
			const parsedDate = new Date(date);
			if (isNaN(parsedDate)) {
				throw new Error("Invalid date format");
			}
			const isoDateString = parsedDate.toISOString();
			const params = {
				TableName: "Items",
				Item: {
					ItemID: ItemID,
					title: title,
					description: description,
					date: isoDateString,
				},
			};
			dynamoDb.put(params, (err, data) => {
				if (err) {
					res.status(500).send(err);
				} else {
					res.status(200).json({ message: "Item added successfully" });
				}
			});
		} catch (err) {
			res
				.status(400)
				.json({ error: "Failed to process request", details: err.message });
		}
	},
	getAll: async (req, res) => {
		try {
			const { role } = req.user.role;
            var data;
            if(role == "admin"){
                const params = {
                    TableName: 'Items'
                };

                data = await dynamoDb.scan(params).promise();
            }else{
                params = {
                    TableName: "Items",
                    FilterExpression: "UserID = :UserID",
                    ExpressionAttributeValues: {
                        ":UserID": req.user.userId,
                    },
                };

                data = await dynamoDb.scan(params).promise();
            }

            res.status(200).json({message: "Items Obtained Successfully", data: data})
		} catch (err) {
			res
				.status(400)
				.json({ error: "Failed to process request", details: err.message });
		}
	},
};
module.exports = listController;
