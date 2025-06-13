document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
});

function handleLogin(event) {
    event.preventDefault();
    clearErrors();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;

    if (!validateLoginForm(email, password)) {
        return;
    }

    const formData = {
        email: email,
        password: password,
        remember: remember
    };

    submitForm('/login', formData, 'login');
}

function handleSignup(event) {
    event.preventDefault();
    clearErrors();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const terms = document.getElementById('terms').checked;

    if (!validateSignupForm(name, email, password, confirmPassword, terms)) {
        return;
    }

    const formData = {
        name: name,
        email: email,
        password: password
    };

    submitForm('/signup', formData, 'signup');
}

function validateLoginForm(email, password) {
    let isValid = true;

    if (!email) {
        showError('emailError', 'Email is required');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError('emailError', 'Please enter a valid email address');
        isValid = false;
    }

    if (!password) {
        showError('passwordError', 'Password is required');
        isValid = false;
    }

    return isValid;
}

function validateSignupForm(name, email, password, confirmPassword, terms) {
    let isValid = true;

    if (!name) {
        showError('nameError', 'Name is required');
        isValid = false;
    }

    if (!email) {
        showError('emailError', 'Email is required');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError('emailError', 'Please enter a valid email address');
        isValid = false;
    }

    if (!password) {
        showError('passwordError', 'Password is required');
        isValid = false;
    } else if (password.length < 6) {
        showError('passwordError', 'Password must be at least 6 characters long');
        isValid = false;
    }

    if (!confirmPassword) {
        showError('confirmPasswordError', 'Please confirm your password');
        isValid = false;
    } else if (password !== confirmPassword) {
        showError('confirmPasswordError', 'Passwords do not match');
        isValid = false;
    }

    if (!terms) {
        showError('termsError', 'You must agree to the terms and conditions');
        isValid = false;
    }

    return isValid;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function clearErrors() {
    const errorElements = document.querySelectorAll('.error');
    errorElements.forEach(element => {
        element.textContent = '';
        element.style.display = 'none';
    });
}

function submitForm(url, formData, type) {
    const submitButton = document.querySelector(`#${type}Form button[type="submit"]`);
    const originalText = submitButton.innerHTML;
    
    // Show loading state
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'same-origin',
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.error || 'An error occurred');
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            window.location.href = data.redirect || '/chat';
        } else {
            throw new Error(data.error || 'An error occurred');
        }
    })
    .catch(error => {
        const errorElement = document.getElementById(`${type}Error`);
        if (errorElement) {
            errorElement.textContent = error.message;
            errorElement.style.display = 'block';
        }
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
    });
} 