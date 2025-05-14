let dir = './';

const filesListSelector = document.getElementById('file-list');
const API_BASE = 'http://localhost:3000';

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

async function getFiles(dir) {
	return fetchJSON(`${API_BASE}/files?dir=${encodeURIComponent(dir)}`);
}

async function getFolder() {
	return fetchJSON(`${API_BASE}/folder?dir=${encodeURIComponent(dir)}`);
}

function renderFile(file) {
	const row = document.createElement('div');
	const link = document.createElement('a');
	link.textContent = file.name;

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
