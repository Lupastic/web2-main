async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        alert('All fields are required!');
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
            alert("Login was successful!");
            window.location.href = `/main`;

        } else {
            try {
                const errorData = await response.json();
                alert('Login Error: ' + (errorData.error || 'An unknown error occurred.'));
            } catch (jsonError) {
                console.error("Error parsing JSON error response:", jsonError);
                alert("Login failed. An error occurred.");
            }
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('Failed to login. Please check your connection and try again.');
    }
}

document.getElementById('login-form').addEventListener('submit', handleLogin);