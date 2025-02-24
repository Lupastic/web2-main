document.addEventListener('DOMContentLoaded', () => {
    const topicsList = document.getElementById('topics-list');
    const addTopicForm = document.getElementById('add-topic-form');
    const topicNameInput = document.getElementById('topic-name');

    const notificationArea = document.getElementById('notification-area'); // Add a dedicated notification area

    // Function to display notifications
    const showNotification = (message, type = 'info') => {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.classList.add('notification', type);

        notificationArea.appendChild(notification);

        // Remove the notification after a few seconds
        setTimeout(() => {
            notification.remove();
        }, 3000); // Adjust the time (in milliseconds) as needed
    };

    const fetchTopics = async (sortBy = '') => {
        let url = '/api/topics';
        if (sortBy !== 'likes') {
            url += '?sort=likes'; // Always sort by likes by default if not otherwise specified
        }
        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(`Failed to fetch topics: ${response.status} - ${errorMessage}`);
            }
            const topics = await response.json();
            topicsList.innerHTML = topics.map(topic => `
                <div class="topic-card" data-id="${topic.topic_id}" data-user-id="${topic.user_id}">
                    <div class="topic-content">
                        <span class="topic-name">${topic.title}</span>
                        <span class="topic-author">By: ${topic.username}</span> <!-- Display author username -->
                    </div>
                    <div class="topic-actions">
                        <button class="edit-toggle-btn" style="background-color: green; color: white;">Edit</button>
                        <button class="delete-btn" style="background-color: red; color: white;">Delete</button>
                        <button class="comment-toggle-btn" style="background-color: blue; color: white;">Comment</button>
                        <button class="view-all-comments-btn" style="background-color: gray; color: white;">View All Comments</button>
                        <button class="like-btn" style="background-color: orange; color: white;">Like</button> <span class="likes-count">${topic.likes_count || 0}</span>
                    </div>
                    <div class="edit-section" style="display: none; margin-top: 10px; padding: 10px; background: #eef; border-radius: 5px;">
                        <input type="text" class="edit-input" value="${topic.title}" style="width: 80%; padding: 5px; border: 1px solid #ccc; border-radius: 5px;" />
                        <button class="submit-edit-btn" style="background-color: darkgreen; color: white; padding: 5px 10px; border-radius: 5px;">Save</button>
                    </div>
                    <div class="comment-section" style="display: none; margin-top: 10px; padding: 10px; background: #eef; border-radius: 5px;">
                        <input type="text" class="comment-input" placeholder="Enter your comment" style="width: 80%; padding: 5px; border: 1px solid #ccc; border-radius: 5px;" />
                        <button class="submit-comment-btn" style="background-color: darkblue; color: white; padding: 5px 10px; border-radius: 5px;">Submit</button>
                    </div>
                </div>
                <div class="comments-list" id="comments-${topic.topic_id}" style="border-left: 4px solid #ccc; padding: 10px; margin-top: 10px; background-color: #f9f9f9; border-radius: 5px;">
                </div>
            `).join('');
        } catch (error) {
            console.error('Error fetching topics:', error);
            showNotification(`Could not load topics. Please try again. Error: ${error.message}`, 'error');
        }
    };

    addTopicForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = topicNameInput.value.trim();
        if (name) {
            try {
                const token = localStorage.getItem('token');
                const userId = getUserIdFromSession(); // Get the user ID
                if (!token) {
                    showNotification("Authentication token not found. Please log in.", 'error');
                    return;
                }
                const response = await fetch('/api/topics', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        title: name,
                        user_id: userId // Send the user ID with the request
                    }),
                });
                if (!response.ok) {
                    const errorMessage = await response.text();
                    throw new Error(`Failed to add topic: ${response.status} - ${errorMessage}`);
                }
                topicNameInput.value = '';
                fetchTopics();
                showNotification("Topic added successfully!", 'success'); // Display success notification
            } catch (error) {
                console.error('Error adding topic:', error);
                showNotification(`Could not add topic. Please try again. Error: ${error.message}`, 'error');
            }
        }
    });

    topicsList.addEventListener('click', async (e) => {
        const topicDiv = e.target.closest('.topic-card');
        if (!topicDiv) return;
        const topicId = topicDiv.dataset.id;
        const userIdOfTopic = topicDiv.dataset.userId;
        const loggedInUserId = localStorage.getItem('userId');

        const canEditOrDelete = String(loggedInUserId) === String(userIdOfTopic);

        if (e.target.classList.contains('like-btn')) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    showNotification("Authentication token not found. Please log in.", 'error');
                    return;
                }
                const response = await fetch(`/api/topics/${topicId}/like`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    const errorMessage = await response.text();
                    throw new Error(`Failed to like/unlike topic: ${response.status} - ${errorMessage}`);
                }

                const data = await response.json();
                const likesCountElement = topicDiv.querySelector('.likes-count');
                likesCountElement.textContent = data.likes_count;
            } catch (error) {
                console.error('Error liking topic:', error);
                showNotification(`Could not like/unlike topic. Please try again. Error: ${error.message}`, 'error');
            }
            return;
        }

          if (e.target.classList.contains('edit-toggle-btn')) {

            if (!canEditOrDelete){
                showNotification("You do not have permission to edit this topic.", 'warning');
                return;
            }

            const editSection = topicDiv.querySelector('.edit-section');
            editSection.style.display = editSection.style.display === 'none' ? 'block' : 'none';
        }

        if (e.target.classList.contains('submit-edit-btn')) {
            if (!canEditOrDelete){
                showNotification("You do not have permission to edit this topic.", 'warning');
                 return;
            }
            const editInput = topicDiv.querySelector('.edit-input');
            const newName = editInput.value.trim();
            if (newName) {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) {
                        showNotification("Authentication token not found. Please log in.", 'error');
                        return;
                    }

                    const response = await fetch(`/api/topics/${topicId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ title: newName }),
                    });
                    if (!response.ok) {
                        const errorMessage = await response.text();
                        throw new Error(`Failed to update topic: ${response.status} - ${errorMessage}`);
                    }
                    fetchTopics();
                    showNotification("Topic updated successfully!", 'success');
                } catch (error) {
                    console.error('Error updating topic:', error);
                    showNotification(`Could not update topic. Please try again. Error: ${error.message}`, 'error');
                }
            }
        }

         if (e.target.classList.contains('delete-btn')) {

            if (!canEditOrDelete){
                showNotification("You do not have permission to delete this topic.", 'warning');
                return;
            }
            if (confirm('Вы уверены, что хотите удалить эту тему?')) {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) {
                        showNotification("Authentication token not found. Please log in.", 'error');
                        return;
                    }

                    const response = await fetch(`/api/topics/${topicId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (!response.ok) {
                        const errorMessage = await response.text();
                        throw new Error(`Не удалось удалить тему: ${response.status} - ${errorMessage}`);
                    }
                    fetchTopics();
                    showNotification("Topic deleted successfully!", 'success');
                } catch (error) {
                    console.error('Ошибка при удалении темы:', error);
                   showNotification(`Не удалось удалить тему.  Проверьте консоль для получения подробной информации. Error: ${error.message}`, 'error');
                }
            }
        }

        if (e.target.classList.contains('comment-toggle-btn')) {
            const commentSection = topicDiv.querySelector('.comment-section');
            commentSection.style.display = commentSection.style.display === 'none' ? 'block' : 'none';
        }

        if (e.target.classList.contains('submit-comment-btn')) {
            const commentInput = topicDiv.querySelector('.comment-input');
            const commentText = commentInput.value.trim();
            const username = getUsernameFromSession();
            const userId = getUserIdFromSession();

            if (commentText) {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) {
                         showNotification("Authentication token not found. Please log in.", 'error');
                        return;
                    }

                    const response = await fetch('/api/comments', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            comment_text: commentText,
                            user_id: userId,
                            topic_id: topicId,
                            username: username
                        }),
                    });
                    if (!response.ok) {
                        const errorMessage = await response.text();
                        throw new Error(`Failed to add comment: ${response.status} - ${errorMessage}`);
                    }
                    commentInput.value = '';
                    fetchComments(topicId);
                    showNotification("Comment added successfully!", 'success');
                } catch (error) {
                    console.error('Error adding comment:', error);
                   showNotification(`Could not add comment. Please try again. Error: ${error.message}`, 'error');
                }
            }
        }

        if (e.target.classList.contains('view-all-comments-btn')) {
            const commentsList = document.getElementById(`comments-${topicId}`);
            if (commentsList.style.display === 'none' || commentsList.style.display === '') {
                fetchComments(topicId);
                commentsList.style.display = 'block';
            } else {
                commentsList.style.display = 'none';
            }
        }
    });

    const fetchComments = async (topicId) => {
        try {
            const response = await fetch(`/api/comments?topic_id=${topicId}`);
            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(`Failed to fetch comments: ${response.status} - ${errorMessage}`);
            }
            const comments = await response.json();
            const commentsList = document.getElementById(`comments-${topicId}`);
            commentsList.innerHTML = comments.map(comment => `
                <div class="comment" style="padding: 10px; margin-bottom: 8px; border-bottom: 1px solid #ddd; background-color: #fff; border-radius: 5px; box-shadow: 2px 2px 5px rgba(0,0,0,0.1);">
                    <p style="margin: 0; font-size: 14px;"><strong>${comment.username}:</strong> ${comment.comment_text}</p>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error fetching comments:', error);
             showNotification(`Could not fetch comments. Please try again. Error: ${error.message}`, 'error');
        }
    };
    fetchTopics();

});

async function handleLoginSuccess(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', data.userId);
    localStorage.setItem('username', data.username);
    fetchTopics();
}

function getUsernameFromSession() {
    return localStorage.getItem('username');
}

function getUserIdFromSession() {
    return localStorage.getItem('userId');
}