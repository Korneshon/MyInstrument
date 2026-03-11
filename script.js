document.addEventListener('DOMContentLoaded', () => {
    // Переключение разделов
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

    // ========== КАЛЕНДАРЬ ДНЕЙ РОЖДЕНИЙ ==========
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

        let html = `<h3>${monthNames[month]} ${year}</h3>`;
        html += '<div class="weekdays"><span>Пн</span><span>Вт</span><span>Ср</span><span>Чт</span><span>Пт</span><span>Сб</span><span>Вс</span></div>';
        html += '<div class="days-grid">';

        let startDay = firstDay === 0 ? 6 : firstDay - 1;
        for (let i = 0; i < startDay; i++) {
            html += '<div class="day-cell empty"></div>';
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const bdays = birthdays.filter(b => b.date === dateStr).map(b => b.name).join(', ');
            const hasBirthday = bdays.length > 0;
            html += `<div class="day-cell ${hasBirthday ? 'birthday' : ''}" data-names="${bdays}">${d}</div>`;
        }

        html += '</div>';
        document.getElementById(containerId).innerHTML = html;
    }

    document.getElementById('addBirthday').addEventListener('click', () => {
        const name = document.getElementById('bName').value.trim();
        const date = document.getElementById('bDate').value;
        if (!name || !date) return;

        const [year, month, day] = date.split('-');
        const dateStr = `${month}-${day}`;
        birthdays.push({ name, date: dateStr });
        localStorage.setItem('birthdays', JSON.stringify(birthdays));
        renderCalendar();
        document.getElementById('bName').value = '';
        document.getElementById('bDate').value = '';
    });

    renderCalendar();

    // ========== ДНЕВНИК МЫСЛЕЙ ==========
    let thoughts = JSON.parse(localStorage.getItem('thoughts')) || [];

    function renderThoughts() {
        const list = document.getElementById('thoughtsList');
        list.innerHTML = thoughts.map(t => `
            <div class="entry-card" data-id="${t.id}">
                <div class="entry-header">
                    <small>${new Date(t.date).toLocaleString()}</small>
                    <button class="delete-btn" onclick="deleteThought('${t.id}')">×</button>
                </div>
                <p>${t.text}</p>
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
        if (!text) return;
        const newThought = {
            id: Date.now().toString(),
            text,
            date: new Date().toISOString()
        };
        thoughts.unshift(newThought);
        localStorage.setItem('thoughts', JSON.stringify(thoughts));
        renderThoughts();
        document.getElementById('thoughtText').value = '';
    });

    renderThoughts();

    // ========== ЧИТАТЕЛЬСКИЙ ДНЕВНИК ==========
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
        if (!title || !author || !year || !genre || !review || !quote) return;

        const newBook = {
            id: Date.now().toString(),
            title, author, year, genre, review, quote
        };
        books.unshift(newBook);
        localStorage.setItem('books', JSON.stringify(books));
        renderBooks();
        ['bookTitle', 'bookAuthor', 'bookYear', 'bookGenre', 'bookReview', 'bookQuote'].forEach(id => document.getElementById(id).value = '');
    });

    renderBooks();

    // ========== ДЕНЕЖНЫЙ МЕНЕДЖЕР ==========
    let accounts = JSON.parse(localStorage.getItem('accounts')) || [];
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    const categories = ['food', 'transport', 'household', 'holidays', 'other'];
    const categoryNames = {
        food: 'Еда', transport: 'Передвижение', household: 'Быт', holidays: 'Праздники', other: 'Другое'
    };

    function saveAccounts() {
        localStorage.setItem('accounts', JSON.stringify(accounts));
    }

    function saveTransactions() {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }

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
        const newAccount = {
            id: Date.now().toString(),
            name,
            balance: 0
        };
        accounts.push(newAccount);
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
    };

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

    // ========== СПИСОК ПОКУПОК ==========
    let shopping = JSON.parse(localStorage.getItem('shopping')) || [];

    function renderShopping() {
        const list = document.getElementById('shoppingList');
        let total = 0;
        list.innerHTML = shopping.map(item => {
            total += item.price || 0;
            return `
                <li>
                    <span class="item-text">${item.name}</span>
                    <span class="item-price">${item.price ? item.price.toFixed(2) + ' ₽' : ''}</span>
                    <button class="delete-item" onclick="deleteShopping('${item.id}')">×</button>
                </li>
            `;
        }).join('');
        document.getElementById('shoppingTotal').textContent = total.toFixed(2);
    }

    window.deleteShopping = (id) => {
        shopping = shopping.filter(i => i.id !== id);
        localStorage.setItem('shopping', JSON.stringify(shopping));
        renderShopping();
    };

    document.getElementById('addShopping').addEventListener('click', () => {
        const name = document.getElementById('shoppingItem').value.trim();
        const price = parseFloat(document.getElementById('shoppingPrice').value);
        if (!name) return;
        const newItem = {
            id: Date.now().toString(),
            name,
            price: isNaN(price) ? 0 : price
        };
        shopping.push(newItem);
        localStorage.setItem('shopping', JSON.stringify(shopping));
        renderShopping();
        document.getElementById('shoppingItem').value = '';
        document.getElementById('shoppingPrice').value = '';
    });

    renderShopping();

    // ========== СПИСОК ДЕЛ ==========
    let todos = JSON.parse(localStorage.getItem('todos')) || [];

    function renderTodos() {
        const dayList = document.getElementById('todoDayList');
        const weekList = document.getElementById('todoWeekList');
        const monthList = document.getElementById('todoMonthList');

        dayList.innerHTML = '';
        weekList.innerHTML = '';
        monthList.innerHTML = '';

        todos.forEach(todo => {
            const li = document.createElement('li');
            li.innerHTML = `
                <input type="checkbox" ${todo.done ? 'checked' : ''} onchange="toggleTodo('${todo.id}')">
                <span class="item-text" style="${todo.done ? 'text-decoration: line-through; opacity:0.6' : ''}">${todo.text}</span>
                <button class="delete-item" onclick="deleteTodo('${todo.id}')">×</button>
            `;
            if (todo.urgency === 'day') dayList.appendChild(li);
            else if (todo.urgency === 'week') weekList.appendChild(li);
            else if (todo.urgency === 'month') monthList.appendChild(li);
        });
    }

    window.toggleTodo = (id) => {
        todos = todos.map(t => t.id === id ? { ...t, done: !t.done } : t);
        localStorage.setItem('todos', JSON.stringify(todos));
        renderTodos();
    };

    window.deleteTodo = (id) => {
        todos = todos.filter(t => t.id !== id);
        localStorage.setItem('todos', JSON.stringify(todos));
        renderTodos();
    };

    document.getElementById('addTodo').addEventListener('click', () => {
        const text = document.getElementById('todoItem').value.trim();
        const urgency = document.getElementById('todoUrgency').value;
        if (!text) return;
        const newTodo = {
            id: Date.now().toString(),
            text,
            urgency,
            done: false
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
            const fontSize = 0.8 + Math.random() * 1.2;
            const opacity = 0.6 + Math.random() * 0.4;
            return `<span class="praise-item" style="font-size: ${fontSize}rem; opacity: ${opacity};">${p.text}</span>`;
        }).join('');
    }

    document.getElementById('addPraise').addEventListener('click', () => {
        const text = document.getElementById('praiseInput').value.trim();
        if (!text) return;
        const newPraise = {
            id: Date.now().toString(),
            text
        };
        praises.push(newPraise);
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

// ========== ЖЕНСКИЙ КАЛЕНДАРЬ (ПЕРЕПИСАН) ==========
(function() {
    // Данные
    let periods = JSON.parse(localStorage.getItem('femalePeriods')) || [];
    let dayData = JSON.parse(localStorage.getItem('femaleDayData')) || {};

    // Константы
    const PREDICTED_WINDOW = 2; // дни до и после предполагаемого начала
    const MAX_CYCLE_HISTORY = 6; // сколько последних циклов учитывать для прогноза

    // Текущая отображаемая дата (первое число месяца)
    let currentDisplayDate = new Date();
    currentDisplayDate.setDate(1); // всегда первое число

    // Элементы DOM
    const femaleCalendar = document.getElementById('femaleCalendar');
    const femaleStats = document.getElementById('femaleStats');
    const currentMonthYearSpan = document.getElementById('currentMonthYearFemale');
    const prevMonthBtn = document.getElementById('prevMonthFemale');
    const nextMonthBtn = document.getElementById('nextMonthFemale');

    // Модальное окно
    const modal = document.getElementById('dayModalFemale');
    const modalDateEl = document.getElementById('modalDateFemale');
    const closeModalBtn = document.querySelector('.close-female');
    const markPeriodStartBtn = document.getElementById('markPeriodStartFemale');
    const markPeriodEndBtn = document.getElementById('markPeriodEndFemale');
    const dayStateInput = document.getElementById('dayStateFemale');
    const stateValueSpan = document.getElementById('stateValueFemale');
    const dayNoteTextarea = document.getElementById('dayNoteFemale');
    const daySecretCheckbox = document.getElementById('daySecretFemale');
    const saveDayDataBtn = document.getElementById('saveDayDataFemale');
    const clearDayDataBtn = document.getElementById('clearDayDataFemale');

    // Выбранная дата (строка YYYY-MM-DD)
    let selectedDate = null;

    // Вспомогательные функции сохранения
    function savePeriods() {
        localStorage.setItem('femalePeriods', JSON.stringify(periods));
    }

    function saveDayData() {
        localStorage.setItem('femaleDayData', JSON.stringify(dayData));
    }

    // Вычисление средней длины цикла по последним завершённым циклам
    function getAverageCycleLength() {
        const completedPeriods = periods.filter(p => p.start && p.end).sort((a, b) => new Date(a.start) - new Date(b.start));
        if (completedPeriods.length < 2) return 28; // стандартный цикл

        const recent = completedPeriods.slice(-MAX_CYCLE_HISTORY);
        let totalDays = 0;
        for (let i = 1; i < recent.length; i++) {
            const prevStart = new Date(recent[i-1].start);
            const currStart = new Date(recent[i].start);
            const diff = Math.round((currStart - prevStart) / (1000 * 60 * 60 * 24));
            totalDays += diff;
        }
        return Math.round(totalDays / (recent.length - 1));
    }

    // Получить дату следующего предполагаемого начала месячных
    function getNextPredictedStart() {
        const starts = periods.map(p => p.start).filter(s => s).sort((a, b) => new Date(a) - new Date(b));
        if (starts.length === 0) return null;
        const lastStart = new Date(starts[starts.length - 1]);
        const avgCycle = getAverageCycleLength();
        const next = new Date(lastStart);
        next.setDate(lastStart.getDate() + avgCycle);
        return next.toISOString().split('T')[0];
    }

    // Получить массив предполагаемых дат (около predictedStart)
    function getPredictedDates() {
        const predictedStart = getNextPredictedStart();
        if (!predictedStart) return [];
        const startDate = new Date(predictedStart);
        const result = [];
        for (let offset = -PREDICTED_WINDOW; offset <= PREDICTED_WINDOW; offset++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + offset);
            result.push(d.toISOString().split('T')[0]);
        }
        return result;
    }

    // Проверка, является ли дата днём месячных (находится внутри какого-либо периода)
    function isDateInPeriod(dateStr) {
        const date = new Date(dateStr);
        for (let p of periods) {
            if (!p.start) continue;
            const start = new Date(p.start);
            const end = p.end ? new Date(p.end) : null;
            if (!end) {
                // Незакрытый период — считаем, что все дни от start до сегодня включительно
                if (date >= start && date <= new Date()) return true;
            } else {
                if (date >= start && date <= end) return true;
            }
        }
        return false;
    }

    // Рендер календаря
    function renderFemaleCalendar() {
        const year = currentDisplayDate.getFullYear();
        const month = currentDisplayDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();

        // День недели первого дня (0 = вс, 1 = пн ... 6 = сб)
        let firstDayWeek = firstDay.getDay();
        // Нам нужно, чтобы понедельник был 0
        let startOffset = firstDayWeek === 0 ? 6 : firstDayWeek - 1;

        // Заголовок с месяцем и годом
        const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
        currentMonthYearSpan.textContent = `${monthNames[month]} ${year}`;

        // Получаем предполагаемые даты
        const predictedDates = getPredictedDates();

        let html = '<div class="female-weekdays"><span>Пн</span><span>Вт</span><span>Ср</span><span>Чт</span><span>Пт</span><span>Сб</span><span>Вс</span></div>';
        html += '<div class="female-days">';

        // Пустые ячейки до первого дня месяца
        for (let i = 0; i < startOffset; i++) {
            html += '<div class="female-day empty"></div>';
        }

        // Ячейки дней месяца
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month+1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            let classes = 'female-day';
            if (isDateInPeriod(dateStr)) {
                classes += ' period';
            } else if (predictedDates.includes(dateStr)) {
                classes += ' predicted';
            }
            if (dayData[dateStr] && dayData[dateStr].secret) {
                classes += ' has-secret';
            }
            html += `<div class="${classes}" data-date="${dateStr}">${d}</div>`;
        }

        html += '</div>';
        femaleCalendar.innerHTML = html;

        // Добавляем обработчики на дни
        document.querySelectorAll('.female-day[data-date]').forEach(day => {
            day.addEventListener('click', () => openDayModal(day.dataset.date));
        });

        // Обновляем статистику
        renderFemaleStats();
    }

    // Открыть модальное окно для даты
    function openDayModal(dateStr) {
        selectedDate = dateStr;
        modalDateEl.textContent = `Дата: ${dateStr}`;
        const data = dayData[dateStr] || {};
        dayStateInput.value = data.state || 5;
        stateValueSpan.textContent = data.state || 5;
        dayNoteTextarea.value = data.note || '';
        daySecretCheckbox.checked = data.secret || false;
        modal.style.display = 'block';
    }

    // Закрыть модальное окно
    function closeModal() {
        modal.style.display = 'none';
        selectedDate = null;
    }

    // Рендер блока статистики (последние 10 записей)
    function renderFemaleStats() {
        const datesWithData = Object.keys(dayData).sort().reverse().slice(0, 10);
        let html = '<h4>Последние записи:</h4>';
        if (datesWithData.length === 0) {
            html += '<p>Пока нет записей.</p>';
        } else {
            datesWithData.forEach(dateStr => {
                const data = dayData[dateStr];
                const secretMark = data.secret ? '🔴' : '';
                html += `<div class="female-stats-item"><span>${dateStr}</span><span>${data.state ? 'Состояние: '+data.state : ''} ${secretMark}</span></div>`;
                if (data.note) {
                    html += `<div class="female-stats-item" style="font-style:italic;">${data.note}</div>`;
                }
            });
        }
        femaleStats.innerHTML = html;
    }

    // Обработчики событий
    prevMonthBtn.addEventListener('click', () => {
        currentDisplayDate = new Date(currentDisplayDate.getFullYear(), currentDisplayDate.getMonth() - 1, 1);
        renderFemaleCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDisplayDate = new Date(currentDisplayDate.getFullYear(), currentDisplayDate.getMonth() + 1, 1);
        renderFemaleCalendar();
    });

    // Кнопки в модальном окне
    markPeriodStartBtn.addEventListener('click', () => {
        if (!selectedDate) return;
        // Проверим, есть ли незакрытый период
        const openPeriod = periods.find(p => !p.end);
        if (openPeriod) {
            alert('Сначала закройте текущий период (укажите конец месячных).');
            return;
        }
        periods.push({ start: selectedDate, end: null });
        savePeriods();
        renderFemaleCalendar();
        closeModal();
    });

    markPeriodEndBtn.addEventListener('click', () => {
        if (!selectedDate) return;
        const openPeriods = periods.filter(p => !p.end).sort((a, b) => new Date(b.start) - new Date(a.start));
        if (openPeriods.length === 0) {
            alert('Нет открытого периода месячных.');
            return;
        }
        const period = openPeriods[0]; // самый последний открытый
        if (new Date(selectedDate) < new Date(period.start)) {
            alert('Дата окончания не может быть раньше даты начала.');
            return;
        }
        period.end = selectedDate;
        savePeriods();
        renderFemaleCalendar();
        closeModal();
    });

    dayStateInput.addEventListener('input', () => {
        stateValueSpan.textContent = dayStateInput.value;
    });

    saveDayDataBtn.addEventListener('click', () => {
        if (!selectedDate) return;
        const state = parseInt(dayStateInput.value);
        const note = dayNoteTextarea.value.trim();
        const secret = daySecretCheckbox.checked;
        dayData[selectedDate] = { state, note, secret };
        saveDayData();
        renderFemaleCalendar();
        closeModal();
    });

    clearDayDataBtn.addEventListener('click', () => {
        if (!selectedDate) return;
        if (confirm('Очистить все данные за этот день?')) {
            delete dayData[selectedDate];
            saveDayData();
            renderFemaleCalendar();
            closeModal();
        }
    });

    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Инициализация
    renderFemaleCalendar();
})();


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
        // Очищаем все ключи localStorage, которые используются в приложении
        const keysToRemove = [
            'birthdays',
            'thoughts',
            'books',
            'accounts',
            'transactions',
            'shopping',
            'todos',
            'praises',
            'femalePeriods',
            'femaleDayData'
        ];
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Также можно очистить все данные без списка, но осторожно:
        // localStorage.clear(); // раскомментировать, если нужно удалить абсолютно всё
        
        // Перезагружаем страницу для сброса состояния
        window.location.reload();
    });
}

// Закрытие модального окна при клике вне его
window.addEventListener('click', (e) => {
    if (e.target === clearModal) {
        clearModal.style.display = 'none';
    }
});
});