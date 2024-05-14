const { randomUUID } = require("crypto");
const dynamoDB = require("../dynamodb-config");

const listController = {
	addItem: async (req, res) => {
		const ItemID = randomUUID();
		const { UserID } = req.query;
		const { title, description, dueDate } = req.body;
		try {
			const parsedDate = new Date(dueDate);
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
					dueDate: isoDateString,
					isDone: false,
					UserID: UserID,
				},
			};
			dynamoDB.put(params, (err, data) => {
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
			const { role } = req.user;
			var data;
			if (role == "admin") {
				const params = {
					TableName: "Items",
				};

				data = await dynamoDB.scan(params).promise();

			} else {
				const { UserID } = req.query;
				params = {
					TableName: "Items",
					FilterExpression: "UserID = :UserID",
					ExpressionAttributeValues: {
						":UserID": UserID,
					},
				};

				data = await dynamoDB.scan(params).promise();
			}
			
			data = data.Items;
			res
				.status(200)
				.json({ message: "Items Obtained Successfully", data: data });
		} catch (err) {
			res
				.status(400)
				.json({ error: "Failed to process request", details: err.message });
		}
	},
	updateItem: async (req, res) => {
		try {
			const { ItemID } = req.query;
			const { title, description, dueDate, isDone } = req.body;

			params = {
				TableName: "Items", // replace 'Users' with your actual table name
				Key: {
					ItemID: ItemID,
				},
				ExpressionAttributeNames: {
					"#title": "title",
					"#description": "description",
					"#dueDate": "dueDate",
					"#isDone": "isDone",
				},
				ExpressionAttributeValues: {
					":title": title,
					":description": description,
					":dueDate": dueDate,
					":isDone": isDone,
				},
				UpdateExpression:
					"SET #title = :title, #description = :description, #dueDate = :dueDate, #isDone = :isDone",
				ReturnValues: "ALL_NEW", // returns the updated item
			};

			dynamoDB.update(params, function (err, data) {
				if (err) {
					res
						.status(500)
						.json({ error: "Failed to process request", details: err.message });
				} else {
					res.status(200).json({
						message: "Item Updated Successfully",
						profile: data.Attributes,
					});
				}
			});
		} catch (err) {
			res
				.status(400)
				.json({ error: "Failed to process request", details: err.message });
		}
	},
	deleteItem: async (req, res) => {
		try {
			const { ItemID } = req.query;

			const deleteParams = {
				TableName: "Items",
				Key: {
					ItemID: ItemID,
				},
			};

			await dynamoDB.delete(deleteParams, (deleteErr, deleteData) => {
				if (deleteErr) {
					throw new Error(deleteErr);
				} else {
					console.log("Item deleted successfully:", deleteData);
				}
			});

			res.status(200).json({ message: "User Deleted Successfully" });
		} catch (err) {
			res
				.status(400)
				.json({ error: "Failed to process request", details: err.message });
		}
	},
};
module.exports = listController;
