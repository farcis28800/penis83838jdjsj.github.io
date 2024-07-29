document.addEventListener('DOMContentLoaded', () => {
    // Hide splash screen and show chat container after 2 seconds
    setTimeout(() => {
        const logo = document.getElementById('logo');
        logo.style.transform = 'rotate(360deg) scale(0)';
        document.getElementById('splash').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('splash').style.display = 'none';
            document.getElementById('chat-container').classList.remove('hidden');
            loadChatHistory();
        }, 2000);
    }, 2000);

    // Send message to the chat
    document.getElementById('send-button').addEventListener('click', sendMessage);
    document.getElementById('user-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    async function sendMessage() {
        const userInput = document.getElementById('user-input');
        const messageText = userInput.value.trim();

        if (messageText) {
            appendMessage(messageText, 'user');
            saveMessage(messageText, 'user');
            userInput.value = '';

            try {
                // Send message to server
                const response = await fetch('http://127.0.0.1:5000/message', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ message: messageText })
                });
                const data = await response.json();
                appendMessage(data.response, 'bot');
                saveMessage(data.response, 'bot');
            } catch (error) {
                appendMessage('Ошибка связи с сервером.', 'bot');
                saveMessage('Ошибка связи с сервером.', 'bot');
            }
        }
    }

    function appendMessage(text, sender) {
        const chatBox = document.getElementById('chat-box');
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        messageDiv.textContent = text;
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function saveMessage(text, sender) {
        const messages = JSON.parse(localStorage.getItem('chatHistory')) || [];
        messages.push({ text, sender });
        localStorage.setItem('chatHistory', JSON.stringify(messages));
    }

    function loadChatHistory() {
        const messages = JSON.parse(localStorage.getItem('chatHistory')) || [];
        messages.forEach(message => {
            appendMessage(message.text, message.sender);
        });
    }

    // Swipe to open side menu
    let touchStartX = 0;
    let touchEndX = 0;

    document.body.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    document.body.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        if (touchEndX - touchStartX > 50) {
            document.getElementById('side-menu').style.left = '0';
        } else if (touchStartX - touchEndX > 50) {
            document.getElementById('side-menu').style.left = '-250px';
        }
    }
});
