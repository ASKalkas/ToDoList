const jwt = require("jsonwebtoken");
require("dotenv").config();
const secretKey = process.env.SECRET_KEY;

module.exports = function authenticationMiddleware(req, res, next) {
	const cookie = req.cookies;

	// console.log(req.headers);

	if (!cookie) {
		return res.status(401).json({ message: "No Cookie provided" });
	}

	const token = cookie.token;
	if (!token) {
		next();
	} else {
		jwt.verify(token, secretKey, (error, decoded) => {
			if (error) {
				return res.status(403).json({ message: "Invalid token" });
			}

			// Attach the decoded user ID to the request object for further use
			// console.log(decoded.user)

			req.user = decoded.user;
			next();
		});
	}
};
