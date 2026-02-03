// Login Page JavaScript

const AUTH_API = '../php/auth.php';

document.addEventListener('DOMContentLoaded', function() {
    setupLoginForm();
    setupPasswordToggle();
});

function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        if (!username || !password) {
            showMessage('Please fill in all fields', 'error');
            return;
        }
        
        // Show loading state
        const btn = this.querySelector('.btn');
        const btnText = btn.querySelector('.btn-text');
        const originalText = btnText.textContent;
        
        btnText.textContent = 'Signing In...';
        btn.disabled = true;
        
        try {
            const formData = new FormData();
            formData.append('action', 'login');
            formData.append('username', username);
            formData.append('password', password);
            
            const response = await fetch(AUTH_API, {
                method: 'POST',
                body: formData,
                credentials: 'same-origin'
            });
            
            const data = await response.json();
            
            if (data.success) {
                showMessage(`Welcome! Redirecting to ${data.user.role} dashboard...`, 'success');
                
                setTimeout(() => {
                    window.location.href = data.redirect;
                }, 1500);
            } else {
                showMessage(data.message, 'error');
                btnText.textContent = originalText;
                btn.disabled = false;
            }
        } catch (error) {
            console.error('Login error:', error);
            showMessage('Login failed. Please try again.', 'error');
            btnText.textContent = originalText;
            btn.disabled = false;
        }
    });
}

function setupForgotPassword(){
    const modal = document.getElementById('forgotaPasswordModal');
    const link = document.querySelector('.forgot-link');
    const closeBtn = document.querySelector('.close-modal');
    const form = document.getElementById('forgotPasswordForm');

    // open the modal
    link.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.add('active')
    });

    // close the modal
    link.addEventListener('click', (e) =>{
        modal.classList.remove('active');
    });

    // close if clicked outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    // handle the submit form
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('resetEmail').value;
        const btn = form.querySelector('button');
        const originalText = btn.innerHTML;

        btn.innerHTML = 'Sending...';
        btn.disabled = true;

        try {
            const formData = new FormData();
            formData.append('action', 'forgot-password');
            formData.append('email', email);

            const response = await fetch(AUTH_API, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            // Show success regardless of email existence (security)
            showMessage(data.message, 'success');
            modal.classList.remove('active');
            form.reset();

        } catch (error) {
            console.error('Error:', error);
            showMessage('An error occurred. Please try again.', 'error');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });
}

function setupForgotPassword(){
    const modal = document.getElementById('forgotPasswordModal');
    const link = document.querySelector('.forgot-link');
    const closeBtn = document.querySelector('.close-modal');
    const form = document.getElementById('forgotPasswordForm');

    link.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.add('active');
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('resetEmail').value;
        const btn = form.querySelector('button');
        const originalText = btn.innerHTML;

        btn.innerHTML = 'Sending...';
        btn.disabled = true;

        try {
            const formData = new FormData();
            formData.append('action', 'forgot-password');
            formData.append('email', email);

            const response = await fetch(AUTH_API, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            showMessage(data.message, 'success');
            modal.classList.remove('active');
            form.reset();

        } catch (error) {
            console.error('Error:', error);
            showMessage('An error occurred. Please try again.', 'error');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });
}

function setupPasswordToggle() {
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    });
}

function setupForgotPassword(){
    const modal = document.getElementById('forgotaPasswordModal');
    const link = document.querySelector('.forgot-link');
    const closeBtn = document.querySelector('.close-modal');
    const form = document.getElementById('forgotPasswordForm');

    // open the modal
    link.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.add('active')
    });

    // close the modal
    link.addEventListener('click', (e) =>{
        modal.classList.remove('active');
    });

    // close if clicked outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    // handle the submit form
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('resetEmail').value;
        const btn = form.querySelector('button');
        const originalText = btn.innerHTML;

        btn.innerHTML = 'Sending...';
        btn.disabled = true;

        try {
            const formData = new FormData();
            formData.append('action', 'forgot-password');
            formData.append('email', email);

            const response = await fetch(AUTH_API, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            // Show success regardless of email existence (security)
            showMessage(data.message, 'success');
            modal.classList.remove('active');
            form.reset();

        } catch (error) {
            console.error('Error:', error);
            showMessage('An error occurred. Please try again.', 'error');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });
}

function showMessage(message, type) {
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    const loginForm = document.getElementById('loginForm');
    loginForm.parentNode.insertBefore(messageEl, loginForm.nextSibling);
    
    setTimeout(function() {
        if (messageEl.parentNode) {
            messageEl.remove();
        }
    }, 5000);
}