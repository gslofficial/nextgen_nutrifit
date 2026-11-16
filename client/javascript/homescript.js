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
const profilePictureInput = document.getElementById('profilePictureInput');
let pendingProfilePicture = null;
let removeProfilePicture = false;

profilePictureInput.addEventListener('change', () => {
    const file = profilePictureInput.files[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 1.5 * 1024 * 1024) {
        alert('Choose a PNG, JPG, or WebP image under 1.5 MB.');
        profilePictureInput.value = '';
        return;
    }
    const reader = new FileReader();
    reader.onload = () => {
        pendingProfilePicture = reader.result;
        removeProfilePicture = false;
        const preview = document.getElementById('profilePicturePreview');
        preview.src = pendingProfilePicture;
        preview.hidden = false;
    };
    reader.readAsDataURL(file);
});

document.getElementById('removeProfilePictureBtn').addEventListener('click', () => {
    pendingProfilePicture = null;
    removeProfilePicture = true;
    profilePictureInput.value = '';
    document.getElementById('profilePicturePreview').hidden = true;
});

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
    pendingProfilePicture = null;
    removeProfilePicture = false;
    profilePictureInput.value = '';
    loadUserProfile();
});


// 3. SERVER SYNC: Load user data when page is opened
async function loadUserProfile() {
    try {
        const response = await fetch('/auth/profile', { credentials: 'same-origin' });

        if (response.status === 401) {
            window.location.href = 'loginpage.html';
            return;
        }
        if (!response.ok) throw new Error(`Profile request failed (${response.status}).`);

        const data = await response.json();

        // Render details on Screen
        document.getElementById('navUserName').innerText = data.fullName.split(' ')[0];
        document.getElementById('profName').innerText = data.fullName;
        document.getElementById('profEmail').innerText = data.email;
        document.getElementById('profAge').innerText = data.age;
        document.getElementById('profDob').innerText = data.dob;
        document.getElementById('profGender').innerText = data.gender;
        document.getElementById('profAddress').innerText = data.address || '—';
        document.getElementById('profCreated').innerText = data.createdAt ? new Date(data.createdAt).toLocaleDateString() : '—';
        const picture = document.getElementById('profilePicturePreview');
        const navPicture = document.getElementById('navProfilePicture');
        const navIcon = document.querySelector('.profile-avatar > i');
        if (data.profilePicture) {
            picture.src = data.profilePicture;
            picture.hidden = false;
            navPicture.src = data.profilePicture;
            navPicture.hidden = false;
            navIcon.hidden = true;
        } else {
            picture.hidden = true;
            navPicture.hidden = true;
            navIcon.hidden = false;
        }

        // Pre-fill updating inputs
        document.getElementById('editName').value = data.fullName;
        document.getElementById('editDob').value = data.dob;
        document.getElementById('editAddress').value = data.address || '';
        document.getElementById('editGender').value = data.gender || '';

    } catch (err) {
        console.error(err);
        const name = document.getElementById('navUserName');
        if (name) name.textContent = 'Profile unavailable';
    }
}

loadUserProfile();


// 4. ACTION INTERACTION: Submitting Form Updates to MongoDB backend
profileEditForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const updatedData = {
        fullName: document.getElementById('editName').value,
        dob: document.getElementById('editDob').value,
        address: document.getElementById('editAddress').value,
        gender: document.getElementById('editGender').value,
        profilePicture: pendingProfilePicture || undefined,
        removeProfilePicture
    };

    let response;
    try { response = await fetch('/auth/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
    }); } catch (error) { alert('Could not connect to the server.'); return; }

    const result = await response.json();

    alert(result.message);

    if (response.ok) {
        profileViewMode.style.display = 'block';
        profileEditForm.style.display = 'none';
        pendingProfilePicture = null;
        removeProfilePicture = false;
        profilePictureInput.value = '';
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
