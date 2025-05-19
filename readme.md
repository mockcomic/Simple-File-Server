# Simple File Server

A portable, zero-setup file server for Windows, Macos, and Linux.

## Overview

Just drag and drop the executable (`.exe`) into any folder and run it. The server will open a terminal window and display your local IP address (e.g., `192.168.x.xx:3000`). You can now connect to that address from any device on your network using a web browser.

- **Browse** files and folders (including nested directories)
- **Download** individual files or entire folders as ZIP archives
- **Upload** files to the current directory

The server uses the location of the `.exe` as the root directory, so you can easily share any folder's contents.

## How to Use

1. **Download** the executable.
2. **Move** the `.exe` into the folder you want to share.
3. **If you are on MacOS or Linux,** you must make the file executable first:
   ```
   chmod +x ./yourfilename
   ```
4. **Run** the executable (double-click or run from terminal).
5. The terminal will display your local IP address, e.g.:
   ```
   Local:   http://localhost:3000
   Network: http://XXX.XXX.X.XX:3000
   ```
6. **Open** the displayed address in a browser on any device on your network.
7. Use the web interface to browse, upload, and download files and folders.

## Features

- No installation or configuration required
- Uses the `.exe` location as the root directory
- Supports nested folders
- Upload and download files and folders from any device on your network

## License

This project is licensed under the [MIT License](LICENSE).
