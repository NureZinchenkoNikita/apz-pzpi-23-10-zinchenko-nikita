const API_BASE = 'http://localhost:5000/api/admin'; 
        let currentLang = 'uk';
        let currentGhId = null;
        let currentDevId = null;

        const i18n = {
            uk: {
              adminPageTitle: "Admin Panel - Smart Greenhouse", adminHeader: "Панель Адміністратора", btnExit: "Вийти", btnDir: "↔ Напрям тексту",
              tabUsers: "👥 Користувачі", tabGH: "🏠 Теплиці та Інфраструктура", tabExport: "💾 Завантаження даних",
               usersListTitle: "Усі користувачі системи", thEmail: "Email", thRole: "Роль", thActions: "Дії", thDate: "Дата реєстрації",
               btnBan: "Заблокувати", confirmBan: "Точно заблокувати користувача?",
                ghListTitle: "Управління теплицями", thName: "Назва", thOwner: "Власник",
                btnChangeOwner: "Змінити власника", btnAccess: "Доступи", btnDevices: "Пристрої", btnDelete: "Видалити",
                backToGH: "⬅ Повернутися до списку", accessForGH: "Доступи для теплиці #",
                emailPlaceholder: "Email користувача", roleSpec: "Спеціаліст", roleViewer: "Глядач", btnAddAccess: "Надати доступ",
                devicesForGH: "Пристрої теплиці #", devNamePlaceholder: "Назва", devTypePlaceholder: "Тип", thType: "Тип", btnAddDevice: "Додати",
                btnRules: "Правила", backToDev: "⬅ Назад", rulesForDev: "Правила для пристрою #",
                condGreater: "Більше ніж (>)", condLess: "Менше ніж (<)", thresholdPlaceholder: "Поріг", btnAddRule: "Додати", thCond: "Умова", thThreshold: "Поріг",
                exportTitle: "Гнучке завантаження даних", exportDesc: "Оберіть сутність для вивантаження її даних.",
               exportType: "Тип вивантаження:", expAll: "Уся система", expUser: "Користувач", expGH: "Теплиця", expDev: "Пристрій", btnDownload: "💾 Завантажити",
              promptNewOwner: "Введіть ID нового власника:", importTitle: "Відновлення з резервної копії (Імпорт)", btnImport: "📂 Імпортувати"
         },
         en: {
               adminPageTitle: "Admin Panel - Smart Greenhouse", adminHeader: "Administrator Panel", btnExit: "Exit", btnDir: "↔ Text Direction",
               tabUsers: "👥 Users", tabGH: "🏠 Greenhouses & Infrastructure", tabExport: "💾 Data Management",
               usersListTitle: "All System Users", thEmail: "Email", thRole: "Role", thActions: "Actions", thDate: "Registration Date",
               btnBan: "Ban/Block", confirmBan: "Are you sure you want to block this user?",
               ghListTitle: "Greenhouse Management", thName: "Name", thOwner: "Owner",
               btnChangeOwner: "Change Owner", btnAccess: "Access", btnDevices: "Devices", btnDelete: "Delete",
               backToGH: "⬅ Back", accessForGH: "Access for Greenhouse #",
               emailPlaceholder: "User Email", roleSpec: "Specialist", roleViewer: "Viewer", btnAddAccess: "Grant Access",
               devicesForGH: "Devices for Greenhouse #", devNamePlaceholder: "Device Name", devTypePlaceholder: "Type", thType: "Type", btnAddDevice: "Add",
               btnRules: "Rules", backToDev: "⬅ Back", rulesForDev: "Rules for Device #",
               condGreater: "Greater than (>)", condLess: "Less than (<)", thresholdPlaceholder: "Threshold", btnAddRule: "Add Rule", thCond: "Condition", thThreshold: "Threshold",
               exportTitle: "Flexible Data Download", exportDesc: "Select an entity to download its data.",
               exportType: "Export Type:", expAll: "Entire System", expUser: "Specific User", expGH: "Specific Greenhouse", expDev: "Specific Device", btnDownload: "💾 Download",
               promptNewOwner: "Enter ID of the new owner:", importTitle: "Restore from Backup (Import)", btnImport: "📂 Import"
         }
        };

        function t(key) { return i18n[currentLang][key]; }

        function changeLanguage(lang) {
            currentLang = lang;
         document.getElementById('html-tag').lang = lang;
         document.querySelectorAll('.lang-switch').forEach(s => s.value = lang);
    
          document.querySelectorAll('[data-i18n]').forEach(el => {
             const key = el.getAttribute('data-i18n');
                if (i18n[lang] && i18n[lang][key]) el.innerText = i18n[lang][key];
         });
    
            document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
             const key = el.getAttribute('data-i18n-placeholder');
                if (i18n[lang] && i18n[lang][key]) el.placeholder = i18n[lang][key];
         });
    
          if (!document.getElementById('tab-users').classList.contains('hidden')) renderUsersTable(); 
          if (!document.getElementById('tab-greenhouses').classList.contains('hidden')) showGhList();
        }

        // зміна напрямку тексту 
        function toggleDirection() {
               const currentDir = document.documentElement.dir || 'ltr';
          document.documentElement.dir = currentDir === 'ltr' ? 'rtl' : 'ltr';
        }

        async function apiAdminCall(url, method = 'GET', body = null) {
            const options = { method, headers: { 'Content-Type': 'application/json' } };
           if (body !== null && body !== undefined) options.body = JSON.stringify(body);
            try {
                const res = await fetch(API_BASE + url, options);
                if (!res.ok) throw new Error(await res.text());
                if (method === 'DELETE' || method === 'PUT') return true;
                return await res.json();
            } catch (err) {
                console.error(err);
                alert("API Error: " + err.message);
                return null;
            }
        }

        function switchTab(tabName) {
            document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
            document.getElementById('tab-' + tabName).classList.remove('hidden');
            document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
            event.target.classList.add('active');

            if (tabName === 'users') loadUsers();
            if (tabName === 'greenhouses') showGhList();
        }
        function executeImport() {
            const fileInput = document.getElementById('import-file');
            if (fileInput.files.length === 0) {
                alert("Будь ласка, оберіть JSON файл для імпорту.");
                return;
            }

            const file = fileInput.files[0];
            const reader = new FileReader();

            reader.onload = async function(e) {
                try {
                    const importedData = JSON.parse(e.target.result);
                    
                    if (Array.isArray(importedData) && importedData.length > 0 && importedData[0].value !== undefined) {
                        let successCount = 0;
                        for (let item of importedData) {
                            // Відправляємо на базовий API, а не адмінський
                            const res = await fetch(`http://localhost:5000/api/Readings`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(item)
                            });
                            if (res.ok) successCount++;
                        }
                        alert(`Імпорт завершено! Додано ${successCount} показників у базу даних.`);
                        return;
                    }

                    const res = await apiAdminCall('/import', 'POST', importedData);
                    if(res !== null) {
                        alert("Дані успішно імпортовано та відновлено!");
                        loadUsers(); 
                    }
                } catch (err) {
                    alert("Помилка читання файлу. Переконайтеся, що це валідний JSON.");
                }
            };
            reader.readAsText(file);
        }

        let usersData = [];
        let sortAscending = true;

        function formatLocalizedDate(isoString) {
            const date = new Date(isoString);
            // Використовуємо вбудований в браузер локалізатор
            return new Intl.DateTimeFormat(currentLang, {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            }).format(date);
        }

        function sortUsers() {
            sortAscending = !sortAscending;
            usersData.sort((a, b) => {
                return sortAscending 
                    ? a.email.localeCompare(b.email, currentLang) 
                    : b.email.localeCompare(a.email, currentLang);
            });
            renderUsersTable();
        }

        async function loadUsers() {
            let res = await apiAdminCall('/users');
            
          
            if (!res || res.length === 0) {
                usersData = [
                    { id: 1, email: "example@khnure.ua", role: "NoDATA", regDate: "2023-12-01T14:30:00Z" }
                ];
            } else {
                usersData = res;
            }
            
            renderUsersTable();
}

       function renderUsersTable() {
            const tbody = document.getElementById('admin-users-table');
            tbody.innerHTML = '';
            
            if (usersData.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" style="text-align:center">Список порожній</td></tr>`;
                return;
            }

            usersData.forEach(u => {
                let roleStr = u.role ? u.role : "User";

                tbody.innerHTML += `<tr>
                    <td>${u.id}</td>
                    <td>${u.email}</td>
                    <td>${roleStr}</td>
                    <td><button class="danger small" onclick="banUser(${u.id})">${t('btnBan') || 'Заблокувати'}</button></td>
                </tr>`;
            });
        }

        async function banUser(id) {
            if (!confirm(t('confirmBan'))) return;
            await apiAdminCall(`/users/${id}/ban`, 'DELETE');
            loadUsers();
        }


        function hideAllGhViews() {
            document.getElementById('view-gh-list').classList.add('hidden');
            document.getElementById('view-gh-access').classList.add('hidden');
            document.getElementById('view-gh-devices').classList.add('hidden');
            document.getElementById('view-dev-rules').classList.add('hidden');
        }

        async function showGhList() {
            hideAllGhViews();
            document.getElementById('view-gh-list').classList.remove('hidden');
            
            const gh = await apiAdminCall('/greenhouses') || [
                { id: 101, name: "Kharkiv Farm 1", ownerEmail: "admin@khnure.ua" }
            ];

            const tbody = document.getElementById('admin-gh-table');
            tbody.innerHTML = '';
            gh.forEach(g => {
                tbody.innerHTML += `<tr>
                    <td>${g.id}</td><td><b>${g.name}</b></td><td>${g.ownerEmail}</td>
                    <td>
                        <button class="small" onclick="changeOwner(${g.id})">${t('btnChangeOwner')}</button>
                        <button class="small success" onclick="showGhAccess(${g.id})">${t('btnAccess')}</button>
                        <button class="small" style="background:#0277bd" onclick="showGhDevices(${g.id})">${t('btnDevices')}</button>
                        <button class="small danger" onclick="deleteGhAdmin(${g.id})">${t('btnDelete')}</button>
                    </td>
                </tr>`;
            });
        }

        async function changeOwner(id) {
            const newId = prompt(t('promptNewOwner'));
            
           if (!newId || isNaN(parseInt(newId))) {
                alert("Помилка: потрібно ввести числовий ID користувача!");
                return; 
            }
            
            await apiAdminCall(`/greenhouses/${id}/owner?newOwnerId=${newId}`, 'PUT');
            showGhList();
        }

        async function deleteGhAdmin(id) {
            if (confirm("Delete greenhouse entirely?")) await apiAdminCall(`/greenhouses/${id}`, 'DELETE');
            showGhList();
        }

        async function showGhAccess(ghId) {
            currentGhId = ghId;
            hideAllGhViews();
            document.getElementById('view-gh-access').classList.remove('hidden');
            document.getElementById('access-gh-id').innerText = ghId;

            const accessList = await apiAdminCall(`/greenhouses/${ghId}/access`) || [];
            const tbody = document.getElementById('admin-access-table');
            tbody.innerHTML = '';
            accessList.forEach(a => {
                const roleStr = a.role === 1 ? t('roleSpec') : t('roleViewer');
                tbody.innerHTML += `<tr>
                    <td>${a.id}</td><td>${a.email}</td><td>${roleStr}</td>
                    <td><button class="danger small" onclick="removeAccess(${a.id})">${t('btnDelete')}</button></td>
                </tr>`;
            });
        }

        async function addAccessToGh() {
            const email = document.getElementById('new-access-email').value;
            const role = document.getElementById('new-access-role').value;
            await apiAdminCall(`/greenhouses/${currentGhId}/access`, 'POST', { email, role: parseInt(role) });
            showGhAccess(currentGhId);
        }

        async function removeAccess(accessId) {
            await apiAdminCall(`/access/${accessId}`, 'DELETE');
            showGhAccess(currentGhId);
        }

        async function showGhDevices(ghId) {
            currentGhId = ghId;
            hideAllGhViews();
            document.getElementById('view-gh-devices').classList.remove('hidden');
            document.getElementById('devices-gh-id').innerText = ghId;

            const devices = await apiAdminCall(`/greenhouses/${ghId}/devices`) || [];
            const tbody = document.getElementById('admin-devices-table');
            tbody.innerHTML = '';
            devices.forEach(d => {
                tbody.innerHTML += `<tr>
                    <td>${d.id}</td><td><b>${d.name}</b></td><td>${d.deviceType}</td>
                    <td>
                        <button class="small" style="background:#fbc02d; color:#000;" onclick="showDevRules(${d.id})">${t('btnRules')}</button>
                        <button class="danger small" onclick="deleteDevAdmin(${d.id})">${t('btnDelete')}</button>
                    </td>
                </tr>`;
            });
        }

        async function addDeviceToGh() {
            const name = document.getElementById('new-dev-name').value;
            const type = document.getElementById('new-dev-type').value;
            await apiAdminCall(`/devices`, 'POST', { greenhouseId: currentGhId, name, deviceType: type });
            showGhDevices(currentGhId);
        }

        async function deleteDevAdmin(devId) {
            await apiAdminCall(`/devices/${devId}`, 'DELETE');
            showGhDevices(currentGhId);
        }

        async function showDevRules(devId) {
            currentDevId = devId;
            hideAllGhViews();
            document.getElementById('view-dev-rules').classList.remove('hidden');
            document.getElementById('rules-dev-id').innerText = devId;

            const rules = await apiAdminCall(`/devices/${devId}/rules`) || [];
            const tbody = document.getElementById('admin-rules-table');
            tbody.innerHTML = '';
            rules.forEach(r => {
                tbody.innerHTML += `<tr>
                    <td>${r.id}</td><td>${r.condition}</td><td>${r.thresholdValue}</td>
                    <td><button class="danger small" onclick="deleteRuleAdmin(${r.id})">${t('btnDelete')}</button></td>
                </tr>`;
            });
        }

        async function addRuleToDev() {
            const cond = document.getElementById('new-rule-cond').value;
            const val = document.getElementById('new-rule-val').value;
            await apiAdminCall(`/alertrules`, 'POST', { deviceId: currentDevId, condition: cond, thresholdValue: parseFloat(val) });
            showDevRules(currentDevId);
        }

        async function deleteRuleAdmin(ruleId) {
            await apiAdminCall(`/alertrules/${ruleId}`, 'DELETE');
            showDevRules(currentDevId);
        }

        function toggleExportIdInput() {
            const type = document.getElementById('export-type').value;
            const container = document.getElementById('export-id-container');
            if (type === 'all') {
                container.classList.add('hidden');
            } else {
                container.classList.remove('hidden');
            }
        }

        function executeExport() {
            const type = document.getElementById('export-type').value;
            const id = document.getElementById('export-id').value;
            
            let url = `${API_BASE}/export?type=${type}`;
            if (type !== 'all') {
                if (!id) return alert("Введіть ID!");
                url += `&id=${id}`;
            }
            
            window.location.href = url;
        }

        document.addEventListener('DOMContentLoaded', () => {
            changeLanguage('uk');
            loadUsers();
        });