async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        showNotification('All fields are required!', 'error');
        return;
    }
    try {
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.userId);
            showNotification("Login was successful!", 'success');
            window.location.href = `/main`;

        } else {
            try {
                const errorData = await response.json();
                showNotification('Login Error: ' + (errorData.error || 'An unknown error occurred.', 'error'));
            } catch (jsonError) {
                console.error("Error parsing JSON error response:", jsonError);
                showNotification("Login failed. An error occurred.", 'error');
            }
        }
    } catch (error) {
        console.error('Error during login:', error);
        showNotification('Failed to login. Please check your connection and try again.', 'error');
    }
}

document.getElementById('login-form').addEventListener('submit', handleLogin);

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.classList.add(type);
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('notification-fade-out'); // Use CSS class for fade-out

        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500); // Matches transition duration
    }, 3000);
}