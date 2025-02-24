document.addEventListener('DOMContentLoaded', () => {
    const profileDetails = document.getElementById('profile-details');
    const deleteUserBtn = document.getElementById('delete-user-btn');
    const updateUserBtn = document.getElementById('update-user-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId'); // Получаем userId из localStorage

    const API_BASE_URL = '/api/users'; // Определяем базовый URL

    if (!userId) {
        alert('User ID not found. Please login again.');
        window.location.href = '/login.html'; // Перенаправляем на страницу логина
        return;
    }

    const getUserProfile = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/${userId}`, { // Используем базовый URL
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch user profile');

            const user = await response.json();
            profileDetails.innerHTML = `
                <p>Username: ${user.username}</p>
                <p>Email: ${user.email}</p>
            `;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            alert('Could not load user profile.');
        }
    };

    deleteUserBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete your account?')) {
            try {
                const response = await fetch(`${API_BASE_URL}/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    alert('User account deleted successfully!');
                    window.location.href = '/';
                } else {
                    throw new Error('Failed to delete user account');
                }
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Could not delete account.');
            }
        }
    });

    updateUserBtn.addEventListener('click', async () => {
        const newUsername = prompt('Enter new username:');
        const newEmail = prompt('Enter new email:');
        const newPassword = prompt('Enter new password:');

        if (newUsername && newEmail && newPassword) {
            try {
                const response = await fetch(`${API_BASE_URL}/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ username: newUsername, email: newEmail, password: newPassword }),
                });
                if (response.ok) {
                    alert('Account updated successfully!');
                    getUserProfile();
                } else {
                    throw new Error('Failed to update user account');
                }
            } catch (error) {
                console.error('Error updating user:', error);
                alert('Could not update account.');
            }
        } else {
            alert('All fields are required to update the account.');
        }
    });


    logoutBtn.addEventListener('click', async () => {
        let deviceId = localStorage.getItem('deviceId');

        try {
            const response = await fetch('/api/users/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'device-id': deviceId
                }
            });
            if (response.ok) {
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                localStorage.removeItem('deviceId');
                alert('Logged out successfully!');
                window.location.href = '/';
            } else {
                const error = await response.json();
                alert('Error: ' + error.error);
            }
        } catch (err) {
            console.error('Error logging out:', err);
            alert('Could not logout.');
        }

    });

    getUserProfile();
});