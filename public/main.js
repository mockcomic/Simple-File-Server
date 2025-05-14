let dir = './';

const filesListSelector = document.getElementById('file-list');

async function getFiles(dir) {
	try {
		const response = await fetch(`http://localhost:3000/files?dir=${dir}`);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error fetching files:', error);
	}
}

function renderFile(file) {
	if (filesListSelector) {
		const row = document.createElement('div');
		const text = document.createElement('a');

		text.innerHTML = file.name;

		if (file.isFolder) {
			text.addEventListener('click', ev => {
				if (!dir.endsWith('/')) {
					dir = dir + '/';
				}

				dir = dir + ev.target.innerHTML;
				renderList();
			});
		} else {
			text.href = `http://localhost:3000/file?path=${file.path}`;
			text.download = file;
		}

		row.append(text);
		filesListSelector.append(row);
	} else {
		window.alert('Error getting file-list selector');
	}
}

async function renderList() {
	filesListSelector.innerHTML = '';

	const dirHeader = document.createElement('div');
	const dirtHeaderText = document.createElement('a');
	dirHeader.addEventListener('click', () => {
		dir = dir.slice(0, dir.lastIndexOf('/') + 1);
		renderList();
	});

	dirtHeaderText.innerHTML = dir;
	dirHeader.append(dirtHeaderText);
	filesListSelector.append(dirHeader);

	const data = await getFiles(dir);

	for (const file of data.formattedFiles) {
		renderFile(file);
	}
}

renderList();
