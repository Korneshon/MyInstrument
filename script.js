document.addEventListener('DOMContentLoaded', () => {
    // ========== ПЕРЕКЛЮЧЕНИЕ РАЗДЕЛОВ ==========
    const menuBtns = document.querySelectorAll('.menu-btn');
    const sections = document.querySelectorAll('.section');

    menuBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const sectionId = btn.dataset.section;
            menuBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(sectionId).classList.add('active');
        });
    });

    // ========== КАСТОМИЗАЦИЯ ЦВЕТОВ (ТЕМЫ) ==========
    const themeModal = document.getElementById('themeModal');
    const themeSettingsBtn = document.getElementById('themeSettingsBtn');
    const closeTheme = document.querySelector('.close-theme');
    const themeOptions = document.querySelectorAll('.theme-option');

    // Загрузка сохранённой темы
    const savedTheme = localStorage.getItem('theme') || 'green';
    setTheme(savedTheme);

    if (themeSettingsBtn) {
        themeSettingsBtn.addEventListener('click', () => {
            themeModal.style.display = 'block';
        });
    }

    if (closeTheme) {
        closeTheme.addEventListener('click', () => {
            themeModal.style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === themeModal) themeModal.style.display = 'none';
    });

    themeOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            const theme = opt.dataset.theme;
            setTheme(theme);
            localStorage.setItem('theme', theme);
            themeModal.style.display = 'none';
        });
    });

    function setTheme(theme) {
        const root = document.documentElement;
        const themes = {
            green: ['#a8e6cf', '#d4f3e3', '#f8bbd0', '#fce4e4', '#e0f2f1'],
            pink: ['#f8bbd0', '#fce4e9', '#a8e6cf', '#ffe0f0', '#ffe0b5'],
            blue: ['#b3e5fc', '#e1f5fe', '#ffccbc', '#e1f5fe', '#fff9c4'],
            lavender: ['#e1bee7', '#f3e5f5', '#c8e6c9', '#ede7f6', '#e0f2f1'],
            peach: ['#ffccbc', '#ffe4d6', '#ffe0b2', '#ffecdd', '#fff3e0']
        };
        const [primary, primaryLight, secondary, gradStart, gradEnd] = themes[theme];
        root.style.setProperty('--primary-color', primary);
        root.style.setProperty('--primary-light', primaryLight);
        root.style.setProperty('--secondary-color', secondary);
        root.style.setProperty('--gradient-start', gradStart);
        root.style.setProperty('--gradient-end', gradEnd);
    }

    // ========== ОТПРАВКА ПО ENTER (кроме textarea) ==========
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey && e.target.tagName !== 'TEXTAREA') {
            const form = e.target.closest('.add-form');
            if (form) {
                const btn = form.querySelector('button[type="button"]');
                if (btn) {
                    e.preventDefault();
                    btn.click();
                }
            }
        }
    });

    // ========== КАЛЕНДАРЬ ДНЕЙ РОЖДЕНИЙ С ВОЗРАСТОМ ==========
    let birthdays = JSON.parse(localStorage.getItem('birthdays')) || [];

    function renderCalendar() {
        const today = new Date();
        const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

        renderMonth(currentMonth, 'currentMonth');
        renderMonth(nextMonth, 'nextMonth');
    }

    function renderMonth(date, containerId) {
        const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
        const month = date.getMonth();
        const year = date.getFullYear();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();

        let html = `<h3>${monthNames[month]} ${year}</h3>`;
        html += '<div class="weekdays"><span>Пн</span><span>Вт</span><span>Ср</span><span>Чт</span><span>Пт</span><span>Сб</span><span>Вс</span></div>';
        html += '<div class="days-grid">';

        let startDay = firstDay === 0 ? 6 : firstDay - 1;
        for (let i = 0; i < startDay; i++) {
            html += '<div class="day-cell empty"></div>';
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const bdays = birthdays.filter(b => b.date === dateStr).map(b => {
                let age = '';
                if (b.year) {
                    const currentYear = today.getFullYear();
                    const hadBirthday = (today.getMonth() + 1 > month) || (today.getMonth() + 1 === month && today.getDate() >= d);
                    age = ` (${currentYear - b.year - (hadBirthday ? 0 : 1)} лет)`;
                }
                return b.name + age;
            }).join(', ');
            const hasBirthday = bdays.length > 0;
            const isToday = (month === today.getMonth() && d === today.getDate() && year === today.getFullYear());
            html += `<div class="day-cell ${hasBirthday ? 'birthday' : ''} ${isToday ? 'today' : ''}" data-names="${bdays}">${d}</div>`;
        }

        html += '</div>';
        document.getElementById(containerId).innerHTML = html;
    }

    document.getElementById('addBirthday').addEventListener('click', () => {
        const name = document.getElementById('bName').value.trim();
        const date = document.getElementById('bDate').value;
        const year = parseInt(document.getElementById('bYear').value);
        if (!name || !date) return;

        const [y, m, d] = date.split('-');
        const dateStr = `${m}-${d}`;
        birthdays.push({ name, date: dateStr, year: isNaN(year) ? null : year });
        localStorage.setItem('birthdays', JSON.stringify(birthdays));
        renderCalendar();
        document.getElementById('bName').value = '';
        document.getElementById('bDate').value = '';
        document.getElementById('bYear').value = '';
    });

    renderCalendar();

    // ========== ДНЕВНИК МЫСЛЕЙ С ТЕГАМИ И ФОТО ==========
    let thoughts = JSON.parse(localStorage.getItem('thoughts')) || [];

    function renderThoughts() {
        const list = document.getElementById('thoughtsList');
        list.innerHTML = thoughts.map(t => `
            <div class="entry-card" data-id="${t.id}">
                <div class="entry-header">
                    <small>${new Date(t.date).toLocaleString()}</small>
                    <button class="delete-btn" onclick="deleteThought('${t.id}')">×</button>
                </div>
                <div class="thought-entry">
                    ${t.photo ? `<img src="${t.photo}" class="thought-photo" alt="photo">` : ''}
                    <div class="thought-content">
                        <p>${t.text}</p>
                        ${t.tags ? `<div class="thought-tags">${t.tags.split(',').map(tag => `<span class="thought-tag">#${tag.trim()}</span>`).join('')}</div>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    window.deleteThought = (id) => {
        thoughts = thoughts.filter(t => t.id !== id);
        localStorage.setItem('thoughts', JSON.stringify(thoughts));
        renderThoughts();
    };

    document.getElementById('addThought').addEventListener('click', () => {
        const text = document.getElementById('thoughtText').value.trim();
        const tags = document.getElementById('thoughtTags').value.trim();
        const photoInput = document.getElementById('thoughtPhoto');
        if (!text) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const newThought = {
                id: Date.now().toString(),
                text,
                tags: tags || '',
                photo: e.target.result || null,
                date: new Date().toISOString()
            };
            thoughts.unshift(newThought);
            localStorage.setItem('thoughts', JSON.stringify(thoughts));
            renderThoughts();
            document.getElementById('thoughtText').value = '';
            document.getElementById('thoughtTags').value = '';
            document.getElementById('thoughtPhoto').value = '';
        };
        if (photoInput.files[0]) {
            reader.readAsDataURL(photoInput.files[0]);
        } else {
            reader.onload({ target: { result: null } });
        }
    });

    renderThoughts();

    // ========== ЧИТАТЕЛЬСКИЙ ДНЕВНИК СО ЗВЁЗДАМИ ==========
    let books = JSON.parse(localStorage.getItem('books')) || [];

    function renderBooks() {
        const list = document.getElementById('booksList');
        list.innerHTML = books.map(b => `
            <div class="entry-card" data-id="${b.id}">
                <div class="entry-header">
                    <strong>${b.title}</strong>
                    <button class="delete-btn" onclick="deleteBook('${b.id}')">×</button>
                </div>
                <p><em>${b.author}</em> (${b.year}) · ${b.genre}</p>
                <p class="book-rating">${'⭐'.repeat(b.rating)}</p>
                <p><strong>Отзыв:</strong> ${b.review}</p>
                <p><strong>Цитата:</strong> “${b.quote}”</p>
            </div>
        `).join('');
    }

    window.deleteBook = (id) => {
        books = books.filter(b => b.id !== id);
        localStorage.setItem('books', JSON.stringify(books));
        renderBooks();
    };

    document.getElementById('addBook').addEventListener('click', () => {
        const title = document.getElementById('bookTitle').value.trim();
        const author = document.getElementById('bookAuthor').value.trim();
        const year = document.getElementById('bookYear').value;
        const genre = document.getElementById('bookGenre').value.trim();
        const review = document.getElementById('bookReview').value.trim();
        const quote = document.getElementById('bookQuote').value.trim();
        const rating = parseInt(document.getElementById('bookRating').value);
        if (!title || !author || !year || !genre || !review || !quote) return;

        const newBook = {
            id: Date.now().toString(),
            title, author, year, genre, review, quote, rating
        };
        books.unshift(newBook);
        localStorage.setItem('books', JSON.stringify(books));
        renderBooks();
        ['bookTitle', 'bookAuthor', 'bookYear', 'bookGenre', 'bookReview', 'bookQuote'].forEach(id => document.getElementById(id).value = '');
    });

    renderBooks();

    // ========== ДЕНЕЖНЫЙ МЕНЕДЖЕР С ЦЕЛЬЮ НА МЕСЯЦ ==========
    let accounts = JSON.parse(localStorage.getItem('accounts')) || [];
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    let monthlyGoal = parseFloat(localStorage.getItem('monthlyGoal')) || 0;

    const categories = ['food', 'transport', 'household', 'holidays', 'other'];
    const categoryNames = {
        food: 'Еда', transport: 'Передвижение', household: 'Быт', holidays: 'Праздники', other: 'Другое'
    };

    function saveAccounts() { localStorage.setItem('accounts', JSON.stringify(accounts)); }
    function saveTransactions() { localStorage.setItem('transactions', JSON.stringify(transactions)); }

    function renderAccounts() {
        const container = document.getElementById('accountsList');
        container.innerHTML = accounts.map(acc => `
            <div class="account-card" data-id="${acc.id}">
                <div class="account-name">${acc.name}</div>
                <div class="account-balance">${acc.balance} ₽</div>
                <div class="account-edit">
                    <input type="number" id="balance-${acc.id}" placeholder="Новый баланс" step="0.01">
                    <button onclick="setAccountBalance('${acc.id}')">Установить</button>
                </div>
            </div>
        `).join('');

        const select = document.getElementById('transactionAccount');
        select.innerHTML = accounts.map(acc => `<option value="${acc.id}">${acc.name}</option>`).join('');
    }

    window.setAccountBalance = (id) => {
        const input = document.getElementById(`balance-${id}`);
        const newBalance = parseFloat(input.value);
        if (isNaN(newBalance)) return;
        const account = accounts.find(a => a.id === id);
        if (account) {
            account.balance = newBalance;
            saveAccounts();
            renderAccounts();
            renderMoneyList();
        }
    };

    document.getElementById('addAccount').addEventListener('click', () => {
        const name = document.getElementById('accountName').value.trim();
        if (!name) return;
        accounts.push({ id: Date.now().toString(), name, balance: 0 });
        saveAccounts();
        renderAccounts();
        document.getElementById('accountName').value = '';
    });

    document.getElementById('addTransaction').addEventListener('click', () => {
        const accountId = document.getElementById('transactionAccount').value;
        const category = document.getElementById('transactionCategory').value;
        const type = document.getElementById('transactionType').value;
        const amount = parseFloat(document.getElementById('transactionAmount').value);
        const desc = document.getElementById('transactionDesc').value.trim();

        if (!accountId || isNaN(amount) || amount <= 0 || !desc) return;

        const account = accounts.find(a => a.id === accountId);
        if (!account) return;

        if (type === 'income') {
            account.balance += amount;
        } else {
            account.balance -= amount;
        }
        saveAccounts();

        const transaction = {
            id: Date.now().toString(),
            accountId,
            type,
            category,
            amount,
            description: desc,
            date: new Date().toISOString()
        };
        transactions.unshift(transaction);
        saveTransactions();

        renderAccounts();
        renderMoneyList();
        document.getElementById('transactionAmount').value = '';
        document.getElementById('transactionDesc').value = '';
        updateGoalProgress();
    });

    function renderMoneyList() {
        const list = document.getElementById('moneyList');
        list.innerHTML = transactions.map(t => {
            const account = accounts.find(a => a.id === t.accountId);
            const accountName = account ? account.name : 'Неизвестный счёт';
            const sign = t.type === 'income' ? '+' : '-';
            return `
                <div class="entry-card" data-id="${t.id}">
                    <div class="entry-header">
                        <span>${accountName} — ${t.description} (${categoryNames[t.category]})</span>
                        <button class="delete-btn" onclick="deleteTransaction('${t.id}')">×</button>
                    </div>
                    <p>${sign}${t.amount} ₽ • ${new Date(t.date).toLocaleDateString()}</p>
                </div>
            `;
        }).join('');
    }

    window.deleteTransaction = (id) => {
        const transaction = transactions.find(t => t.id === id);
        if (!transaction) return;

        const account = accounts.find(a => a.id === transaction.accountId);
        if (account) {
            if (transaction.type === 'income') {
                account.balance -= transaction.amount;
            } else {
                account.balance += transaction.amount;
            }
            saveAccounts();
        }

        transactions = transactions.filter(t => t.id !== id);
        saveTransactions();
        renderAccounts();
        renderMoneyList();
        updateGoalProgress();
    };

    // Цель на месяц
    function updateGoalProgress() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthExpenses = transactions
            .filter(t => t.type === 'expense' && new Date(t.date) >= startOfMonth)
            .reduce((sum, t) => sum + t.amount, 0);
        const goal = monthlyGoal || 0;
        const percent = goal > 0 ? Math.min(100, (monthExpenses / goal) * 100) : 0;
        const progressDiv = document.getElementById('goalProgress');
        if (progressDiv) {
            progressDiv.innerHTML = `
                <div>Цель на месяц: ${goal} ₽</div>
                <div>Потрачено: ${monthExpenses.toFixed(2)} ₽</div>
                <progress value="${percent}" max="100"></progress>
            `;
        }
    }

    document.getElementById('setMonthlyGoal').addEventListener('click', () => {
        const goal = parseFloat(document.getElementById('monthlyGoal').value);
        if (!isNaN(goal) && goal >= 0) {
            monthlyGoal = goal;
            localStorage.setItem('monthlyGoal', goal);
            updateGoalProgress();
        }
    });

    function generateReport(days) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        const filtered = transactions.filter(t => new Date(t.date) >= cutoff);

        const accountSummary = {};
        accounts.forEach(a => accountSummary[a.id] = { income: 0, expense: 0 });

        const categorySummary = {};
        categories.forEach(c => categorySummary[c] = 0);

        filtered.forEach(t => {
            if (t.type === 'income') {
                accountSummary[t.accountId].income += t.amount;
            } else {
                accountSummary[t.accountId].expense += t.amount;
                categorySummary[t.category] += t.amount;
            }
        });

        let totalIncome = 0, totalExpense = 0;
        Object.values(accountSummary).forEach(s => {
            totalIncome += s.income;
            totalExpense += s.expense;
        });

        let html = `<h4>Отчёт за последние ${days} дней</h4>`;
        html += '<h5>По счетам:</h5><table>';
        accounts.forEach(a => {
            const inc = accountSummary[a.id].income;
            const exp = accountSummary[a.id].expense;
            html += `<tr><td>${a.name}:</td><td>доход ${inc} ₽</td><td>расход ${exp} ₽</td></tr>`;
        });
        html += '</table>';
        html += `<p><strong>Общий доход:</strong> ${totalIncome} ₽</p>`;
        html += `<p><strong>Общий расход:</strong> ${totalExpense} ₽</p>`;

        if (totalExpense > 0) {
            html += '<h5>Категории расходов (%):</h5><table>';
            categories.forEach(c => {
                const amount = categorySummary[c];
                if (amount > 0) {
                    const percent = (amount / totalExpense * 100).toFixed(1);
                    html += `<tr><td>${categoryNames[c]}:</td><td>${percent}%</td></tr>`;
                }
            });
            html += '</table>';
        } else {
            html += '<p>Нет расходов за период.</p>';
        }
        document.getElementById('reportResult').innerHTML = html;
    }

    document.getElementById('report7days').addEventListener('click', () => generateReport(7));
    document.getElementById('report30days').addEventListener('click', () => generateReport(30));

    renderAccounts();
    renderMoneyList();
    updateGoalProgress();

    // ========== СПИСОК ПОКУПОК С ЧЕКБОКСАМИ ==========
    let shopping = JSON.parse(localStorage.getItem('shopping')) || [];

    function renderShopping() {
        const list = document.getElementById('shoppingList');
        let total = 0;
        list.innerHTML = shopping.map(item => {
            const checked = item.checked ? 'checked' : '';
            if (item.checked) total += item.price || 0;
            return `
                <li>
                    <input type="checkbox" class="shopping-item-checkbox" data-id="${item.id}" ${checked} onchange="toggleShoppingItem('${item.id}')">
                    <span class="item-text">${item.name}</span>
                    <span class="item-price">${item.price ? item.price.toFixed(2) + ' ₽' : ''}</span>
                    <button class="delete-item" onclick="deleteShopping('${item.id}')">×</button>
                </li>
            `;
        }).join('');
        document.getElementById('shoppingTotal').textContent = total.toFixed(2);
    }

    window.toggleShoppingItem = (id) => {
        shopping = shopping.map(i => i.id === id ? { ...i, checked: !i.checked } : i);
        localStorage.setItem('shopping', JSON.stringify(shopping));
        renderShopping();
    };

    window.deleteShopping = (id) => {
        shopping = shopping.filter(i => i.id !== id);
        localStorage.setItem('shopping', JSON.stringify(shopping));
        renderShopping();
    };

    document.getElementById('addShopping').addEventListener('click', () => {
        const name = document.getElementById('shoppingItem').value.trim();
        const price = parseFloat(document.getElementById('shoppingPrice').value);
        if (!name) return;
        shopping.push({
            id: Date.now().toString(),
            name,
            price: isNaN(price) ? 0 : price,
            checked: false
        });
        localStorage.setItem('shopping', JSON.stringify(shopping));
        renderShopping();
        document.getElementById('shoppingItem').value = '';
        document.getElementById('shoppingPrice').value = '';
    });

    renderShopping();

    // ========== СПИСОК ДЕЛ С DRAG & DROP ==========
    let todos = JSON.parse(localStorage.getItem('todos')) || [];

    function renderTodos() {
        const dayList = document.getElementById('todoDayList');
        const weekList = document.getElementById('todoWeekList');
        const monthList = document.getElementById('todoMonthList');
        dayList.innerHTML = '';
        weekList.innerHTML = '';
        monthList.innerHTML = '';

        const sorted = [...todos].sort((a, b) => (a.order || 0) - (b.order || 0));

        sorted.forEach(todo => {
            const li = document.createElement('li');
            li.setAttribute('draggable', 'true');
            li.dataset.id = todo.id;
            li.dataset.urgency = todo.urgency;
            li.innerHTML = `
                <input type="checkbox" ${todo.done ? 'checked' : ''} onchange="toggleTodo('${todo.id}')">
                <span class="item-text" style="${todo.done ? 'text-decoration: line-through; opacity:0.6' : ''}">${todo.text}</span>
                <button class="delete-item" onclick="deleteTodo('${todo.id}')">×</button>
            `;
            li.addEventListener('dragstart', handleDragStart);
            li.addEventListener('dragend', handleDragEnd);

            if (todo.urgency === 'day') dayList.appendChild(li);
            else if (todo.urgency === 'week') weekList.appendChild(li);
            else if (todo.urgency === 'month') monthList.appendChild(li);
        });

        [dayList, weekList, monthList].forEach(list => {
            list.addEventListener('dragover', handleDragOver);
            list.addEventListener('dragleave', handleDragLeave);
            list.addEventListener('drop', handleDrop);
        });
    }

    let draggedItem = null;

    function handleDragStart(e) {
        draggedItem = this;
        this.classList.add('dragging');
        e.dataTransfer.setData('text/plain', this.dataset.id);
        e.dataTransfer.effectAllowed = 'move';
    }

    function handleDragEnd(e) {
        this.classList.remove('dragging');
        document.querySelectorAll('.todo-column').forEach(col => col.classList.remove('drag-over'));
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        this.closest('.todo-column').classList.add('drag-over');
    }

    function handleDragLeave(e) {
        this.closest('.todo-column').classList.remove('drag-over');
    }

    function handleDrop(e) {
        e.preventDefault();
        const targetList = this;
        targetList.closest('.todo-column').classList.remove('drag-over');

        const draggedId = e.dataTransfer.getData('text/plain');
        const draggedElement = draggedItem;
        if (!draggedElement) return;

        let newUrgency = 'day';
        if (targetList.id === 'todoWeekList') newUrgency = 'week';
        else if (targetList.id === 'todoMonthList') newUrgency = 'month';

        const afterElement = getDragAfterElement(targetList, e.clientY);
        const draggedTodo = todos.find(t => t.id === draggedId);
        if (!draggedTodo) return;

        const oldUrgency = draggedTodo.urgency;
        if (oldUrgency === newUrgency) {
            // Перестановка внутри колонки
            const sameUrgency = todos.filter(t => t.urgency === oldUrgency).sort((a, b) => a.order - b.order);
            const filtered = sameUrgency.filter(t => t.id !== draggedId);
            let newIndex = afterElement ? filtered.findIndex(t => t.id === afterElement.dataset.id) : filtered.length;
            filtered.splice(newIndex, 0, draggedTodo);
            filtered.forEach((t, idx) => t.order = idx);
        } else {
            // Перемещение между колонками
            draggedTodo.urgency = newUrgency;
            const targetUrgency = todos.filter(t => t.urgency === newUrgency).sort((a, b) => a.order - b.order);
            const newIndex = afterElement ? targetUrgency.findIndex(t => t.id === afterElement.dataset.id) : targetUrgency.length;
            targetUrgency.splice(newIndex, 0, draggedTodo);
            targetUrgency.forEach((t, idx) => t.order = idx);
            // Пересчёт исходной колонки
            const oldUrgencyTodos = todos.filter(t => t.urgency === oldUrgency && t.id !== draggedId).sort((a, b) => a.order - b.order);
            oldUrgencyTodos.forEach((t, idx) => t.order = idx);
        }

        localStorage.setItem('todos', JSON.stringify(todos));
        renderTodos();
    }

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            return (offset < 0 && offset > closest.offset) ? { offset, element: child } : closest;
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    window.toggleTodo = (id) => {
        todos = todos.map(t => t.id === id ? { ...t, done: !t.done } : t);
        localStorage.setItem('todos', JSON.stringify(todos));
        renderTodos();
    };

    window.deleteTodo = (id) => {
        const deleted = todos.find(t => t.id === id);
        if (deleted) {
            const oldUrgency = deleted.urgency;
            todos = todos.filter(t => t.id !== id);
            const sameUrgency = todos.filter(t => t.urgency === oldUrgency).sort((a, b) => a.order - b.order);
            sameUrgency.forEach((t, idx) => t.order = idx);
        }
        localStorage.setItem('todos', JSON.stringify(todos));
        renderTodos();
    };

    document.getElementById('addTodo').addEventListener('click', () => {
        const text = document.getElementById('todoItem').value.trim();
        const urgency = document.getElementById('todoUrgency').value;
        if (!text) return;
        const maxOrder = todos.filter(t => t.urgency === urgency).reduce((max, t) => Math.max(max, t.order || 0), -1) + 1;
        const newTodo = {
            id: Date.now().toString(),
            text,
            urgency,
            done: false,
            order: maxOrder
        };
        todos.push(newTodo);
        localStorage.setItem('todos', JSON.stringify(todos));
        renderTodos();
        document.getElementById('todoItem').value = '';
    });

    renderTodos();

    // ========== ПОХВАЛИ СЕБЯ ==========
    let praises = JSON.parse(localStorage.getItem('praises')) || [];

    function renderPraises() {
        const cloud = document.getElementById('praiseCloud');
        cloud.innerHTML = praises.map(p => {
            const fontSize = 0.8 + Math.random() * 1.5;
            const opacity = 0.6 + Math.random() * 0.4;
            const top = Math.random() * 85;
            const left = Math.random() * 85;
            const rotate = (Math.random() - 0.5) * 20;
            return `<span class="praise-item" style="font-size: ${fontSize}rem; opacity: ${opacity}; top: ${top}%; left: ${left}%; transform: rotate(${rotate}deg);">${p.text}</span>`;
        }).join('');
    }

    document.getElementById('addPraise').addEventListener('click', () => {
        const text = document.getElementById('praiseInput').value.trim();
        if (!text) return;
        praises.push({ id: Date.now().toString(), text });
        localStorage.setItem('praises', JSON.stringify(praises));
        renderPraises();
        document.getElementById('praiseInput').value = '';
    });

    document.getElementById('clearPraises').addEventListener('click', () => {
        if (confirm('Удалить все похвалы?')) {
            praises = [];
            localStorage.setItem('praises', JSON.stringify(praises));
            renderPraises();
        }
    });

    renderPraises();

    // ========== ЖЕНСКИЙ КАЛЕНДАРЬ С СИМПТОМАМИ ==========
    (function() {
        let periods = JSON.parse(localStorage.getItem('femalePeriods')) || [];
        let dayData = JSON.parse(localStorage.getItem('femaleDayData')) || {};

        const PREDICTED_WINDOW = 2;
        const MAX_CYCLE_HISTORY = 6;
        let currentDisplayDate = new Date();
        currentDisplayDate.setDate(1);

        const femaleCalendar = document.getElementById('femaleCalendar');
        const femaleStats = document.getElementById('femaleStats');
        const currentMonthYearSpan = document.getElementById('currentMonthYearFemale');
        const prevMonthBtn = document.getElementById('prevMonthFemale');
        const nextMonthBtn = document.getElementById('nextMonthFemale');

        const modal = document.getElementById('dayModalFemale');
        const modalDateEl = document.getElementById('modalDateFemale');
        const closeModalBtn = document.querySelector('.close-female');
        const markPeriodStartBtn = document.getElementById('markPeriodStartFemale');
        const markPeriodEndBtn = document.getElementById('markPeriodEndFemale');
        const dayStateInput = document.getElementById('dayStateFemale');
        const stateValueSpan = document.getElementById('stateValueFemale');
        const daySymptomsInput = document.getElementById('daySymptomsFemale');
        const dayNoteTextarea = document.getElementById('dayNoteFemale');
        const daySecretCheckbox = document.getElementById('daySecretFemale');
        const saveDayDataBtn = document.getElementById('saveDayDataFemale');
        const clearDayDataBtn = document.getElementById('clearDayDataFemale');
        let selectedDate = null;

        function savePeriods() { localStorage.setItem('femalePeriods', JSON.stringify(periods)); }
        function saveDayData() { localStorage.setItem('femaleDayData', JSON.stringify(dayData)); }

        function getAverageCycleLength() {
            const completed = periods.filter(p => p.start && p.end).sort((a,b) => new Date(a.start) - new Date(b.start));
            if (completed.length < 2) return 28;
            const recent = completed.slice(-MAX_CYCLE_HISTORY);
            let total = 0;
            for (let i=1; i<recent.length; i++) {
                total += Math.round((new Date(recent[i].start) - new Date(recent[i-1].start)) / 86400000);
            }
            return Math.round(total / (recent.length - 1));
        }

        function getNextPredictedStart() {
            const starts = periods.map(p => p.start).filter(s => s).sort((a,b) => new Date(a) - new Date(b));
            if (!starts.length) return null;
            const last = new Date(starts[starts.length-1]);
            last.setDate(last.getDate() + getAverageCycleLength());
            return last.toISOString().split('T')[0];
        }

        function getPredictedDates() {
            const pred = getNextPredictedStart();
            if (!pred) return [];
            const d = new Date(pred);
            const res = [];
            for (let i=-PREDICTED_WINDOW; i<=PREDICTED_WINDOW; i++) {
                const nd = new Date(d);
                nd.setDate(d.getDate()+i);
                res.push(nd.toISOString().split('T')[0]);
            }
            return res;
        }

        function isDateInPeriod(dateStr) {
            const date = new Date(dateStr);
            for (let p of periods) {
                if (!p.start) continue;
                const start = new Date(p.start);
                const end = p.end ? new Date(p.end) : null;
                if (!end) {
                    if (date >= start && date <= new Date()) return true;
                } else {
                    if (date >= start && date <= end) return true;
                }
            }
            return false;
        }

        function renderFemaleCalendar() {
            const year = currentDisplayDate.getFullYear();
            const month = currentDisplayDate.getMonth();
            const firstDay = new Date(year, month, 1);
            const daysInMonth = new Date(year, month+1, 0).getDate();
            let firstDayWeek = firstDay.getDay();
            let startOffset = firstDayWeek === 0 ? 6 : firstDayWeek - 1;
            const monthNames = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
            currentMonthYearSpan.textContent = `${monthNames[month]} ${year}`;
            const predicted = getPredictedDates();
            const today = new Date();

            let html = '<div class="female-weekdays"><span>Пн</span><span>Вт</span><span>Ср</span><span>Чт</span><span>Пт</span><span>Сб</span><span>Вс</span></div><div class="female-days">';
            for (let i=0; i<startOffset; i++) html += '<div class="female-day empty"></div>';
            for (let d=1; d<=daysInMonth; d++) {
                const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
                let classes = 'female-day';
                if (isDateInPeriod(dateStr)) classes += ' period';
                else if (predicted.includes(dateStr)) classes += ' predicted';
                if (dayData[dateStr] && dayData[dateStr].secret) classes += ' has-secret';
                if (dayData[dateStr] && dayData[dateStr].symptoms) classes += ' has-symptoms';
                if (year === today.getFullYear() && month === today.getMonth() && d === today.getDate()) classes += ' today';
                const symptoms = dayData[dateStr] ? dayData[dateStr].symptoms : '';
                html += `<div class="${classes}" data-date="${dateStr}" data-symptoms="${symptoms}">${d}</div>`;
            }
            html += '</div>';
            femaleCalendar.innerHTML = html;
            document.querySelectorAll('.female-day[data-date]').forEach(day => day.addEventListener('click', () => openDayModal(day.dataset.date)));
            renderFemaleStats();
        }

        function openDayModal(dateStr) {
            selectedDate = dateStr;
            modalDateEl.textContent = `Дата: ${dateStr}`;
            const data = dayData[dateStr] || {};
            dayStateInput.value = data.state || 5;
            stateValueSpan.textContent = data.state || 5;
            daySymptomsInput.value = data.symptoms || '';
            dayNoteTextarea.value = data.note || '';
            daySecretCheckbox.checked = data.secret || false;
            modal.style.display = 'block';
        }

        function closeModal() { modal.style.display = 'none'; selectedDate = null; }

        function renderFemaleStats() {
            const dates = Object.keys(dayData).sort().reverse().slice(0,10);
            let html = '<h4>Последние записи:</h4>';
            if (!dates.length) html += '<p>Нет записей.</p>';
            else dates.forEach(d => {
                const data = dayData[d];
                html += `<div class="female-stats-item"><span>${d}</span><span>${data.state ? '☀️'+data.state : ''} ${data.secret ? '🔴' : ''} ${data.symptoms || ''}</span></div>`;
                if (data.note) html += `<div style="font-style:italic;">${data.note}</div>`;
            });
            femaleStats.innerHTML = html;
        }

        prevMonthBtn.addEventListener('click', () => {
            currentDisplayDate = new Date(currentDisplayDate.getFullYear(), currentDisplayDate.getMonth()-1, 1);
            renderFemaleCalendar();
        });
        nextMonthBtn.addEventListener('click', () => {
            currentDisplayDate = new Date(currentDisplayDate.getFullYear(), currentDisplayDate.getMonth()+1, 1);
            renderFemaleCalendar();
        });

        markPeriodStartBtn.addEventListener('click', () => {
            if (!selectedDate) return;
            if (periods.find(p => !p.end)) { alert('Сначала закройте текущий период.'); return; }
            periods.push({ start: selectedDate, end: null });
            savePeriods(); renderFemaleCalendar(); closeModal();
        });
        markPeriodEndBtn.addEventListener('click', () => {
            if (!selectedDate) return;
            const open = periods.filter(p => !p.end).sort((a,b)=>new Date(b.start)-new Date(a.start));
            if (!open.length) { alert('Нет открытого периода.'); return; }
            const p = open[0];
            if (new Date(selectedDate) < new Date(p.start)) { alert('Дата окончания раньше начала.'); return; }
            p.end = selectedDate;
            savePeriods(); renderFemaleCalendar(); closeModal();
        });

        dayStateInput.addEventListener('input', () => stateValueSpan.textContent = dayStateInput.value);
        saveDayDataBtn.addEventListener('click', () => {
            if (!selectedDate) return;
            dayData[selectedDate] = {
                state: parseInt(dayStateInput.value),
                symptoms: daySymptomsInput.value.trim(),
                note: dayNoteTextarea.value.trim(),
                secret: daySecretCheckbox.checked
            };
            saveDayData(); renderFemaleCalendar(); closeModal();
        });
        clearDayDataBtn.addEventListener('click', () => {
            if (!selectedDate) return;
            if (confirm('Очистить данные за этот день?')) { delete dayData[selectedDate]; saveDayData(); renderFemaleCalendar(); closeModal(); }
        });

        closeModalBtn.addEventListener('click', closeModal);
        window.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
        renderFemaleCalendar();
    })();

    // ========== ТРЕКЕР НАСТРОЕНИЯ ==========
    let moods = JSON.parse(localStorage.getItem('moods')) || [];

    function renderMoods() {
        const entries = document.getElementById('moodEntries');
        if (!entries) return;
        entries.innerHTML = moods.slice(0,20).map(m => `
            <div class="mood-entry">
                <div class="mood-header">
                    <span>${m.date}</span>
                    <span>Оценка: ${m.rating}/10</span>
                </div>
                ${m.good ? `<div class="mood-good">✅ ${m.good}</div>` : ''}
                ${m.bad ? `<div class="mood-bad">❌ ${m.bad}</div>` : ''}
            </div>
        `).join('');

        // Круговая диаграмма
        const canvas = document.getElementById('moodChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width, height = canvas.height;
        ctx.clearRect(0,0,width,height);
        if (moods.length === 0) {
            ctx.fillStyle = '#ccc';
            ctx.beginPath();
            ctx.arc(width/2, height/2, 80, 0, 2*Math.PI);
            ctx.fill();
            ctx.fillStyle = '#666';
            ctx.font = '12px sans-serif';
            ctx.fillText('Нет данных', width/2-40, height/2);
            return;
        }

        const groups = [0,0,0]; // 1-3,4-7,8-10
        moods.forEach(m => {
            const r = m.rating;
            if (r <= 3) groups[0]++;
            else if (r <= 7) groups[1]++;
            else groups[2]++;
        });
        const total = moods.length;
        const angles = groups.map(g => g / total * 2 * Math.PI);
        const colors = ['#f8bbd0', '#ffe082', '#a8e6cf'];
        let start = 0;
        for (let i=0; i<3; i++) {
            if (angles[i] === 0) continue;
            ctx.fillStyle = colors[i];
            ctx.beginPath();
            ctx.moveTo(width/2, height/2);
            ctx.arc(width/2, height/2, 80, start, start + angles[i]);
            ctx.closePath();
            ctx.fill();
            start += angles[i];
        }
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(`${((groups[2]/total)*100).toFixed(0)}%`, width/2+20, height/2-20);
        ctx.fillStyle = '#666';
        ctx.font = '12px sans-serif';
        ctx.fillText('1-3', width/2-50, height/2-10);
        ctx.fillText('4-7', width/2-10, height/2+30);
        ctx.fillText('8-10', width/2+30, height/2-40);
    }

    const moodDate = document.getElementById('moodDate');
    if (moodDate) moodDate.valueAsDate = new Date();
    const moodRating = document.getElementById('moodRating');
    if (moodRating) {
        moodRating.addEventListener('input', (e) => {
            document.getElementById('moodValue').textContent = e.target.value;
        });
    }

    document.getElementById('addMood')?.addEventListener('click', () => {
        const date = document.getElementById('moodDate').value;
        const rating = parseInt(document.getElementById('moodRating').value);
        const good = document.getElementById('moodGood').value.trim();
        const bad = document.getElementById('moodBad').value.trim();
        if (!date || !rating) return;
        moods.unshift({ date, rating, good, bad });
        localStorage.setItem('moods', JSON.stringify(moods));
        renderMoods();
        document.getElementById('moodGood').value = '';
        document.getElementById('moodBad').value = '';
    });

    renderMoods();

    // ========== БЭКАП И ВОССТАНОВЛЕНИЕ ==========
    document.getElementById('backupBtn')?.addEventListener('click', () => {
        const data = {
            birthdays, thoughts, books, accounts, transactions, shopping, todos, praises,
            femalePeriods: JSON.parse(localStorage.getItem('femalePeriods') || '[]'),
            femaleDayData: JSON.parse(localStorage.getItem('femaleDayData') || '{}'),
            monthlyGoal, moods
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `organizer_backup_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    });

    document.getElementById('restoreBtn')?.addEventListener('click', () => {
        document.getElementById('restoreFile').click();
    });

    document.getElementById('restoreFile')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                if (data.birthdays) { birthdays = data.birthdays; localStorage.setItem('birthdays', JSON.stringify(birthdays)); }
                if (data.thoughts) { thoughts = data.thoughts; localStorage.setItem('thoughts', JSON.stringify(thoughts)); }
                if (data.books) { books = data.books; localStorage.setItem('books', JSON.stringify(books)); }
                if (data.accounts) { accounts = data.accounts; localStorage.setItem('accounts', JSON.stringify(accounts)); }
                if (data.transactions) { transactions = data.transactions; localStorage.setItem('transactions', JSON.stringify(transactions)); }
                if (data.shopping) { shopping = data.shopping; localStorage.setItem('shopping', JSON.stringify(shopping)); }
                if (data.todos) { todos = data.todos; localStorage.setItem('todos', JSON.stringify(todos)); }
                if (data.praises) { praises = data.praises; localStorage.setItem('praises', JSON.stringify(praises)); }
                if (data.femalePeriods) localStorage.setItem('femalePeriods', JSON.stringify(data.femalePeriods));
                if (data.femaleDayData) localStorage.setItem('femaleDayData', JSON.stringify(data.femaleDayData));
                if (data.monthlyGoal !== undefined) { monthlyGoal = data.monthlyGoal; localStorage.setItem('monthlyGoal', monthlyGoal); }
                if (data.moods) { moods = data.moods; localStorage.setItem('moods', JSON.stringify(moods)); }

                alert('Данные восстановлены! Страница будет перезагружена.');
                window.location.reload();
            } catch (err) {
                alert('Ошибка при восстановлении: неверный формат файла.');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    });

    // ========== ОЧИСТКА ВСЕХ ДАННЫХ ==========
    const clearAllBtn = document.getElementById('clearAllBtn');
    const clearModal = document.getElementById('clearAllModal');
    const closeClear = document.querySelector('.close-clear');
    const confirmClear = document.getElementById('confirmClear');
    const cancelClear = document.getElementById('cancelClear');

    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            clearModal.style.display = 'block';
        });
    }

    if (closeClear) {
        closeClear.addEventListener('click', () => {
            clearModal.style.display = 'none';
        });
    }

    if (cancelClear) {
        cancelClear.addEventListener('click', () => {
            clearModal.style.display = 'none';
        });
    }

    if (confirmClear) {
        confirmClear.addEventListener('click', () => {
            const keysToRemove = [
                'birthdays', 'thoughts', 'books', 'accounts', 'transactions',
                'shopping', 'todos', 'praises', 'femalePeriods', 'femaleDayData',
                'monthlyGoal', 'moods'
            ];
            keysToRemove.forEach(key => localStorage.removeItem(key));
            window.location.reload();
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === clearModal) {
            clearModal.style.display = 'none';
        }
    });
});
