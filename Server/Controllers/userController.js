const jwt = require("jsonwebtoken");
require("dotenv").config();
const secretKey = process.env.SECRET_KEY;
const bcrypt = require("bcrypt");
const fs = require("fs");
const { randomUUID } = require("crypto");
const dynamoDb = require("../dynamodb-config");
const s3 = require("../s3-config");

const userController = {
	register: async (req, res) => {
		try {
			const { email, password, username, role } = req.body;

			console.log(req.body);
			console.log(req.file);

			var params = {
				TableName: "Users",
				FilterExpression: "email = :emailValue",
				ExpressionAttributeValues: { ":emailValue": email },
			};

			const data = await dynamoDb.scan(params).promise();

			if (data.Items.length > 0) {
				throw new Error("User already exists");
			}

			const hashedPassword = await bcrypt.hash(password, 10);
			const UserID = randomUUID();
			const dynamoParams = {
				TableName: "Users",
				Item: {
					UserID: UserID,
					email: email,
					password: hashedPassword,
					username: username,
					role: role,
				},
			};

			const fileContent = fs.readFileSync(req.file.path);

			// Setting up S3 upload parameters
			const S3params = {
				Bucket: process.env.S3_BUCKET_NAME,
				Key: UserID, // File name you want to save as in S3
				Body: fileContent,
				ContentType: "image/png", // Set the content type based on your file
			};

			dynamoDb.put(dynamoParams, (err, data) => {
				if (err) {
					return res.status(500).send(err);
				} else {
					// Uploading files to the bucket
					s3.putObject(S3params, function (err, data) {
						if (err) {
							return res.status(500).send(err);
						}
						fs.unlink(req.file.path, (err) => {
							if (err) {
								console.error("Error deleting file:", err);
								return;
							}
							console.log("File successfully deleted");
						});
					});
				}
			});

			res.status(200).json({ message: "User registered successfully" });
		} catch (err) {
			res
				.status(400)
				.json({ error: "Failed to process request", details: err.message });
		}
	},
	login: async (req, res) => {
		try {
			const { email, password } = req.body;
			console.log(req.body)
			params = {
				TableName: "Users",
				FilterExpression: "email = :emailValue",
				ExpressionAttributeValues: {
					":emailValue": email,
				},
			};
			const data = await dynamoDb.scan(params).promise();

			if (data.Items.length == 0) {
				throw new Error("User doesn't exists");
			}

			const user = data.Items[0];
			const passwordMatch = await bcrypt.compare(password, user.password);

			if (!passwordMatch) {
				throw new Error("Incorrect password");
			}

			const currentDateTime = new Date();
			const expiresAt = new Date(currentDateTime + 1800000); // expire in 3 minutes
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
					res
						.cookie("token", token, {
							expires: expiresAt,
							withCredentials: true,
							httpOnly: false,
							SameSite: "none",
						})
						.status(200)
						.json({ message: "successfully logged in" });
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
