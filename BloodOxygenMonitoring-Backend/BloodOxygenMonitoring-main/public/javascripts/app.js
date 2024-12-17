document.getElementById('register-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const role = document.getElementById('role').value;
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const gender = document.getElementById('gender').value;
    const phone = document.getElementById('phone').value;
    let data = { name, email, gender, phone };

    if (role === 'physician') {
        const specialization = document.getElementById('specialization').value;
        data.specialization = specialization;
    }

    try {
        const response = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        
        const result = await response.json();
        if (response.ok) {
            alert('Registration successful');
            window.location.href = 'login.html';
        } else {
            alert(result.message || 'Registration failed');
        }
    } catch (err) {
        console.error(err);
        alert('An error occurred');
    }
});

// Similar code for login and patient/physician dashboards with appropriate API calls
