 // 1. ORIGINAL ANIMATION COUNTER CODE
    const counters = document.querySelectorAll(".counter");
    counters.forEach(counter => {
        counter.innerText = "0";
        const update = () => {
            const target = +counter.getAttribute("data-target");
            const c = +counter.innerText;
            const increment = target / 150;
            if (c < target) {
                counter.innerText = Math.ceil(c + increment);
                setTimeout(update, 15);
            } else {
                counter.innerText = target.toLocaleString() + "+";
            }
        }
        update();
    });

// 2. DROPDOWN INTERACTION MANAGEMENT
const avatarBtn = document.getElementById('avatarBtn');
const profileDropdown = document.getElementById('profileDropdown');
const openEditBtn = document.getElementById('openEditBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const profileViewMode = document.getElementById('profileViewMode');
const profileEditForm = document.getElementById('profileEditForm');

avatarBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    profileDropdown.classList.toggle('active');
});

document.addEventListener('click', () => {
    profileDropdown.classList.remove('active');
});

profileDropdown.addEventListener('click', (e) => e.stopPropagation());

openEditBtn.addEventListener('click', () => {
    profileViewMode.style.display = 'none';
    profileEditForm.style.display = 'block';
});

cancelEditBtn.addEventListener('click', () => {
    profileViewMode.style.display = 'block';
    profileEditForm.style.display = 'none';
});


// 3. SERVER SYNC: Load user data when page is opened
async function loadUserProfile() {
    try {
        const response = await fetch('/auth/profile');

        if (!response.ok) {
            window.location.href = 'loginpage.html';
            return;
        }

        const data = await response.json();

        // Render details on Screen
        document.getElementById('navUserName').innerText = data.fullName.split(' ')[0];
        document.getElementById('profName').innerText = data.fullName;
        document.getElementById('profEmail').innerText = data.email;
        document.getElementById('profAge').innerText = data.age;
        document.getElementById('profDob').innerText = data.dob;
        document.getElementById('profGender').innerText = data.gender;

        // Pre-fill updating inputs
        document.getElementById('editName').value = data.fullName;
        document.getElementById('editAge').value = data.age;
        document.getElementById('editDob').value = data.dob;

    } catch (err) {
        console.error(err);
    }
}

loadUserProfile();


// 4. ACTION INTERACTION: Submitting Form Updates to MongoDB backend
profileEditForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const updatedData = {
        fullName: document.getElementById('editName').value,
        age: document.getElementById('editAge').value,
        dob: document.getElementById('editDob').value
    };

    const response = await fetch('/auth/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
    });

    const result = await response.json();

    alert(result.message);

    if (response.ok) {
        profileViewMode.style.display = 'block';
        profileEditForm.style.display = 'none';
        loadUserProfile();
    }
});


// 5. SIGN OUT SYNC INTERACTION RUNNER
document.getElementById('signoutBtn').addEventListener('click', async () => {
    const response = await fetch('/auth/logout', { method: 'POST' });
    const result = await response.json();

    if (result.success) {
        window.location.href = 'loginpage.html';
    }
});


const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => navLinks.classList.toggle("open"));

navLinks.querySelectorAll("a").forEach(a =>
    a.addEventListener("click", () => navLinks.classList.remove("open"))
);