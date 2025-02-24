document.addEventListener('DOMContentLoaded', () => {
    const usersList = document.getElementById('users-list');

    const fetchAndDisplayTopUsers = async () => {
        try {
            const response = await fetch('/api/users/top'); // Измените URL
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const topUsers = await response.json();
            console.log("Top Users:", topUsers);
            const topUsersHTML = topUsers.slice(0, 3).map(user => `
                <div class="user-card">
                    <p>${user.username} - Posts: ${user.posts_count}</p>
                </div>
            `).join('');

            usersList.innerHTML = topUsersHTML;
        } catch (error) {
            console.error('Error fetching and displaying top users:', error);
            alert('Could not load top users.');
        }
    };

    fetchAndDisplayTopUsers();
});