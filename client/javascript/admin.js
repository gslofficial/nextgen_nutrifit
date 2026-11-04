// ========================================================
// AUTH GUARD — bounce back to admin login if not authenticated
// ========================================================
async function checkAdminAuth() {
    try {
        const res = await fetch('/admin/auth/me');
        if (!res.ok) throw new Error('unauthorized');
        const admin = await res.json();
        document.getElementById('adminIdentity').textContent = `${admin.fullName} · ${admin.email}`;
    } catch (err) {
        window.location.href = 'adminlogin.html';
    }
}
checkAdminAuth();

document.getElementById('logoutBtn').addEventListener('click', async () => {
    await fetch('/admin/auth/logout', { method: 'POST' });
    window.location.href = 'adminlogin.html';
});

// ========================================================
// TAB NAVIGATION
// ========================================================
document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`section-${btn.dataset.section}`).classList.add('active');
    });
});

// ========================================================
// MODAL HELPERS
// ========================================================
function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.close));
});
document.querySelectorAll('.modal-backdrop').forEach(bg => {
    bg.addEventListener('click', (e) => { if (e.target === bg) bg.classList.add('hidden'); });
});

// ========================================================
// FOODS
// ========================================================
const foodsTableBody = document.getElementById('foodsTableBody');
const foodsEmpty = document.getElementById('foodsEmpty');
const foodForm = document.getElementById('foodForm');
const foodFormError = document.getElementById('foodFormError');

async function loadFoods() {
    const res = await fetch('/admin/api/foods');
    const foods = await res.json();
    foodsTableBody.innerHTML = '';
    foodsEmpty.classList.toggle('hidden', foods.length !== 0);
    foods.forEach(f => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${escapeHtml(f.name)}</td>
            <td>${escapeHtml(f.type)}</td>
            <td>${escapeHtml(f.group)}</td>
            <td>${f.kcal}</td>
            <td>${f.protein ?? 0}g</td>
            <td>${f.carbs ?? 0}g</td>
            <td>${f.fat ?? 0}g</td>
            <td style="white-space:nowrap;">
                <button class="btn-icon" data-edit-food="${f._id}" title="Edit"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-icon danger" data-delete-food="${f._id}" title="Delete"><i class="fa-solid fa-trash"></i></button>
            </td>`;
        foodsTableBody.appendChild(tr);
    });
}

document.getElementById('addFoodBtn').addEventListener('click', () => {
    foodForm.reset();
    document.getElementById('foodId').value = '';
    document.getElementById('foodModalTitle').textContent = 'Add food item';
    foodFormError.textContent = '';
    openModal('foodModalBackdrop');
});

foodsTableBody.addEventListener('click', async (e) => {
    const editBtn = e.target.closest('[data-edit-food]');
    const delBtn = e.target.closest('[data-delete-food]');

    if (editBtn) {
        const res = await fetch('/admin/api/foods');
        const foods = await res.json();
        const f = foods.find(x => x._id === editBtn.dataset.editFood);
        if (!f) return;
        document.getElementById('foodId').value = f._id;
        document.getElementById('foodName').value = f.name;
        document.getElementById('foodType').value = f.type;
        document.getElementById('foodGroup').value = f.group;
        document.getElementById('foodKcal').value = f.kcal;
        document.getElementById('foodProtein').value = f.protein ?? '';
        document.getElementById('foodCarbs').value = f.carbs ?? '';
        document.getElementById('foodFat').value = f.fat ?? '';
        document.getElementById('foodFiber').value = f.fiber ?? '';
        document.getElementById('foodSugar').value = f.sugar ?? '';
        document.getElementById('foodImage').value = f.image ?? '';
        document.getElementById('foodEmoji').value = f.emoji ?? '';
        document.getElementById('foodModalTitle').textContent = 'Edit food item';
        foodFormError.textContent = '';
        openModal('foodModalBackdrop');
    }

    if (delBtn) {
        if (!confirm('Remove this food item? This cannot be undone.')) return;
        const res = await fetch(`/admin/api/foods/${delBtn.dataset.deleteFood}`, { method: 'DELETE' });
        const result = await res.json();
        if (result.success) loadFoods();
        else alert(result.message);
    }
});

foodForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    foodFormError.textContent = '';

    const id = document.getElementById('foodId').value;
    const payload = {
        name: document.getElementById('foodName').value,
        type: document.getElementById('foodType').value,
        group: document.getElementById('foodGroup').value,
        kcal: Number(document.getElementById('foodKcal').value),
        protein: Number(document.getElementById('foodProtein').value) || 0,
        carbs: Number(document.getElementById('foodCarbs').value) || 0,
        fat: Number(document.getElementById('foodFat').value) || 0,
        fiber: Number(document.getElementById('foodFiber').value) || 0,
        sugar: Number(document.getElementById('foodSugar').value) || 0,
        image: document.getElementById('foodImage').value,
        emoji: document.getElementById('foodEmoji').value || '🍽️'
    };

    const url = id ? `/admin/api/foods/${id}` : '/admin/api/foods';
    const method = id ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
            closeModal('foodModalBackdrop');
            loadFoods();
        } else {
            foodFormError.textContent = result.message || 'Could not save food item.';
        }
    } catch (err) {
        foodFormError.textContent = 'Could not connect to the server.';
    }
});

// ========================================================
// EXERCISES
// ========================================================
const exercisesTableBody = document.getElementById('exercisesTableBody');
const exercisesEmpty = document.getElementById('exercisesEmpty');
const exerciseForm = document.getElementById('exerciseForm');
const exerciseFormError = document.getElementById('exerciseFormError');

async function loadExercises() {
    const res = await fetch('/admin/api/exercises');
    const exercises = await res.json();
    exercisesTableBody.innerHTML = '';
    exercisesEmpty.classList.toggle('hidden', exercises.length !== 0);
    exercises.forEach(ex => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${escapeHtml(ex.name)}</td>
            <td>${escapeHtml(ex.cat)}</td>
            <td>${escapeHtml(ex.group || '—')}</td>
            <td>${escapeHtml(ex.muscle)}</td>
            <td>${escapeHtml(ex.type)}</td>
            <td>${ex.sets ?? '—'}</td>
            <td style="white-space:nowrap;">
                <button class="btn-icon" data-edit-exercise="${ex._id}" title="Edit"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-icon danger" data-delete-exercise="${ex._id}" title="Delete"><i class="fa-solid fa-trash"></i></button>
            </td>`;
        exercisesTableBody.appendChild(tr);
    });
}

document.getElementById('addExerciseBtn').addEventListener('click', () => {
    exerciseForm.reset();
    document.getElementById('exerciseDocId').value = '';
    document.getElementById('exerciseSets').value = 3;
    document.getElementById('exerciseRest').value = 30;
    document.getElementById('exerciseModalTitle').textContent = 'Add exercise';
    exerciseFormError.textContent = '';
    openModal('exerciseModalBackdrop');
});

exercisesTableBody.addEventListener('click', async (e) => {
    const editBtn = e.target.closest('[data-edit-exercise]');
    const delBtn = e.target.closest('[data-delete-exercise]');

    if (editBtn) {
        const res = await fetch('/admin/api/exercises');
        const exercises = await res.json();
        const ex = exercises.find(x => x._id === editBtn.dataset.editExercise);
        if (!ex) return;
        document.getElementById('exerciseDocId').value = ex._id;
        document.getElementById('exerciseSlug').value = ex.exerciseId;
        document.getElementById('exerciseName').value = ex.name;
        document.getElementById('exerciseCat').value = ex.cat;
        document.getElementById('exerciseMuscle').value = ex.muscle;
        document.getElementById('exerciseGroup').value = ex.group || '';
        document.getElementById('exercisePattern').value = ex.pattern || '';
        document.getElementById('exerciseType').value = ex.type;
        document.getElementById('exerciseSets').value = ex.sets ?? '';
        document.getElementById('exerciseReps').value = ex.reps ?? '';
        document.getElementById('exerciseHold').value = ex.hold ?? '';
        document.getElementById('exerciseRest').value = ex.rest ?? '';
        document.getElementById('exerciseVideo').value = ex.video ?? '';
        document.getElementById('exerciseCues').value = (ex.cues || []).join('\n');
        document.getElementById('exerciseModalTitle').textContent = 'Edit exercise';
        exerciseFormError.textContent = '';
        openModal('exerciseModalBackdrop');
    }

    if (delBtn) {
        if (!confirm('Remove this exercise? This cannot be undone.')) return;
        const res = await fetch(`/admin/api/exercises/${delBtn.dataset.deleteExercise}`, { method: 'DELETE' });
        const result = await res.json();
        if (result.success) loadExercises();
        else alert(result.message);
    }
});

exerciseForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    exerciseFormError.textContent = '';

    const docId = document.getElementById('exerciseDocId').value;
    const cuesRaw = document.getElementById('exerciseCues').value;
    const payload = {
        exerciseId: document.getElementById('exerciseSlug').value.trim(),
        name: document.getElementById('exerciseName').value,
        cat: document.getElementById('exerciseCat').value,
        muscle: document.getElementById('exerciseMuscle').value,
        group: document.getElementById('exerciseGroup').value,
        pattern: document.getElementById('exercisePattern').value || 'core',
        type: document.getElementById('exerciseType').value,
        sets: Number(document.getElementById('exerciseSets').value) || 3,
        reps: document.getElementById('exerciseReps').value ? Number(document.getElementById('exerciseReps').value) : undefined,
        hold: document.getElementById('exerciseHold').value ? Number(document.getElementById('exerciseHold').value) : undefined,
        rest: Number(document.getElementById('exerciseRest').value) || 30,
        video: document.getElementById('exerciseVideo').value,
        cues: cuesRaw.split('\n').map(c => c.trim()).filter(Boolean)
    };

    const url = docId ? `/admin/api/exercises/${docId}` : '/admin/api/exercises';
    const method = docId ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
            closeModal('exerciseModalBackdrop');
            loadExercises();
        } else {
            exerciseFormError.textContent = result.message || 'Could not save exercise.';
        }
    } catch (err) {
        exerciseFormError.textContent = 'Could not connect to the server.';
    }
});

// ========================================================
// USERS
// ========================================================
const usersTableBody = document.getElementById('usersTableBody');
const usersEmpty = document.getElementById('usersEmpty');
const userForm = document.getElementById('userForm');
const userFormError = document.getElementById('userFormError');

async function loadUsers() {
    const res = await fetch('/admin/api/users');
    const users = await res.json();
    usersTableBody.innerHTML = '';
    usersEmpty.classList.toggle('hidden', users.length !== 0);
    users.forEach(u => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${escapeHtml(u.fullName)}</td>
            <td>${escapeHtml(u.email)}</td>
            <td>${u.age ?? '—'}</td>
            <td>${escapeHtml(u.gender || '—')}</td>
            <td><span class="role-badge ${u.role === 'admin' ? 'role-admin' : 'role-user'}">${u.role}</span></td>
            <td style="white-space:nowrap;">
                <button class="btn-icon" data-edit-user='${JSON.stringify(u).replace(/'/g, "&#39;")}' title="Edit"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-icon danger" data-delete-user="${u._id}" title="Delete"><i class="fa-solid fa-trash"></i></button>
            </td>`;
        usersTableBody.appendChild(tr);
    });
}

usersTableBody.addEventListener('click', async (e) => {
    const editBtn = e.target.closest('[data-edit-user]');
    const delBtn = e.target.closest('[data-delete-user]');

    if (editBtn) {
        const u = JSON.parse(editBtn.dataset.editUser.replace(/&#39;/g, "'"));
        document.getElementById('userId').value = u._id;
        document.getElementById('userFullName').value = u.fullName;
        document.getElementById('userAddress').value = u.address || '';
        document.getElementById('userAge').value = u.age ?? '';
        document.getElementById('userGender').value = u.gender || '';
        document.getElementById('userRole').value = u.role;
        userFormError.textContent = '';
        openModal('userModalBackdrop');
    }

    if (delBtn) {
        if (!confirm('Delete this user account? This cannot be undone.')) return;
        const res = await fetch(`/admin/api/users/${delBtn.dataset.deleteUser}`, { method: 'DELETE' });
        const result = await res.json();
        if (result.success) loadUsers();
        else alert(result.message);
    }
});

userForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    userFormError.textContent = '';

    const id = document.getElementById('userId').value;
    const payload = {
        fullName: document.getElementById('userFullName').value,
        address: document.getElementById('userAddress').value,
        age: Number(document.getElementById('userAge').value) || undefined,
        gender: document.getElementById('userGender').value,
        role: document.getElementById('userRole').value
    };

    try {
        const res = await fetch(`/admin/api/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
            closeModal('userModalBackdrop');
            loadUsers();
        } else {
            userFormError.textContent = result.message || 'Could not save user.';
        }
    } catch (err) {
        userFormError.textContent = 'Could not connect to the server.';
    }
});

// ========================================================
// UTIL
// ========================================================
function escapeHtml(str) {
    if (str === undefined || str === null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// ========================================================
// INITIAL LOAD
// ========================================================
loadFoods();
loadExercises();
loadUsers();
