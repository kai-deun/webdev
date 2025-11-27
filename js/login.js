// Login Page JavaScript

const AUTH_API = '../php/auth.php';

document.addEventListener('DOMContentLoaded', function() {
    setupLoginForm();
    setupDemoAccounts();
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
                body: formData
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

function setupDemoAccounts() {
    const demoToggle = document.getElementById('demoToggle');
    const demoContent = document.getElementById('demoContent');
    
    demoToggle.addEventListener('click', function() {
        demoContent.classList.toggle('active');
        this.innerHTML = demoContent.classList.contains('active') ? 
            '<i class="fas fa-chevron-up"></i>' : '<i class="fas fa-chevron-down"></i>';
    });
    
    const demoAccounts = document.querySelectorAll('.demo-account');
    
    demoAccounts.forEach(account => {
        account.addEventListener('click', function() {
            const role = this.getAttribute('data-role');
            let username, password;
            
            switch(role) {
                case 'admin':
                    username = 'admin';
                    password = 'admin123';
                    break;
                case 'doctor':
                    username = 'doctor';
                    password = 'doctor123';
                    break;
                case 'pharmacist':
                    username = 'pharmacist';
                    password = 'pharma123';
                    break;
                case 'manager':
                    username = 'manager';
                    password = 'manager123';
                    break;
                case 'patient':
                    username = 'patient';
                    password = 'patient123';
                    break;
            }
            
            document.getElementById('username').value = username;
            document.getElementById('password').value = password;
            
            demoAccounts.forEach(acc => acc.classList.remove('selected'));
            this.classList.add('selected');
            
            showMessage(`${role.charAt(0).toUpperCase() + role.slice(1)} credentials filled!`, 'success');
        });
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