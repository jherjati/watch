const chokidar = require('chokidar');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const folderToWatch = path.resolve(__dirname, process.env.WATCHED_DIRECTORY);
const apiUrl = `${process.env.DIRECTUS_ENDPOINT}/files`;
const accessToken = process.env.DIRECTUS_TOKEN;
const folderId = process.env.FOLDER_ID;

function processTitle(filename) {
    // Remove the file extension
    const baseName = filename.replace(path.extname(filename), '');

    // Replace underscores or dashes with spaces and capitalize each word
    return baseName
        .replace(/[_-]+/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

// Initialize watcher.
const watcher = chokidar.watch(folderToWatch, {
    ignored: /^\./,
    persistent: true,
    ignoreInitial: true
});

// Function to handle file uploads
async function uploadFile(filePath) {
    const fileName = path.basename(filePath);
    const formData = new FormData();
    formData.append('folder', folderId);
    formData.append('title', processTitle(fileName));
    formData.append('file', fs.createReadStream(filePath), fileName); // Always append file property at last order

    try {
        const response = await axios({
            method: 'post',
            url: apiUrl,
            data: formData,
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${accessToken}`
            }
        });

        console.log('File uploaded successfully:', response.data);
    } catch (error) {
        console.error('Error uploading file:', error);
    }
}

// Add event listeners.
watcher
    .on('add', path => {
        console.log(`File ${path} has been added`);
        uploadFile(path);
    })
    .on('error', error => console.log(`Watcher error: ${error}`))
    .on('ready', () => console.log('Initial scan complete. Ready for changes'));

console.log('Watching for file changes on:', folderToWatch);
