const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

const PORT = 3000;

const isFolder = async filePath => {
	try {
		const stats = fs.statSync(filePath);
		return await stats.isDirectory();
	} catch (err) {
		return false;
	}
};

app.use(express.static(path.join(__dirname, 'public')));

app.get('/files', (req, res) => {
	const dir = req.query.dir;

	if (!dir) {
		return res.status(400).json({ error: 'Missing "dir" query parameter' });
	}

	try {
		const fullPath = path.join(__dirname, dir);

		fs.readdir(fullPath, (err, files) => {
			if (err) {
				return res.status(500).json({ error: 'Unable to read directory' });
			}
			const formattedFiles = [];
			for (const file of files) {
				formattedFiles.push({
					name: file,
					isFolder: isFolder(file),
					path: dir + file,
				});
			}
			res.json({ formattedFiles });
		});
	} catch (err) {
		res
			.status(500)
			.json({ error: 'An unexpected error occurred', details: err.message });
	}
});

app.get('/file', (req, res) => {
	const filePath = req.query.path;

	if (!filePath) {
		return res.status(400).json({ error: 'Missing "path" query parameter' });
	}

	try {
		const fullPath = path.join(__dirname, filePath);

		if (!fs.existsSync(fullPath)) {
			return res.status(404).json({ error: 'File not found' });
		}

		// Use res.download to send the file for download
		res.download(fullPath, err => {
			if (err) {
				res
					.status(500)
					.json({ error: 'Failed to download file', details: err.message });
			}
		});
	} catch (err) {
		res
			.status(500)
			.json({ error: 'An unexpected error occurred', details: err.message });
	}
});

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
