let dir = './';
const notificationSelector = document.getElementById('notification');
const filesListSelector = document.getElementById('file-list');
const fileInput = document.getElementById('file-input');
const API_BASE = `http://${new URL(window.location.href).hostname}:3000`;

function clearFileList() {
	while (filesListSelector.firstChild) {
		filesListSelector.removeChild(filesListSelector.firstChild);
	}
}

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

async function fetchJSON(url) {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	return await res.json();
}

async function uploadFile(event) {
	const file = fileInput.files[0];
	if (!file) return notification('Select a file', 'error');

	const formData = new FormData();
	formData.append('file', file);

	try {
		const res = await fetch(
			`${API_BASE}/upload?dir=${encodeURIComponent(dir)}`,
			{ method: 'POST', body: formData }
		);
		if (!res.ok) throw new Error(res.statusText);

		notification('File uploaded successfully!');
		await renderList();
	} catch (err) {
		console.error(err);
		notification('Upload failed: ' + err.message, 'error');
	}
}

async function getFiles(dir) {
	return await fetchJSON(`${API_BASE}/files?dir=${encodeURIComponent(dir)}`);
}

async function getFolder() {
	try {
		notification('Creating zip file, please wait....');
		const res = await fetch(
			`${API_BASE}/folder?path=${encodeURIComponent(dir)}`
		);
		if (!res.ok) throw new Error(await res.text());

		const blob = await res.blob();
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${dir}.zip`;
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
	} catch (err) {
		console.error(err);
		notification('Download failed: ' + err.message, 'error');
	}
}

function renderDirHeader() {
	const header = document.createElement('div');
	const link = document.createElement('a');
	link.textContent = dir;
	link.href = '#';
	link.addEventListener('click', ev => {
		ev.preventDefault();
		if (dir !== './') {
			dir = dir.slice(0, dir.lastIndexOf('/')) || './';
			renderList();
		}
	});
	header.appendChild(link);
	filesListSelector.appendChild(header);
}

function renderFile(file) {
	const row = document.createElement('div');
	row.className = 'is-flex is-align-items-center';

	const icon = document.createElement('i');
	icon.className = file.isFolder ? 'fas fa-folder' : 'fas fa-file';

	const link = document.createElement('a');
	link.textContent = file.name;
	if (file.isFolder) {
		link.href = '#';
		link.addEventListener('click', ev => {
			ev.preventDefault();
			dir = (dir.endsWith('/') ? dir : dir + '/') + file.name;
			renderList();
		});
	} else {
		link.href = `${API_BASE}/file?path=${encodeURIComponent(file.path)}`;
		link.download = file.name;
	}

	const span = document.createElement('span');
	span.className = 'icon';
	span.appendChild(icon);

	row.append(span, link);
	filesListSelector.appendChild(row);
}

async function renderList() {
	clearFileList();
	if (dir === '.') dir = './';
	renderDirHeader();

	try {
		const data = await getFiles(dir);
		if (!data?.formattedFiles) return;

		data.formattedFiles.forEach(renderFile);
	} catch (err) {
		console.error(err);
		notification('Could not load file list', 'error');
	}
}

document.getElementById('upload-button').addEventListener('click', uploadFile);

renderList();
