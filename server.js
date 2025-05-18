#!/usr/bin/env node
// ...existing code...

const express = require('express');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const cors = require('cors');
const os = require('os');
const app = express();
const ejs = require('ejs');
const multer = require('multer');

const PORT = 3000;

function get192LanIP() {
	const nets = os.networkInterfaces();
	for (const iface of Object.values(nets)) {
		for (const config of iface) {
			if (
				config.family === 'IPv4' &&
				!config.internal &&
				config.address.startsWith('192.168.')
			) {
				return config.address;
			}
		}
	}
	return null;
}

async function isFolder(filePath) {
	try {
		const stats = fs.statSync(filePath);
		return await stats.isDirectory();
	} catch (err) {
		return false;
	}
}

app.use(cors({ origin: false }));

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));

app.engine('html', ejs.renderFile);
app.set('view engine', 'html');

app.get('/files', (req, res) => {
	const dir = req.query.dir;

	if (!dir) {
		return res.status(400).json({ error: 'Missing "dir" query parameter' });
	}

	try {
		const baseDir = path.dirname(process.execPath);
		const fullPath = path.join(baseDir, dir);

		fs.readdir(fullPath, async (err, files) => {
			if (err) {
				return res.status(500).json({ error: 'Unable to read directory' });
			}
			const formattedFiles = [];
			for (const file of files) {
				const filePath = dir + '/' + file;
				formattedFiles.push({
					name: file,
					isFolder: await isFolder(filePath),
					path: filePath,
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
		const fullPath = path.join(baseDir, filePath);

		if (!fs.existsSync(fullPath)) {
			return res.status(404).json({ error: 'File not found' });
		}

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

app.get('/folder', (req, res) => {
	const folder = req.query.path;
	if (!folder) {
		return res.status(400).json({ error: 'Missing "path" query parameter' });
	}

	const baseDir = path.dirname(process.execPath);
	const fullPath = path.join(baseDir, folder);

	if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isDirectory()) {
		return res.status(404).json({ error: 'Folder not found' });
	}

	res.setHeader('Content-Type', 'application/zip');
	res.setHeader(
		'Content-Disposition',
		`attachment; filename="${path.basename(folder)}.zip"`
	);

	const archive = archiver('zip', { zlib: { level: 9 } });
	archive.on('error', err => {
		console.error('Archive error:', err);
		if (!res.headersSent) {
			res
				.status(500)
				.json({ error: 'Failed to archive folder', details: err.message });
		} else {
			res.end();
		}
	});

	archive.pipe(res);
	archive.directory(fullPath, false);
	archive.finalize();
});

app.post('/upload', (req, res) => {
	const baseDir = path.dirname(process.execPath);
	const storage = multer.diskStorage({
		destination: (req, file, cb) => {
			const uploadDir = path.join(baseDir, req.query.dir || '');
			fs.mkdirSync(uploadDir, { recursive: true });
			cb(null, uploadDir);
		},
		filename: (req, file, cb) => {
			cb(null, file.originalname);
		},
	});
	const upload = multer({ storage }).single('file');

	upload(req, res, err => {
		if (err) {
			console.error('Multer upload error:', err);
			return res
				.status(500)
				.json({ error: 'Upload failed', details: err.message });
		}
		res.json({ success: true, filename: req.file.originalname });
	});
});

app.listen(PORT, () => {
	const lanIP = get192LanIP() || '127.0.0.1';
	console.log(`Local:   http://localhost:${PORT}`);
	console.log(`Network: http://${lanIP}:${PORT}`);
});
