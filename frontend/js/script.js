function togglePassword() {
    const passwordInput = document.getElementById('password');
    const eyeIconSvg = document.getElementById('eyeIconSvg');
    
    // Check current type
    const isPassword = passwordInput.getAttribute('type') === 'password';
    
    // Toggle input type
    const type = isPassword ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    // Toggle icon path
    if (isPassword) {
        // Switch to Open Eye (Show Password)
        eyeIconSvg.innerHTML = '<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>';
    } else {
        // Switch to Closed Eye (Hide Password)
        eyeIconSvg.innerHTML = '<path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 0 0 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>';
    }
}

// Toggle Login Mode (Password <-> QR)
function toggleLoginMode() {
    const passwordView = document.getElementById('password-login-view');
    const qrView = document.getElementById('qr-login-view');
    const qrToggleIcon = document.getElementById('qrToggleIcon');
    const qrTooltip = document.getElementById('qrTooltip');

    // Check if currently in Password mode (if password view is visible)
    const isPasswordMode = passwordView.style.display !== 'none';

    if (isPasswordMode) {
        // Switch to QR Mode
        passwordView.style.display = 'none';
        qrView.style.display = 'block';
        
        // Update Icon to PC (Monitor) - indicating "Click to go back to PC Login"
        // Using SVG for PC icon
        qrToggleIcon.innerHTML = `
            <svg viewBox="0 0 24 24" class="pc-icon-svg" fill="#999">
                <path d="M20 3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h3l-1 1v2h12v-2l-1-1h3c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 13H4V5h16v11z"/>
            </svg>
        `;
        
        // Update Tooltip Text
        qrTooltip.innerHTML = `
            账号密码登录
            <div class="tooltip-arrow"></div>
        `;
    } else {
        // Switch back to Password Mode
        passwordView.style.display = 'block';
        qrView.style.display = 'none';
        
        // Update Icon to QR Code - indicating "Click to Scan Login"
        qrToggleIcon.innerHTML = '<img src="images/qr_icon.png" alt="切换登录模式" class="corner-img">';
        
        // Update Tooltip Text
        qrTooltip.innerHTML = `
            扫码登录
            <div class="tooltip-arrow"></div>
        `;
    }
}

// Toast Functionality
function showToast(message, type = 'info') {
    // Create container if not exists
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Add icon based on type
    let icon = '';
    if (type === 'success') icon = '✓';
    else if (type === 'error') icon = '✕';
    else icon = 'ℹ';

    toast.innerHTML = `<span class="toast-icon">${icon}</span>${message}`;
    
    // Add to container
    container.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 3000);
}

// Validation Logic
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();

            if (!username) {
                showToast('请输入邮箱账号或手机号码', 'error');
                usernameInput.focus();
                return;
            }

            if (!password) {
                showToast('请输入密码', 'error');
                passwordInput.focus();
                return;
            }

            // If both valid
            showToast('登录成功', 'success');
            
            // Optional: Clear inputs or redirect
            // usernameInput.value = '';
            // passwordInput.value = '';
        });
    }
});
