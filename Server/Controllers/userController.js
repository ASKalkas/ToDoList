const jwt = require("jsonwebtoken");
require("dotenv").config();
const secretKey = process.env.SECRET_KEY;
const bcrypt = require("bcrypt");
const fs = require("fs");
const { randomUUID } = require("crypto");
const dynamoDB = require("../dynamodb-config");
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

			const data = await dynamoDB.scan(params).promise();

			if (data.Items.length > 0) {
				throw new Error("User already exists");
			}

			const hashedPassword = await bcrypt.hash(password, 10);
			const UserID = randomUUID();
			const user = {
				UserID: UserID,
				email: email,
				password: hashedPassword,
				username: username,
				role: role,
			};
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
				Bucket: process.env.S3_BEFORE_BUCKET_NAME,
				Key: UserID, // File name you want to save as in S3
				Body: fileContent,
				ContentType: "image/png", // Set the content type based on your file
			};

			dynamoDB.put(dynamoParams, (err, data) => {
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

					res
						.status(200)
						.json({ message: "User registered successfully", user: user });
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
			const { email, password } = req.body;
			console.log(req.body);
			params = {
				TableName: "Users",
				FilterExpression: "email = :emailValue",
				ExpressionAttributeValues: {
					":emailValue": email,
				},
			};
			const data = await dynamoDB.scan(params).promise();

			if (data.Items.length == 0) {
				throw new Error("User doesn't exists");
			}

			const user = data.Items[0];
			const passwordMatch = await bcrypt.compare(password, user.password);

			if (!passwordMatch) {
				throw new Error("Incorrect password");
			}

			const currentDateTime = new Date();
			const expires = new Date(); // expire in 3 minutes
			expires.setHours(currentDateTime.getHours() + 3);
			const expiresAt = expires.toISOString();
			console.log(expiresAt);
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

			dynamoDB.put(params, (err, data) => {
				if (err) {
					res.status(500).send(err);
				} else {
					res
						.cookie("token", token, {
							maxAge: 3 * 60 * 60 * 1000,
							withCredentials: true,
							httpOnly: false,
							SameSite: "none",
						})
						.status(200)
						.send({ message: "successfully logged in", user: user });
				}
			});
		} catch (err) {
			res
				.status(400)
				.json({ error: "Failed to process request", details: err.message });
		}
	},
	logout: async (req, res) => {
		try {
			const { UserID } = req.query;
			const scanParams = {
				TableName: "Sessions",
				FilterExpression: "UserID = :UserIDValue",
				ExpressionAttributeValues: {
					":UserIDValue": UserID,
				},
			};

			dynamoDB.scan(scanParams, (scanErr, scanData) => {
				if (scanErr) {
					throw new Error(scanErr);
				} else {
					scanData.Items.forEach((item) => {
						const deleteParams = {
							TableName: "Sessions",
							Key: {
								SessionID: item.SessionID,
							},
						};

						dynamoDB.delete(deleteParams, (deleteErr, deleteData) => {
							if (deleteErr) {
								throw new Error(deleteErr);
							} else {
								console.log("Item deleted successfully:", deleteData);
							}
						});
					});
				}
			});
			res.status(200).json({ message: "Logged out successfully" });
		} catch (err) {
			res
				.status(400)
				.json({ error: "Failed to process request", details: err.message });
		}
	},
	getProfile: async (req, res) => {
		try {
			const { UserID } = req.query;

			const scanParams = {
				TableName: "Users",
				KeyConditionExpression: "UserID = :UserIDValue",
				ExpressionAttributeValues: {
					":UserIDValue": UserID,
				},
			};

			dynamoDB.query(scanParams, (err, data) => {
				if (err) {
					throw new Error(err);
				} else {
					const profile = data.Items[0];
					const params = {
						Bucket: process.env.S3_AFTER_BUCKET_NAME, // replace 'your-bucket-name' with the name of your S3 bucket
						Key: UserID, // replace 'your-image-key' with the key of the image you want to get
					};

					// Use the getObject method to get the image
					s3.getObject(params, function (err, data) {
						if (err) {
							return res.status(500).json({
								error: "Failed to process request",
								details: err,
							}); // an error occurred
						} else {
							const image = data.Body;
							const base64Image = new Buffer.from(image).toString("base64");
							profile.profilePic = base64Image;
							res.status(200).json({
								message: "Profile Obtained Successfully",
								profile: profile,
							});
						}
					});
				}
			});
		} catch (err) {
			res
				.status(400)
				.json({ error: "Failed to process request", details: err.message });
		}
	},
	updateProfile: async (req, res) => {
		try {
			const { UserID } = req.query;
			const { email, username, role } = req.body;
			let params;

			if (!role && req.user.role == "admin") {
				params = {
					TableName: "Users", // replace 'Users' with your actual table name
					Key: {
						UserID: UserID, // the ID of the user to update
					},
					ExpressionAttributeNames: {
						"#role": "role",
					},
					ExpressionAttributeValues: {
						":role": role,
					},
					UpdateExpression: "SET #role = :role",
					ReturnValues: "ALL_NEW", // returns the updated item
				};
			} else {
				params = {
					TableName: "Users", // replace 'Users' with your actual table name
					Key: {
						UserID: UserID, // the ID of the user to update
					},
					ExpressionAttributeNames: {
						"#email": "email",
						"#username": "username",
					},
					ExpressionAttributeValues: {
						":email": email,
						":username": username,
					},
					UpdateExpression: "SET #email = :email, #username = :username",
					ReturnValues: "ALL_NEW", // returns the updated item
				};
			}

			dynamoDB.update(params, function (err, data) {
				if (err) {
					throw new Error(err);
				} else {
					res.status(200).json({
						message: "Profile Updated Successfully",
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
	updateProfilePicture: async (req, res) => {
		try {
			const { UserID } = req.query;
			const fileContent = fs.readFileSync(req.file.path);

			// Setting up S3 upload parameters
			const S3params = {
				Bucket: process.env.S3_BEFORE_BUCKET_NAME,
				Key: UserID, // File name you want to save as in S3
				Body: fileContent,
				ContentType: "image/png", // Set the content type based on your file
			};

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

				res
					.status(200)
					.json({ message: "Photo Updated successfully", data: data });
			});
		} catch (err) {
			res
				.status(400)
				.json({ error: "Failed to process request", details: err.message });
		}
	},
	getUsers: async (req, res) => {
		try {
			const params = {
				TableName: "Users",
			};

			const data = await dynamoDB.scan(params).promise();
			const users = data.Items;

			res
				.status(200)
				.json({ message: "Users Obtained Successfully", data: users });
		} catch (err) {
			res
				.status(400)
				.json({ error: "Failed to process request", details: err.message });
		}
	},
	deleteUser: async (req, res) => {
		try {
			const { UserID } = req.query;

			const deleteParams = {
				TableName: "Users",
				Key: {
					UserID: UserID,
				},
			};

			await dynamoDB
				.delete(deleteParams, (deleteErr, deleteData) => {
					if (deleteErr) {
						throw new Error(deleteErr);
					} else {
						console.log("User deleted successfully:", deleteData);
						s3.listObjectVersions(
							{ Bucket: process.env.S3_BEFORE_BUCKET_NAME, Prefix: UserID },
							function (err, data) {
								if (err) {
									console.log(err, err.stack); // an error occurred
								} else {
									// For each version, including delete markers, delete the version
									for (let version of data.Versions) {
										let deleteParams = {
											Bucket: process.env.S3_BEFORE_BUCKET_NAME,
											Key: UserID,
											VersionId: version.VersionId,
										};

										s3.deleteObject(deleteParams, function (err, data) {
											if (err) {
												console.log(err, err.stack); // an error occurred
											} else {
												console.log("Deleted version: " + version.VersionId); // successful response
											}
										});
									}
								}
							}
						);
						s3.listObjectVersions(
							{ Bucket: process.env.S3_AFTER_BUCKET_NAME, Prefix: UserID },
							function (err, data) {
								if (err) {
									console.log(err, err.stack); // an error occurred
								} else {
									// For each version, including delete markers, delete the version
									for (let version of data.Versions) {
										let deleteParams = {
											Bucket: process.env.S3_AFTER_BUCKET_NAME,
											Key: UserID,
											VersionId: version.VersionId,
										};

										s3.deleteObject(deleteParams, function (err, data) {
											if (err) {
												console.log(err, err.stack); // an error occurred
											} else {
												console.log("Deleted version: " + version.VersionId); // successful response
											}
										});
									}
								}
							}
						);
					}
				})
				.promise();

			res.status(200).json({ message: "User Deleted Successfully" });
		} catch (err) {
			res
				.status(400)
				.json({ error: "Failed to process request", details: err.message });
		}
	},
};

module.exports = userController;
