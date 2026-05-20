const API_BASE = 'http://localhost:5000/api'; 
        let currentUser = null;
        let isLoginMode = true;
        let monitoringInterval = null;
        let historyChart = null;
        let greenhousesCache = []; 
        let currentLang = 'uk';

        // --- ДОВІДНИК ПЕРЕКЛАДІВ ---
        const translations = {
            uk: {
                pageTitle: "Greenhouse Control Panel",
                loginTitle: "Вхід в систему", regTitle: "Реєстрація",
                loginBtn: "Увійти", regBtn: "Зареєструватися", switchReg: "Змінити: Вхід / Реєстрація",
                emailPlaceholder: "Email", passPlaceholder: "Пароль", logout: "Вихід",
                tabGH: "🏠 Теплиці та Доступ", tabDev: "📟 Пристрої", tabRules: "⚙️ Правила", tabMon: "📈 Моніторинг",
                createGH: "➕ Створити нову теплицю", ghNamePlaceholder: "Назва теплиці", btnCreate: "Створити",
                yourGH: "Ваші теплиці", thName: "Назва", thOwner: "Власник", thRole: "Ваша роль", thActions: "Дії",
                addDevice: "➕ Додати пристрій", viewersCannotAddDev: "Глядачі не можуть додавати пристрої.",
                selectGH: "Оберіть теплицю...", devNamePlaceholder: "Назва пристрою", devTypePlaceholder: "Тип (напр. TemperatureSensor)",
                btnAddDevice: "Додати пристрій", deviceList: "Список пристроїв", thType: "Тип", thGH: "Теплиця",
                createRule: "➕ Створити правило алерту", viewersCannotAddRule: "Глядачі не можуть змінювати правила.",
                selectDev: "Оберіть пристрій...", condGreater: "Більше ніж (>)", condLess: "Менше ніж (<)",
                thresholdPlaceholder: "Поріг", btnCreateRule: "Створити правило", activeRules: "Активні правила",
                thDev: "Пристрій", thCond: "Умова", thThreshold: "Поріг",
                historyAnalytic: "📅 Історія та Аналітика", dateFrom: "З дати:", dateTo: "По дату:", btnChart: "📊 Графік",
                activeAlerts: "🚨 Активні Тривоги", thTime: "Час", thMsg: "Повідомлення",
                liveData: "🌡 Живі дані", thValue: "Значення", thStatus: "Статус",
                
                // Тексти для JS
                alertEmptyFields: "Введіть email та пароль",
                alertRegSuccess: "Реєстрація успішна! Увійдіть.",
                alertError: "Помилка: ",
                emptyList: "Список порожній",
                roleOwner: "Власник", roleSpec: "Спеціаліст", roleViewer: "Глядач",
                btnDelete: "Видалити", grantAccess: "Надати доступ",
                userEmailPlaceholder: "Email користувача", btnOk: "OK",
                confirmDeleteGH: "Видалити теплицю?",
                alertEnterEmail: "Введіть Email",
                alertAccessGranted: "Доступ надано користувачу ",
                readOnly: "Тільки читання",
                emptyDevices: "Немає пристроїв",
                alertFillData: "Заповніть дані",
                confirmDelete: "Видалити?",
                emptyRules: "Правил немає",
                statusHot: "HOT", statusOkLabel: "OK",
                allClear: "Все спокійно",
                alertSelectDates: "Оберіть дати", alertNoData: "Даних немає"
            },
            en: {
                pageTitle: "Greenhouse Control Panel",
                loginTitle: "System Login", regTitle: "Registration",
                loginBtn: "Login", regBtn: "Register", switchReg: "Switch: Login / Register",
                emailPlaceholder: "Email", passPlaceholder: "Password", logout: "Logout",
                tabGH: "🏠 Greenhouses & Access", tabDev: "📟 Devices", tabRules: "⚙️ Rules", tabMon: "📈 Monitoring",
                createGH: "➕ Create New Greenhouse", ghNamePlaceholder: "Greenhouse Name", btnCreate: "Create",
                yourGH: "Your Greenhouses", thName: "Name", thOwner: "Owner", thRole: "Your Role", thActions: "Actions",
                addDevice: "➕ Add Device", viewersCannotAddDev: "Viewers cannot add devices.",
                selectGH: "Select greenhouse...", devNamePlaceholder: "Device Name", devTypePlaceholder: "Type (e.g. TemperatureSensor)",
                btnAddDevice: "Add Device", deviceList: "Device List", thType: "Type", thGH: "Greenhouse",
                createRule: "➕ Create Alert Rule", viewersCannotAddRule: "Viewers cannot change rules.",
                selectDev: "Select device...", condGreater: "Greater than (>)", condLess: "Less than (<)",
                thresholdPlaceholder: "Threshold", btnCreateRule: "Create Rule", activeRules: "Active Rules",
                thDev: "Device", thCond: "Condition", thThreshold: "Threshold",
                historyAnalytic: "📅 History & Analytics", dateFrom: "From:", dateTo: "To:", btnChart: "📊 Chart",
                activeAlerts: "🚨 Active Alerts", thTime: "Time", thMsg: "Message",
                liveData: "🌡 Live Data", thValue: "Value", thStatus: "Status",
                
                // Тексти для JS
                alertEmptyFields: "Enter email and password",
                alertRegSuccess: "Registration successful! Please login.",
                alertError: "Error: ",
                emptyList: "List is empty",
                roleOwner: "Owner", roleSpec: "Specialist", roleViewer: "Viewer",
                btnDelete: "Delete", grantAccess: "Grant Access",
                userEmailPlaceholder: "User Email", btnOk: "OK",
                confirmDeleteGH: "Delete greenhouse?",
                alertEnterEmail: "Enter Email",
                alertAccessGranted: "Access granted to user ",
                readOnly: "Read only",
                emptyDevices: "No devices",
                alertFillData: "Fill in the data",
                confirmDelete: "Delete?",
                emptyRules: "No rules",
                statusHot: "HOT", statusOkLabel: "OK",
                allClear: "All clear",
                alertSelectDates: "Select dates", alertNoData: "No data"
            }
        };

        function t(key) {
            return translations[currentLang][key];
        }

        function changeLanguage(lang) {
            currentLang = lang;
            document.getElementById('html-tag').lang = lang;
            
            // Синхронізуємо всі селекти мови на сторінці
            document.querySelectorAll('.lang-select').forEach(select => {
                select.value = lang;
            });

            // Оновлюємо статичні тексти
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (translations[lang][key]) el.innerText = translations[lang][key];
            });

            // Оновлюємо плейсхолдери
            document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
                const key = el.getAttribute('data-i18n-placeholder');
                if (translations[lang][key]) el.placeholder = translations[lang][key];
            });

            // Оновлюємо заголовок форми входу залежно від режиму
            document.getElementById('auth-title').innerText = isLoginMode ? t('loginTitle') : t('regTitle');
            document.getElementById('auth-btn').innerText = isLoginMode ? t('loginBtn') : t('regBtn');

            // Якщо користувач залогінений - перемальовуємо поточну вкладку, щоб оновити динамічний текст
            if (currentUser) {
                if (!document.getElementById('tab-greenhouses').classList.contains('hidden')) loadGreenhouses();
                if (!document.getElementById('tab-devices').classList.contains('hidden')) loadDevices();
                if (!document.getElementById('tab-rules').classList.contains('hidden')) loadRules();
                if (!document.getElementById('tab-monitoring').classList.contains('hidden')) {
                    loadLiveReadings();
                    loadAlerts();
                }
            }
        }

        const today = new Date();
        const lastWeek = new Date();
        lastWeek.setDate(today.getDate() - 7);
        document.getElementById('history-end').valueAsDate = today;
        document.getElementById('history-start').valueAsDate = lastWeek;

        // --- AUTH ---
        function toggleAuthMode() {
            isLoginMode = !isLoginMode;
            document.getElementById('auth-title').innerText = isLoginMode ? t('loginTitle') : t('regTitle');
            document.getElementById('auth-btn').innerText = isLoginMode ? t('loginBtn') : t('regBtn');
        }

        async function handleAuth() {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const endpoint = isLoginMode ? '/auth/login' : '/auth/register';

            if(!email || !password) return alert(t('alertEmptyFields'));

            try {
                const res = await fetch(API_BASE + endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                if (!res.ok) throw new Error(await res.text());
                const data = await res.json();
                currentUser = { id: data.id, email: data.email };

                if (!isLoginMode) { alert(t('alertRegSuccess')); toggleAuthMode(); return; }
                initDashboard();
            } catch (err) { alert(t('alertError') + err.message); }
        }

        function logout() {
            currentUser = null;
            greenhousesCache = [];
            clearInterval(monitoringInterval);
            document.getElementById('dashboard').classList.add('hidden');
            document.getElementById('auth-screen').classList.remove('hidden');
            document.getElementById('email').value = '';
            document.getElementById('password').value = '';
        }

        function initDashboard() {
            document.getElementById('auth-screen').classList.add('hidden');
            document.getElementById('dashboard').classList.remove('hidden');
            document.getElementById('display-email').innerText = currentUser.email;
            
            loadGreenhouses(); 
            
            monitoringInterval = setInterval(() => {
                if(document.getElementById('tab-monitoring').style.display !== 'none') {
                    loadLiveReadings();
                    loadAlerts();
                }
            }, 5000);
        }

        function switchTab(tabName) {
            document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
            document.getElementById('tab-' + tabName).classList.remove('hidden');
            document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
            event.target.classList.add('active');

            if (tabName === 'greenhouses') loadGreenhouses();
            if (tabName === 'devices') loadDevices();
            if (tabName === 'rules') loadRules();
            if (tabName === 'monitoring') { loadLiveReadings(); loadAlerts(); }
        }

        async function apiCall(url, method = 'GET', body = null) {
             if (!currentUser || !currentUser.id) return null;
             const separator = url.includes('?') ? '&' : '?';
             const finalUrl = `${API_BASE}${url}${separator}userId=${currentUser.id}`;
             const options = { method, headers: { 'Content-Type': 'application/json' } };
             if (body) options.body = JSON.stringify(body);

             try {
                 const res = await fetch(finalUrl, options);
                 if (!res.ok) throw new Error(await res.text());
                 if (method === 'DELETE') return true; 
                 return await res.json();
             } catch (err) {
                 console.error(err);
                 alert(t('alertError') + err.message);
                 return null;
             }
        }

        // GREENHOUSES & ACCESS 
        async function loadGreenhouses() {
            const data = await apiCall('/greenhouses');
            if (!data) return;
            greenhousesCache = data; 
            
            const tbody = document.querySelector('#greenhouses-table tbody');
            const select = document.getElementById('dev-gh-select');
            tbody.innerHTML = '';
            select.innerHTML = `<option value="">${t('selectGH')}</option>`;

            if(data.length === 0) tbody.innerHTML = `<tr><td colspan="5" style="text-align:center">${t('emptyList')}</td></tr>`;

            data.forEach(g => {
                let roleBadge = '';
                let roleName = '';
                let canDelete = false;
                let canShare = false;

                if (g.userRole === 0) { 
                    roleName = t('roleOwner'); roleBadge = 'role-owner'; canDelete = true; canShare = true;
                } else if (g.userRole === 1) {
                    roleName = t('roleSpec'); roleBadge = 'role-specialist'; canDelete = false; canShare = false;
                } else {
                    roleName = t('roleViewer'); roleBadge = 'role-viewer'; canDelete = false; canShare = false;
                }

                let actions = '';
                if(canDelete) actions += `<button class="danger" onclick="deleteGreenhouse(${g.id})">${t('btnDelete')}</button>`;
                
                let shareForm = '';
                if(canShare) {
                    shareForm = `
                        <div class="share-form">
                            <strong>${t('grantAccess')}:</strong><br>
                            <input type="text" id="share-email-${g.id}" placeholder="${t('userEmailPlaceholder')}" style="width: 150px;">
                            <select id="share-role-${g.id}" style="width: 120px;">
                                <option value="1">${t('roleSpec')}</option>
                                <option value="2">${t('roleViewer')}</option>
                            </select>
                            <button onclick="grantAccess(${g.id})">${t('btnOk')}</button>
                        </div>
                    `;
                }

                tbody.innerHTML += `
                    <tr>
                        <td>${g.id}</td>
                        <td><b>${g.name}</b></td>
                        <td>${g.ownerEmail}</td>
                        <td><span class="role-badge ${roleBadge}">${roleName}</span></td>
                        <td>
                            ${actions}
                            ${shareForm}
                        </td>
                    </tr>
                `;
                
                if(g.userRole !== 2) {
                    select.innerHTML += `<option value="${g.id}">${g.name}</option>`;
                }
            });
        }

        async function createGreenhouse() {
            const name = document.getElementById('gh-name').value;
            if(!name) return;
            if(await apiCall('/greenhouses', 'POST', { name, ownerUserId: currentUser.id })) {
                document.getElementById('gh-name').value = '';
                loadGreenhouses();
            }
        }

        async function deleteGreenhouse(id) {
            if(!confirm(t('confirmDeleteGH'))) return;
            if(await apiCall(`/greenhouses/${id}`, 'DELETE')) loadGreenhouses();
        }

        async function grantAccess(ghId) {
            const email = document.getElementById(`share-email-${ghId}`).value;
            const role = document.getElementById(`share-role-${ghId}`).value;
            
            if(!email) return alert(t('alertEnterEmail'));

            const url = `/greenhouses/grant-access?greenhouseId=${ghId}&targetEmail=${email}&role=${role}&currentUserId=${currentUser.id}`;
            
            try {
                const res = await fetch(API_BASE + url, { method: 'POST' });
                if(!res.ok) throw new Error(await res.text());
                
                alert(`${t('alertAccessGranted')} ${email}`);
                document.getElementById(`share-email-${ghId}`).value = '';
            } catch(e) {
                alert(t('alertError') + e.message);
            }
        }

        // DEVICES 
        async function loadDevices() {
            if (greenhousesCache.length === 0) await loadGreenhouses();
            
            const tbody = document.querySelector('#devices-table tbody');
            const ruleSelect = document.getElementById('rule-dev-select');
            tbody.innerHTML = '';
            ruleSelect.innerHTML = `<option value="">${t('selectDev')}</option>`;
            
            let hasDevices = false;
            greenhousesCache.forEach(gh => {
                const canManage = gh.userRole !== 2; 

                gh.devices.forEach(d => {
                    hasDevices = true;
                    let delBtn = canManage ? `<button class="danger" onclick="deleteDevice(${d.id})">${t('btnDelete')}</button>` : `<span style="color:gray">${t('readOnly')}</span>`;
                    
                    tbody.innerHTML += `<tr><td>${d.id}</td><td>${d.name}</td><td>${d.deviceType}</td><td>${gh.name}</td><td>${delBtn}</td></tr>`;
                    
                    if(canManage) {
                        ruleSelect.innerHTML += `<option value="${d.id}">${d.name} (${gh.name})</option>`;
                    }
                });
            });
            if(!hasDevices) tbody.innerHTML = `<tr><td colspan="5" style="text-align:center">${t('emptyDevices')}</td></tr>`;
        }

        async function createDevice() {
            const ghId = document.getElementById('dev-gh-select').value;
            const name = document.getElementById('dev-name').value;
            const type = document.getElementById('dev-type').value;
            if(!ghId || !name) return alert(t('alertFillData'));

            if(await apiCall('/devices', 'POST', { name, deviceType: type, greenhouseId: parseInt(ghId) })) {
                 document.getElementById('dev-name').value = '';
                 loadDevices();
            }
        }

        async function deleteDevice(id) {
            if(!confirm(t('confirmDelete'))) return;
            if(await apiCall(`/devices/${id}`, 'DELETE')) loadDevices();
        }

        // RULES
        async function loadRules() {
            const data = await apiCall('/alertrules');
            if (!data) return;
            const tbody = document.querySelector('#rules-table tbody');
            tbody.innerHTML = '';
            if(data.length === 0) tbody.innerHTML = `<tr><td colspan="5" style="text-align:center">${t('emptyRules')}</td></tr>`;

            data.forEach(r => {
                const cond = r.condition === 'GreaterThan' ? '<span style="color:red"> > </span>' : '<span style="color:blue"> < </span>';
                
                tbody.innerHTML += `<tr><td>${r.id}</td><td>Device #${r.deviceId}</td><td>${cond}</td>
                        <td style="font-weight:bold;">${r.thresholdValue}</td>
                        <td><button class="danger" onclick="deleteRule(${r.id})">${t('btnDelete')}</button></td></tr>`;
            });
        }

        async function createRule() {
            const devId = document.getElementById('rule-dev-select').value;
            const cond = document.getElementById('rule-condition').value;
            const val = document.getElementById('rule-val').value;
            if(!devId || !val) return alert(t('alertFillData'));

            if(await apiCall('/alertrules', 'POST', { deviceId: parseInt(devId), condition: cond, thresholdValue: parseFloat(val) })) {
                 document.getElementById('rule-val').value = '';
                 loadRules();
            }
        }

        async function deleteRule(id) {
            if(await apiCall(`/alertrules/${id}`, 'DELETE')) loadRules();
        }

        // MONITORING
        async function loadLiveReadings() {
            const data = await apiCall('/readings'); 
            if (!data) return;
            const tbody = document.querySelector('#readings-table-live tbody');
            tbody.innerHTML = '';
            data.slice(0, 15).forEach(r => {
                const localeStr = currentLang === 'uk' ? 'uk-UA' : 'en-US';
                const date = new Date(r.timestamp).toLocaleString(localeStr);
                const statusClass = r.value > 40 ? 'status-alert' : 'status-ok';
                const statusText = r.value > 40 ? t('statusHot') : t('statusOkLabel');

                tbody.innerHTML += `<tr><td>${date}</td><td>Device #${r.deviceId}</td><td><b>${r.value.toFixed(1)}</b></td>
                        <td><span class="${statusClass}">${statusText}</span></td></tr>`;
            });
        }

        async function loadAlerts() {
            const data = await apiCall('/alerts');
            if (!data) return;
            const tbody = document.querySelector('#alerts-table tbody');
            tbody.innerHTML = '';
            if(data.length === 0) tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color: green;">${t('allClear')}</td></tr>`;
            
            data.forEach(a => {
                const localeStr = currentLang === 'uk' ? 'uk-UA' : 'en-US';
                const date = new Date(a.timestamp).toLocaleString(localeStr);
                tbody.innerHTML += `<tr class="alert-row"><td>${date}</td><td>${a.deviceName}</td>
                        <td style="color:#c62828; font-weight:bold;">${a.message} (Val: ${a.value})</td></tr>`;
            });
        }

        // --- CHART & CSV ---
        async function loadHistory() {
             const start = document.getElementById('history-start').value;
             const end = document.getElementById('history-end').value;
             if (!start || !end) return alert(t('alertSelectDates'));
             
             const url = `${API_BASE}/readings?from=${start}&to=${end}&userId=${currentUser.id}`; 
             try {
                 const res = await fetch(url);
                 const data = await res.json();
                 if (!data || data.length === 0) {
                     if(historyChart) historyChart.destroy();
                     return alert(t('alertNoData'));
                 }
                 renderChart(data);
             } catch(e) { console.error(e); }
        }

        function renderChart(data) {
            const ctx = document.getElementById('historyChart').getContext('2d');
            if (historyChart) historyChart.destroy();

            const devicesData = {};
            data.forEach(r => {
                if (!devicesData[r.deviceId]) devicesData[r.deviceId] = [];
                devicesData[r.deviceId].push({ x: new Date(r.timestamp), y: r.value });
            });

            const datasets = Object.keys(devicesData).map((deviceId, index) => {
                const colors = ['#2e7d32', '#1565c0', '#c62828', '#f9a825', '#6a1b9a'];
                return {
                    label: `Dev #${deviceId}`,
                    data: devicesData[deviceId],
                    borderColor: colors[index % colors.length],
                    borderWidth: 2,
                    tension: 0.3,
                    pointRadius: 3
                };
            });

            historyChart = new Chart(ctx, {
                type: 'line',
                data: { datasets: datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { type: 'time', time: { unit: 'day', displayFormats: { day: 'dd.MM' } } },
                        y: { beginAtZero: false }
                    }
                }
            });
        }

        async function downloadCSV() {
            const start = document.getElementById('history-start').value;
            const end = document.getElementById('history-end').value;
            const url = `${API_BASE}/readings?from=${start}&to=${end}&userId=${currentUser.id}`;
            const res = await fetch(url);
            const data = await res.json();
            
            if(!data || data.length === 0) return alert(t('alertNoData'));

            let csv = "Timestamp,DeviceID,Value\n";
            data.forEach(r => {
                const localeStr = currentLang === 'uk' ? 'uk-UA' : 'en-US';
                csv += `${new Date(r.timestamp).toLocaleString(localeStr)},${r.deviceId},${r.value}\n`;
            });

            const link = document.createElement("a");
            link.href = "data:text/csv;charset=utf-8," + encodeURI(csv);
            link.download = `report_${start}_${end}.csv`;
            link.click();
        }

        // Встановлюємо мову за замовчуванням при завантаженні сторінки
        document.addEventListener('DOMContentLoaded', () => {
            changeLanguage('uk');
        });
        function toggleDirection() {
    const currentDir = document.documentElement.dir || 'ltr';
    document.documentElement.dir = currentDir === 'ltr' ? 'rtl' : 'ltr';
}



// 3. УНІВЕРСАЛЬНЕ СОРТУВАННЯ БУДЬ-ЯКИХ ТАБЛИЦЬ 
function sortTable(tableId, colIndex, type = 'string') {
    const table = document.getElementById(tableId);
    const tbody = table.querySelector('tbody');
    
    // Якщо таблиця порожня (або там висить повідомлення "Список порожній"), нічого не робимо
    if (tbody.rows.length <= 1 && tbody.rows[0].cells.length === 1) return;

    // Отримуємо всі рядки в масив
    const rows = Array.from(tbody.rows);
    
    // Визначаємо поточний напрямок сортування (за замовчуванням 'asc' - за зростанням)
    let dir = table.getAttribute('data-sort-dir') === 'asc' ? 'desc' : 'asc';
    let lastCol = table.getAttribute('data-sort-col');

    // Якщо клікнули на іншу колонку, починаємо сортування з початку (за зростанням)
    if (lastCol != colIndex) dir = 'asc';

    // Зберігаємо нові налаштування в саму таблицю
    table.setAttribute('data-sort-dir', dir);
    table.setAttribute('data-sort-col', colIndex);

    // Сортуємо рядки
    rows.sort((a, b) => {
        // Беремо текст із потрібних клітинок (colIndex)
        let cellA = a.cells[colIndex].innerText.trim();
        let cellB = b.cells[colIndex].innerText.trim();

        if (type === 'number') {
            // Якщо це числа (наприклад, ID або Поріг)
            let numA = parseFloat(cellA) || 0;
            let numB = parseFloat(cellB) || 0;
            return dir === 'asc' ? numA - numB : numB - numA;
        } else {
            // Якщо це текст, використовуємо локалізоване сортування (localeCompare)
            return dir === 'asc' 
                ? cellA.localeCompare(cellB, currentLang) 
                : cellB.localeCompare(cellA, currentLang);
        }
    });

    // Повертаємо відсортовані рядки назад у HTML
    tbody.append(...rows);
}