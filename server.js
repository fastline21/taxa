const express = require("express");
const axios = require("axios");
const pdf2base64 = require("pdf-to-base64");
const fileUpload = require("express-fileupload");
const path = require("path");
const fs = require("fs");

// Load env file
require("dotenv").config();

// Init app
const app = express();

// Init fileupload
app.use(
	fileUpload({ useTempFiles: true, tempFileDir: path.join(__dirname, "tmp") })
);

// Middleware
app.use(express.json({ extended: true }));

// Register api
app.post("/register", async (req, res) => {
	const { name, email, mobile, positionApplied, source } = req.body;

	if (
		name === "" ||
		name === undefined ||
		name === null ||
		email === "" ||
		email === undefined ||
		email === null ||
		mobile === "" ||
		mobile === undefined ||
		mobile === null ||
		positionApplied === "" ||
		positionApplied === undefined ||
		positionApplied === null ||
		source === "" ||
		source === undefined ||
		source === null
	) {
		return res
			.status(404)
			.json({ message: "Please fill in all the required fields." });
	}

	// Request config
	const config = {
		headers: {
			"Content-Type": "application/json",
		},
	};

	// Request body
	const body = {
		Name: name,
		Email: email,
		Mobile: mobile,
		PositionApplied: positionApplied,
		Source: source,
	};

	try {
		// Response data
		const response = axios.post(
			"https://goodmorning-axa-dev.azure-api.net/register",
			body,
			config
		);
		res.send(response.data);
	} catch (error) {
		console.error(error.message);
		res.status(500).send("Server Error");
	}
});

// Upload api
app.post("/upload", async (req, res) => {
	// Upload resume
	const file = req.files;

	if (file === "" || file === undefined || file === null) {
		return res
			.status(404)
			.json({ message: "Please fill in all the required fields." });
	}

	// Upload Dir
	const uploadsDir = path.join(__dirname, "uploads", file.resume.name);
	if (!fs.existsSync("uploads")) {
		fs.mkdirSync("uploads");
	}

	// Move resume to uploads dir
	file.resume.mv(uploadsDir, (err) => {
		if (err) return res.status(500).send(err);
	});

	// Get base64 of your resume
	const pdfBase64 = pdf2base64(uploadsDir)
		.then((response) => {
			return response;
		})
		.catch((error) => {
			return res.send(error);
		});
	const base64 = await pdfBase64;

	// Request config
	const config = {
		headers: {
			"Content-Type": "application/json",
			"x-axa-api-key": process.env.AXA_API,
		},
	};

	// Request body
	const body = {
		file: {
			mime: "application/pdf",
			data: "base64-data=" + base64,
		},
	};

	try {
		// Response data
		const response = await axios.post(
			"https://goodmorning-axa-dev.azure-api.net/upload",
			body,
			config
		);
		res.send(response.data);
	} catch (error) {
		console.error(error.message);
		res.status(500).send("Server Error");
	}
});

// Schedule api
app.post("/schedule", async (req, res) => {
	const { proposedDate, proposedTime, online } = req.body;

	if (
		proposedDate === "" ||
		proposedDate === undefined ||
		proposedDate === null ||
		proposedTime === "" ||
		proposedTime === undefined ||
		proposedTime === null ||
		online === "" ||
		online === undefined ||
		online === null
	) {
		return res
			.status(404)
			.json({ message: "Please fill in all the required fields." });
	}
	// Request config
	const config = {
		headers: {
			"Content-Type": "application/json",
			"x-axa-api-key": process.env.AXA_API,
		},
	};

	// Request body
	const body = {
		ProposedDate: proposedDate,
		ProposedTime: proposedTime,
		Online: online,
	};

	try {
		// Response data
		const response = await axios.post(
			"https://goodmorning-axa-dev.azure-api.net/schedule",
			body,
			config
		);
		res.send(response.data);
	} catch (error) {
		console.error(error.message);
		res.status(500).send("Server Error");
	}
});

// Port
const port = 5000;

// App run
app.listen(port, () => console.log(`Server running on port:${port}`));
