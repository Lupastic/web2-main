document.addEventListener('DOMContentLoaded', () => {
    const profileDetails = document.getElementById('profile-details');
    const deleteUserBtn = document.getElementById('delete-user-btn');
    const updateUserBtn = document.getElementById('update-user-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    const API_BASE_URL = '/api/users';

    if (!userId) {
        showNotification('User ID not found. Please login again.', 'error');
        window.location.href = '/login.html';
        return;
    }

    const getUserProfile = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/${userId}`, {
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
            showNotification('Could not load user profile.', 'error');
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
                    showNotification('User account deleted successfully!', 'success');
                    window.location.href = '/';
                } else {
                    throw new Error('Failed to delete user account');
                }
            } catch (error) {
                console.error('Error deleting user:', error);
                showNotification('Could not delete account.', 'error');
            }
        }
    });

    updateUserBtn.addEventListener('click', async () => {
        // Create a modal dynamically
        const modal = document.createElement('div');
        modal.id = 'updateModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background-color: white;
            padding: 20px;
            border-radius: 5px;
            width: 300px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
        `;

        const usernameInput = document.createElement('input');
        usernameInput.type = 'text';
        usernameInput.placeholder = 'New Username';
        usernameInput.id = 'newUsername';
        usernameInput.style.width = '100%';

        const emailInput = document.createElement('input');
        emailInput.type = 'email';
        emailInput.placeholder = 'New Email';
        emailInput.id = 'newEmail';
        emailInput.style.width = '100%';

        const passwordInput = document.createElement('input');
        passwordInput.type = 'password';
        passwordInput.placeholder = 'New Password';
        passwordInput.id = 'newPassword';
        passwordInput.style.width = '100%';

        const updateButton = document.createElement('button');
        updateButton.textContent = 'Update';
        updateButton.style.cssText = `
            background-color: #4CAF50;
            color: white;
            padding: 10px 15px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 10px;
        `;

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.style.cssText = `
            background-color: #f44336;
            color: white;
            padding: 10px 15px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 10px;
            margin-left: 10px;
        `;

        modalContent.appendChild(usernameInput);
        modalContent.appendChild(emailInput);
        modalContent.appendChild(passwordInput);
        modalContent.appendChild(updateButton);
        modalContent.appendChild(cancelButton);

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        updateButton.addEventListener('click', async () => {
            const newUsername = document.getElementById('newUsername').value;
            const newEmail = document.getElementById('newEmail').value;
            const newPassword = document.getElementById('newPassword').value;

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
                        showNotification('Account updated successfully!', 'success');
                        getUserProfile();
                    } else {
                        throw new Error('Failed to update user account');
                    }
                } catch (error) {
                    console.error('Error updating user:', error);
                    showNotification('Could not update account.', 'error');
                } finally {
                    document.body.removeChild(modal); // Remove the modal after update
                }
            } else {
                showNotification('All fields are required to update the account.', 'warning');
            }
        });

        cancelButton.addEventListener('click', () => {
            document.body.removeChild(modal); // Remove modal on cancel
        });
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
                showNotification('Logged out successfully!', 'success');
                window.location.href = '/';
            } else {
                const error = await response.json();
                showNotification('Error: ' + error.error, 'error');
            }
        } catch (err) {
            console.error('Error logging out:', err);
            showNotification('Could not logout.', 'error');
        }

    });

    getUserProfile();


    // Notification Function
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: ${type === 'error' ? '#f44336' : type === 'success' ? '#4CAF50' : type === 'warning' ? '#ff9800' : '#2196F3'};
            color: white;
            padding: 15px;
            border-radius: 5px;
            z-index: 1001; /* Ensure it's above other elements */
        `;

        document.body.appendChild(notification);

        // Remove the notification after a delay
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);  // Adjust the time as needed
    }
});