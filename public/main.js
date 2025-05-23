let dir = './';
const baseUrl = getIpFromUrl(window.location.href);
const notificationSelector = document.getElementById('notification');
const filesListSelector = document.getElementById('file-list');
const fileInput = document.getElementById('file-input');

const API_BASE = `http://${baseUrl}:3000`;

document.getElementById('file-input').addEventListener('change', event => {
	const fileName = event.target.files[0]?.name || 'No file selected';
	document.getElementById('file-name').textContent = fileName;
});

function notification(text, type) {
	const timer = 5000;

	notificationSelector.textContent = text;
	notificationSelector.classList.toggle(
		'has-background-danger',
		type === 'error'
	);
	notificationSelector.classList.remove('hide');
	notificationSelector.classList.add('show', 'notification-pop');

	clearTimeout(notificationSelector._notifTimeout);
	notificationSelector._notifTimeout = setTimeout(() => {
		notificationSelector.classList.add('hide');
		notificationSelector.classList.remove('show', 'notification-pop');
	}, timer);
}

function getIpFromUrl(url) {
	try {
		const { hostname } = new URL(url);
		return hostname;
	} catch (e) {
		console.error('Invalid URL:', url);
		return null;
	}
}

async function fetchJSON(url) {
	try {
		const response = await fetch(url);
		if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
		return await response.json();
	} catch (error) {
		console.error('Fetch error:', error);
		return null;
	}
}

async function uploadFile() {
	const formData = new FormData();
	const file = fileInput.files[0];

	formData.append('file', file);
	formData.append('dir', dir);

	if (file == null) {
		return notification('Select a file', 'error');
	}

	try {
		const response = await fetch(`${API_BASE}/upload`, {
			method: 'POST',
			body: formData,
		});
		if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);
		notification('File uploaded successfully!');
		renderList();
	} catch (error) {
		console.error('Upload error:', error);
		notification('File upload failed: ' + error.message, 'error');
	}
}

async function getFiles(dir) {
	return fetchJSON(`${API_BASE}/files?dir=${encodeURIComponent(dir)}`);
}

async function getFolder() {
	if (!dir) {
		return notification('Please enter a folder path', error);
	}

	notification('Creating zip file, please wait....');

	try {
		const res = await fetch(`/folder?path=${encodeURIComponent(dir)}`);
		if (!res.ok) {
			// If server sent JSON error, parse text for debugging
			const text = await res.text();
			throw new Error(text);
		}

		// Pull out the binary as a Blob
		const blob = await res.blob();
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${dir}.zip`;
		document.body.appendChild(a);
		a.click();
		a.remove();
		window.URL.revokeObjectURL(url);
	} catch (err) {
		console.error(err);
		notification('Download failed: ' + err.message, 'error');
	}
}

function renderFile(file) {
	const row = document.createElement('div');
	const link = document.createElement('a');
	const span = document.createElement('span');
	const icon = document.createElement('i');

	row.className = 'is-flex is-align-items-center';
	span.className = 'icon';
	icon.className = 'fas fa-file';

	link.textContent = file.name;
	if (file.isFolder) {
		icon.className = 'fas fa-folder';
	} else {
	}

	if (file.isFolder) {
		link.href = '#';
		link.addEventListener('click', ev => {
			ev.preventDefault();
			dir = dir.endsWith('/') ? dir : dir + '/';
			dir += file.name;
			renderList();
		});
	} else {
		link.href = `${API_BASE}/file?path=${encodeURIComponent(file.path)}`;
		link.download = file.name;
	}

	span.append(icon);

	row.append(span);
	row.append(link);
	filesListSelector.append(row);
}

function renderDirHeader() {
	const dirHeader = document.createElement('div');
	const dirHeaderText = document.createElement('a');
	dirHeaderText.textContent = dir;
	dirHeaderText.href = '#';
	dirHeaderText.addEventListener('click', ev => {
		ev.preventDefault();
		if (dir !== './') {
			dir = dir.slice(0, dir.lastIndexOf('/')) || './';
			renderList();
		}
	});
	dirHeader.append(dirHeaderText);
	filesListSelector.append(dirHeader);
}

async function renderList() {
	filesListSelector.innerHTML = '';
	if (dir === '.') dir = './';

	renderDirHeader();

	const data = await getFiles(dir);
	if (!data || !Array.isArray(data.formattedFiles)) return;

	for (const file of data.formattedFiles) {
		renderFile(file);
	}
}

renderList();
