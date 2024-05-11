const jwt = require("jsonwebtoken");
require("dotenv").config();
const secretKey = process.env.SECRET_KEY;
const bcrypt = require("bcrypt");
const { randomUUID } = require("crypto");
const dynamoDb = require("../dynamodb-config");

const userController = {
	register: async (req, res) => {
		try {
			const { username, password, displayName, role /*, profilePicture*/ } =
				req.body;

			var params = {
				TableName: "Users",
				FilterExpression: "username = :usernameValue",
				ExpressionAttributeValues: { ":usernameValue": username },
			};
			
            const data = await dynamoDb.scan(params).promise();

			if (data.Items.length > 0) {
				throw new Error("User already exists");
			}

			const hashedPassword = await bcrypt.hash(password, 10);
			const UserID = randomUUID();
			params = {
				TableName: "Users",
				Item: {
					UserID: UserID,
					username: username,
					password: hashedPassword,
					displayName: displayName,
					role: role,
				},
			};

			dynamoDb.put(params, (err, data) => {
				if (err) {
					res.status(500).send(err);
				} else {
					res.status(200).json({ message: "User registered successfully" });
				}
			});
		} catch (err) {
			res
				.status(400)
				.json({ error: "Failed to process request", details: err.message });
		}
	},
	login: async (req, res) => {
		try {
			const { username, password } = req.body;
			params = {
				TableName: "Users",
				FilterExpression: "username = :username",
				ExpressionAttributeValues: {
					":username": username,
				},
			};
			const data = await dynamoDb.scan(params).promise();

            console.log(data)

			if (data.Items.length == 0) {
				throw new Error("User doesn't exists");
			}

			const user = data.Items[0];
			console.log(data);
			const passwordMatch = await bcrypt.compare(password, user.password);

			if (!passwordMatch) {
				throw new Error("Incorrect password");
			}

			const currentDateTime = new Date();
			const expiresAt = new Date(+currentDateTime + 1800000); // expire in 3 minutes
			// Generate a JWT token
			const token = jwt.sign(
				{ user: { userId: user.UserID, role: user.role } },
				secretKey,
				{
					expiresIn: 3 * 60 * 60,
				}
			);
			const SessionID = randomUUID();
			params = {
				TableName: "Sessions",
				Item: {
					SessionID: SessionID,
					UserID: user.UserID,
					token: token,
					expiresAt: expiresAt,
				},
			};

			dynamoDb.put(params, (err, data) => {
				if (err) {
					res.status(500).send(err);
				} else {
					res.cookie("token", token, {
                        expires: expiresAt,
                        withCredentials: true,
                        httpOnly: false,
                        SameSite:'none'
                      }).status(200).json({ message: "successfully logged in" });
				}
			});
		} catch (err) {
			res
				.status(400)
				.json({ error: "Failed to process request", details: err.message });
		}
	},
};

module.exports = userController;
