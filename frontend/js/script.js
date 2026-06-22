const ACCOUNT_STORAGE_KEY = 'mail163_accounts';
const MAX_HISTORY_ACCOUNTS = 10;
let currentCaptcha = '';

function generateCaptcha() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function getRandomColor(min = 50, max = 150) {
    const r = Math.floor(Math.random() * (max - min)) + min;
    const g = Math.floor(Math.random() * (max - min)) + min;
    const b = Math.floor(Math.random() * (max - min)) + min;
    return `rgb(${r},${g},${b})`;
}

function renderCaptcha() {
    currentCaptcha = generateCaptcha();
    const captchaImage = document.getElementById('captchaImage');
    if (!captchaImage) return;

    let html = '';
    for (let i = 0; i < currentCaptcha.length; i++) {
        const color = getRandomColor(30, 120);
        const rotate = (Math.random() - 0.5) * 30;
        const scaleY = 0.8 + Math.random() * 0.4;
        html += `<span style="color: ${color}; transform: rotate(${rotate}deg) scaleY(${scaleY}); display: inline-block;">${currentCaptcha.charAt(i)}</span>`;
    }
    captchaImage.innerHTML = html;
}

function refreshCaptcha() {
    renderCaptcha();
    document.getElementById('captcha').value = '';
}

function updateEmailSuffix(email) {
    const suffixEl = document.getElementById('emailSuffix');
    const usernameInput = document.getElementById('username');
    
    if (!email) {
        suffixEl.textContent = '@163.com';
        suffixEl.classList.remove('hidden');
        return;
    }

    const atIndex = email.indexOf('@');
    if (atIndex !== -1) {
        const suffix = email.substring(atIndex);
        suffixEl.textContent = suffix;
        suffixEl.classList.remove('hidden');
        usernameInput.value = email.substring(0, atIndex);
    } else if (/^\d+$/.test(email)) {
        suffixEl.classList.add('hidden');
        usernameInput.value = email;
    } else {
        suffixEl.textContent = '@163.com';
        suffixEl.classList.remove('hidden');
        usernameInput.value = email;
    }
}

function getFullEmail() {
    const usernameInput = document.getElementById('username');
    const suffixEl = document.getElementById('emailSuffix');
    const value = usernameInput.value.trim();
    
    if (!value) return '';
    
    if (suffixEl.classList.contains('hidden')) {
        return value;
    }
    return value + suffixEl.textContent;
}

function getHistoryAccounts() {
    try {
        const data = localStorage.getItem(ACCOUNT_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

function saveHistoryAccount(email) {
    if (!email) return;
    
    const isPublicComputer = document.getElementById('publicComputer').checked;
    if (isPublicComputer) return;

    let accounts = getHistoryAccounts();
    
    accounts = accounts.filter(acc => acc.email !== email);
    
    accounts.unshift({ email, lastLogin: Date.now() });
    
    if (accounts.length > MAX_HISTORY_ACCOUNTS) {
        accounts = accounts.slice(0, MAX_HISTORY_ACCOUNTS);
    }
    
    try {
        localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(accounts));
    } catch (e) {
        console.error('Failed to save account history:', e);
    }
}

function deleteHistoryAccount(email) {
    let accounts = getHistoryAccounts();
    accounts = accounts.filter(acc => acc.email !== email);
    try {
        localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(accounts));
    } catch (e) {
        console.error('Failed to delete account history:', e);
    }
}

function getAvatarColor(email) {
    const colors = [
        ['#4573f6', '#6a9fff'],
        ['#f645a8', '#ff6aa8'],
        ['#45f6a8', '#6affd0'],
        ['#f6a845', '#ffc87a'],
        ['#a845f6', '#c87aff'],
        ['#45d0f6', '#7ae0ff'],
        ['#f64545', '#ff7a7a'],
        ['#45f645', '#7aff7a']
    ];
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
        hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
}

function getAvatarText(email) {
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase();
}

function renderAccountList() {
    const accountList = document.getElementById('accountList');
    const accounts = getHistoryAccounts();
    
    if (accounts.length === 0) {
        accountList.innerHTML = '<div class="account-empty">暂无历史账号</div>';
        return;
    }
    
    accountList.innerHTML = accounts.map(acc => {
        const colors = getAvatarColor(acc.email);
        const avatarText = getAvatarText(acc.email);
        return `
            <div class="account-item" data-email="${acc.email}">
                <div class="account-item-avatar" style="background: linear-gradient(135deg, ${colors[0]}, ${colors[1]});">
                    ${avatarText}
                </div>
                <div class="account-item-info">
                    <div class="account-item-email">${acc.email}</div>
                </div>
                <div class="account-item-delete" data-delete="${acc.email}" title="删除账号">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                </div>
            </div>
        `;
    }).join('');
    
    accountList.querySelectorAll('.account-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('[data-delete]');
            if (deleteBtn) {
                e.stopPropagation();
                const email = deleteBtn.getAttribute('data-delete');
                deleteHistoryAccount(email);
                renderAccountList();
                const currentEmail = getFullEmail();
                if (currentEmail === email) {
                    document.getElementById('username').value = '';
                    updateEmailSuffix('');
                    updateAvatar('');
                }
                showToast('账号已删除', 'success');
                return;
            }
            
            const email = item.getAttribute('data-email');
            selectAccount(email);
        });
    });
}

function updateAvatar(email) {
    const avatarEl = document.getElementById('userAvatar');
    if (!email) {
        avatarEl.innerHTML = `
            <svg viewBox="0 0 24 24" width="18" height="18" fill="#999">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
        `;
        avatarEl.style.background = '#f0f2f5';
    } else {
        const colors = getAvatarColor(email);
        const avatarText = getAvatarText(email);
        avatarEl.innerHTML = `<span style="color: #fff; font-size: 14px; font-weight: bold;">${avatarText}</span>`;
        avatarEl.style.background = `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`;
    }
}

function selectAccount(email) {
    updateEmailSuffix(email);
    document.getElementById('password').value = '';
    document.getElementById('captcha').value = '';
    updateAvatar(email);
    refreshCaptcha();
    hideAccountDropdown();
    document.getElementById('password').focus();
}

function toggleAccountDropdown() {
    const dropdown = document.getElementById('accountDropdown');
    const toggleBtn = document.getElementById('accountDropdownToggle');
    const isOpen = dropdown.classList.contains('show');
    
    if (isOpen) {
        hideAccountDropdown();
    } else {
        showAccountDropdown();
    }
}

function showAccountDropdown() {
    const dropdown = document.getElementById('accountDropdown');
    const toggleBtn = document.getElementById('accountDropdownToggle');
    renderAccountList();
    dropdown.classList.add('show');
    toggleBtn.classList.add('open');
}

function hideAccountDropdown() {
    const dropdown = document.getElementById('accountDropdown');
    const toggleBtn = document.getElementById('accountDropdownToggle');
    dropdown.classList.remove('show');
    toggleBtn.classList.remove('open');
}

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const eyeIconSvg = document.getElementById('eyeIconSvg');
    
    const isPassword = passwordInput.getAttribute('type') === 'password';
    
    const type = isPassword ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    if (isPassword) {
        eyeIconSvg.innerHTML = '<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>';
    } else {
        eyeIconSvg.innerHTML = '<path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 0 0 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>';
    }
}

function toggleLoginMode() {
    const passwordView = document.getElementById('password-login-view');
    const qrView = document.getElementById('qr-login-view');
    const qrToggleIcon = document.getElementById('qrToggleIcon');
    const qrTooltip = document.getElementById('qrTooltip');

    const isPasswordMode = passwordView.style.display !== 'none';

    if (isPasswordMode) {
        passwordView.style.display = 'none';
        qrView.style.display = 'block';
        
        qrToggleIcon.innerHTML = `
            <svg viewBox="0 0 24 24" class="pc-icon-svg" fill="#999">
                <path d="M20 3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h3l-1 1v2h12v-2l-1-1h3c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 13H4V5h16v11z"/>
            </svg>
        `;
        
        qrTooltip.innerHTML = `
            账号密码登录
            <div class="tooltip-arrow"></div>
        `;
    } else {
        passwordView.style.display = 'block';
        qrView.style.display = 'none';
        
        qrToggleIcon.innerHTML = '<img src="images/qr_icon.png" alt="切换登录模式" class="corner-img">';
        
        qrTooltip.innerHTML = `
            扫码登录
            <div class="tooltip-arrow"></div>
        `;
    }
    
    hideAccountDropdown();
}

function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = '';
    if (type === 'success') icon = '✓';
    else if (type === 'error') icon = '✕';
    else icon = 'ℹ';

    toast.innerHTML = `<span class="toast-icon">${icon}</span>${message}`;
    
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const captchaInput = document.getElementById('captcha');
    const accountDropdownToggle = document.getElementById('accountDropdownToggle');
    const userAvatar = document.getElementById('userAvatar');
    const publicComputerCheckbox = document.getElementById('publicComputer');

    renderCaptcha();

    const accounts = getHistoryAccounts();
    if (accounts.length > 0) {
        updateEmailSuffix(accounts[0].email);
        updateAvatar(accounts[0].email);
    }

    accountDropdownToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleAccountDropdown();
    });

    userAvatar.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleAccountDropdown();
    });

    usernameInput.addEventListener('focus', () => {
        const accounts = getHistoryAccounts();
        if (accounts.length > 0) {
            showAccountDropdown();
        }
    });

    usernameInput.addEventListener('input', () => {
        const value = usernameInput.value.trim();
        updateAvatar(value);
        
        if (value && value.indexOf('@') === -1 && !/^\d+$/.test(value)) {
            const suffixEl = document.getElementById('emailSuffix');
            suffixEl.classList.remove('hidden');
        }
    });

    captchaInput.addEventListener('input', () => {
        let value = captchaInput.value.toUpperCase();
        value = value.replace(/[^A-Z0-9]/g, '');
        captchaInput.value = value;
    });

    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('accountDropdown');
        const wrapper = document.querySelector('.user-input-wrapper');
        if (!wrapper.contains(e.target) && !dropdown.contains(e.target)) {
            hideAccountDropdown();
        }
    });

    publicComputerCheckbox.addEventListener('change', () => {
        if (publicComputerCheckbox.checked) {
            showToast('公共电脑模式：不会保存登录痕迹', 'info');
        }
    });

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const email = getFullEmail();
            const password = passwordInput.value.trim();
            const captcha = captchaInput.value.trim().toUpperCase();

            if (!email) {
                showToast('请输入邮箱账号或手机号码', 'error');
                usernameInput.focus();
                return;
            }

            if (!password) {
                showToast('请输入密码', 'error');
                passwordInput.focus();
                return;
            }

            if (!captcha) {
                showToast('请输入验证码', 'error');
                captchaInput.focus();
                return;
            }

            if (captcha !== currentCaptcha) {
                showToast('验证码错误', 'error');
                captchaInput.focus();
                captchaInput.select();
                refreshCaptcha();
                return;
            }

            saveHistoryAccount(email);

            showToast('登录成功', 'success');
        });
    }
});
