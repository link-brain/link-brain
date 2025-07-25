document.addEventListener('DOMContentLoaded', async function() {
    // Firebase Configuration
    const firebaseConfig = {
        apiKey: "AIzaSyBhCxGjQOQ88b2GynL515ZYQXqfiLPhjw4",
        authDomain: "edumates-983dd.firebaseapp.com",
        projectId: "edumates-983dd",
        storageBucket: "edumates-983dd.firebasestorage.app",
        messagingSenderId: "172548876353",
        appId: "1:172548876353:web:955b1f41283d26c44c3ec0",
        measurementId: "G-L1KCZTW8R9"
    };

    // Import Firebase libraries
    let firebaseInitialized = false;
    try {
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js");
        const { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js");
        const { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, limit, startAfter } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js");
        const DOMPurify = await import("https://cdnjs.cloudflare.com/ajax/libs/dompurify/2.4.0/purify.min.js");

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const provider = new GoogleAuthProvider();
        const db = getFirestore(app);
        firebaseInitialized = true;

        // DOM Elements
        const elements = {
            googleLoginBtn: document.getElementById('googleLoginBtn'),
            chatBtn: document.getElementById('chatBtn'),
            chatPopup: document.getElementById('chatPopup'),
            closeChat: document.getElementById('closeChat'),
            chatMessages: document.getElementById('chatMessages'),
            messageInput: document.getElementById('messageInput'),
            sendMessageBtn: document.getElementById('sendMessageBtn'),
            chatLoading: document.getElementById('chatLoading'),
            loadMoreBtn: document.getElementById('loadMoreBtn')
        };

        // Check for missing DOM elements
        if (!elements.googleLoginBtn || !elements.chatBtn || !elements.chatPopup) {
            console.error('Missing DOM elements:', {
                googleLoginBtn: !!elements.googleLoginBtn,
                chatBtn: !!elements.chatBtn,
                chatPopup: !!elements.chatPopup
            });
            showToast('Error loading UI, please reload the page');
            return;
        }

        // Show toast notification
        function showToast(message, type = 'info') {
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.textContent = message;
            document.body.appendChild(toast);
            setTimeout(() => {
                toast.classList.add('show');
                setTimeout(() => {
                    toast.classList.remove('show');
                    setTimeout(() => {
                        toast.remove();
                    }, 300);
                }, 3000);
            }, 100);
        }

        // Chat pagination variables
        let lastVisible = null;
        let unsubscribeMessages = null;
        const messagesPerPage = 20;
        let hasMoreMessages = true;

        // Setup event listeners
        function setupEventListeners() {
            elements.googleLoginBtn.addEventListener('click', handleAuth);
            elements.chatBtn.addEventListener('click', toggleChatPopup);
            elements.closeChat.addEventListener('click', toggleChatPopup);
            elements.sendMessageBtn.addEventListener('click', sendMessage);
            elements.messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
            elements.loadMoreBtn.addEventListener('click', loadMessages);
            onAuthStateChanged(auth, handleAuthStateChanged);
        }

        // Handle authentication
        async function handleAuth() {
            if (!firebaseInitialized) {
                showToast('Firebase initialization error, please reload the page', 'error');
                console.error('Firebase not initialized');
                return;
            }

            const user = auth.currentUser;
            try {
                if (user) {
                    await signOut(auth);
                    showToast('Logged out successfully', 'success');
                } else {
                    await signInWithPopup(auth, provider);
                    showToast('Logged in successfully', 'success');
                }
            } catch (error) {
                console.error('Authentication error:', error.code, error.message);
                if (error.code === 'auth/network-request-failed') {
                    showToast('Network connection failed, please check your internet', 'error');
                } else if (error.code === 'auth/popup-closed-by-user') {
                    showToast('Login popup closed', 'error');
                } else {
                    showToast('Error during login/logout', 'error');
                }
            }
        }

        // Handle auth state changes
        function handleAuthStateChanged(user) {
            try {
                if (user) {
                    elements.googleLoginBtn.innerHTML = `
                        <img src="${user.photoURL || 'https://via.placeholder.com/30'}" alt="User avatar" class="user-avatar">
                        <span>${DOMPurify.sanitize(user.displayName || 'User')}</span>
                        <i class="fas fa-sign-out-alt logout-icon" aria-label="Log out"></i>
                    `;
                    elements.googleLoginBtn.classList.add('user-logged-in');
                } else {
                    elements.googleLoginBtn.innerHTML = `
                        <i class="fab fa-google"></i> Sign in
                    `;
                    elements.googleLoginBtn.classList.remove('user-logged-in');
                }
            } catch (error) {
                console.error('Error updating auth UI:', error);
                showToast('Error updating login UI', 'error');
            }
        }

        // Toggle chat popup
        function toggleChatPopup() {
            const isActive = elements.chatPopup.classList.toggle('active');
            elements.chatPopup.setAttribute('aria-hidden', !isActive);
            if (isActive) {
                elements.messageInput.focus();
                if (!elements.chatMessages.hasChildNodes()) {
                    loadMessages();
                }
                scrollChatToBottom();
            } else if (unsubscribeMessages) {
                unsubscribeMessages();
                unsubscribeMessages = null;
                elements.chatMessages.innerHTML = '';
                hasMoreMessages = true;
                lastVisible = null;
                elements.loadMoreBtn.style.display = 'none';
            }
        }

        // Scroll chat to bottom
        function scrollChatToBottom() {
            if (elements.chatMessages) {
                elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
            }
        }

        // Send message
        async function sendMessage() {
            if (!firebaseInitialized) {
                showToast('Firebase initialization error, please reload the page', 'error');
                return;
            }

            const user = auth.currentUser;
            if (!user) {
                showToast('Please sign in to send messages', 'error');
                return;
            }

            const messageText = elements.messageInput.value.trim();
            if (!messageText) {
                showToast('Please enter a non-empty message', 'error');
                return;
            }

            if (messageText.length > 500) {
                showToast('Message too long, maximum 500 characters', 'error');
                return;
            }

            try {
                elements.sendMessageBtn.disabled = true;
                await addDoc(collection(db, 'messages'), {
                    text: DOMPurify.sanitize(messageText),
                    userId: user.uid,
                    userName: DOMPurify.sanitize(user.displayName || 'User'),
                    userPhoto: user.photoURL || 'https://via.placeholder.com/30',
                    timestamp: serverTimestamp()
                });
                elements.messageInput.value = '';
                scrollChatToBottom();
                showToast('Message sent successfully', 'success');
            } catch (error) {
                console.error('Error sending message:', error.code, error.message);
                showToast('Error sending message', 'error');
            } finally {
                elements.sendMessageBtn.disabled = false;
            }
        }

        // Load messages
        async function loadMessages() {
            if (!firebaseInitialized) {
                showToast('Firebase initialization error, please reload the page', 'error');
                return;
            }

            if (!hasMoreMessages) return;

            elements.chatLoading.classList.add('active');
            let messagesQuery = query(
                collection(db, 'messages'),
                orderBy('timestamp', 'asc'),
                limit(messagesPerPage)
            );

            if (lastVisible) {
                messagesQuery = query(messagesQuery, startAfter(lastVisible));
            }

            try {
                unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
                    if (snapshot.empty) {
                        hasMoreMessages = false;
                        elements.loadMoreBtn.style.display = 'none';
                        elements.chatLoading.classList.remove('active');
                        return;
                    }

                    const messages = [];
                    snapshot.forEach((doc) => {
                        messages.push({ id: doc.id, ...doc.data() });
                        lastVisible = doc;
                    });

                    messages.forEach((msg) => {
                        const messageElement = document.createElement('div');
                        messageElement.className = `message ${msg.userId === auth.currentUser?.uid ? 'user-message' : ''}`;
                        messageElement.innerHTML = `
                            <div class="message-header">
                                <img src="${msg.userPhoto}" alt="User avatar" class="message-avatar">
                                <span class="message-sender">${DOMPurify.sanitize(msg.userName)}</span>
                                <span class="message-time">${formatTimestamp(msg.timestamp)}</span>
                            </div>
                            <p class="message-text">${DOMPurify.sanitize(msg.text)}</p>
                        `;
                        elements.chatMessages.appendChild(messageElement);
                    });

                    elements.loadMoreBtn.style.display = hasMoreMessages ? 'block' : 'none';
                    elements.chatLoading.classList.remove('active');
                    scrollChatToBottom();
                }, (error) => {
                    console.error('Error loading messages:', error.code, error.message);
                    showToast('Error loading messages', 'error');
                    elements.chatLoading.classList.remove('active');
                });
            } catch (error) {
                console.error('Error setting up messages listener:', error.code, error.message);
                showToast('Error loading messages', 'error');
                elements.chatLoading.classList.remove('active');
            }
        }

        // Format timestamp
        function formatTimestamp(timestamp) {
            if (!timestamp) return 'Now';
            try {
                const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
                return date.toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch (error) {
                console.error('Error formatting timestamp:', error);
                return 'Unavailable';
            }
        }

        // Initialize app
        try {
            setupEventListeners();
        } catch (error) {
            console.error('Error initializing app:', error);
            showToast('Error initializing app', 'error');
        }

        // Cleanup on page unload
        window.addEventListener('unload', () => {
            if (unsubscribeMessages) unsubscribeMessages();
        });
    } catch (error) {
        console.error('Error importing Firebase or DOMPurify:', error);
        showToast('Error loading core libraries, please reload the page', 'error');
    }
});
