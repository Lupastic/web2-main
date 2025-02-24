async function handleSignUp(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const password2 = document.getElementById('password2').value;

    if (!username || !email || !password || !password2) {
        alert('All fields are required!');
        return;
    }

    if (password !== password2) {
        alert('Passwords do not match!');
        return;
    }

    const deviceId = getDeviceId(); // Получаем deviceId *перед* fetch
    const API_REGISTER_URL = '/api/users/register';

    try {
        const response = await fetch(API_REGISTER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password, deviceId })
        });

        if (response.ok) {
            const data = await response.json();
            alert(`Registration successful!`);
            window.location.href = `/login.html`;
        } else {
            const error = await response.json();
            alert('Registration Error: ' + (error.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error during registration:', error);
        alert('Failed to register. Please check your connection and try again.');
    }
}

function getDeviceId() {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
        deviceId = generateUUID();
        localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

document.getElementById('signup-form').addEventListener('submit', handleSignUp);