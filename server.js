const socket = new WebSocket('ws://192.168.2.103:8765');
let displayName = "";

// Ask for display name
document.getElementById('submit-name').addEventListener('click', () => {
    const nameInput = document.getElementById('display-name').value;
    if (nameInput.trim()) {
        displayName = nameInput.trim();
        document.getElementById('name-form').style.display = 'none'; // Hide the form
        socket.send(JSON.stringify({ type: 'join', name: displayName })); // Send name to server
    } else {
        alert('Please enter a valid name.');
    }
});

// Handle file sharing
document.getElementById('send-file').addEventListener('click', () => {
    const fileInput = document.getElementById('file-input');
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = () => {
            const fileData = reader.result;
            console.log("Sending file:", { fileName: file.name, data: fileData.substring(0, 100) }); // Debugging
            socket.send(JSON.stringify({ type: 'file', name: displayName, fileName: file.name, data: fileData }));
        };
        reader.readAsDataURL(file);  // Read as Data URL (Base64)
    } else {
        alert('Please select a file.');
    }
});

socket.onopen = () => {
    document.getElementById('server-status').textContent = "Connected";
    console.log('WebSocket connection established.');
    updateStatus();
};

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("Received message:", data);  // Debugging
    
    if (data.type === 'status') {
        document.getElementById('active-connections').textContent = data.connections;
    } else if (data.type === 'userList') {
        updateUserList(data.users);
    } else if (data.type === 'file') {
        displayFile(data.name, data.fileName, data.data);
    } else if (data === "Server shutting down...") {
        alert("Server is shutting down...");
        window.close();
    }
};

socket.onclose = () => {
    console.log('WebSocket connection closed.');
    document.getElementById('server-status').textContent = "Disconnected";
};

document.getElementById('stop-server').addEventListener('click', () => {
    socket.send(JSON.stringify({ type: "stop" }));
});

function updateStatus() {
    setInterval(() => {
        socket.send(JSON.stringify({ type: "status" }));
    }, 1000);
}

function updateUserList(users) {
    const userList = document.getElementById('connected-users');
    userList.innerHTML = ''; // Clear the list
    users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user;
        li.className = 'list-group-item';
        userList.appendChild(li);
    });
}

function displayFile(senderName, fileName, fileData) {
    console.log("Received file:", { fileName: fileName, data: fileData.substring(0, 100) }); // Debugging
    const fileList = document.getElementById('file-list');
    const fileItem = document.createElement('div');
    fileItem.className = 'card mb-3';
    fileItem.innerHTML = `
        <div class="card-body">
            <h5 class="card-title">${fileName}</h5>
            <p class="card-text">Sent by: ${senderName}</p>
            <a href="${fileData}" download="${fileName}" class="btn btn-primary">Download</a>
        </div>
    `;
    fileList.appendChild(fileItem);
}
