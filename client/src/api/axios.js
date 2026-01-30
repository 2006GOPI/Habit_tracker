import axios from 'axios';

// Helper to simulate delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getStorage = (key, defaultVal = []) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultVal;
};

const setStorage = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};

// Mock API Implementation
const mockApi = {
    get: async (url) => {
        await delay(300); // Simulate network latency

        // --- AUTH ---
        if (url === '/auth/user') {
            const token = localStorage.getItem('token');
            if (!token) return Promise.reject({ response: { status: 401 } });

            const users = getStorage('users');
            const user = users.find(u => u.token === token);
            if (!user) return Promise.reject({ response: { status: 401 } });

            return { data: user };
        }

        // --- HABITS ---
        if (url === '/habits') {
            const habits = getStorage('habits', []);
            return { data: habits };
        }

        if (url === '/history/habits') {
            const habits = getStorage('habits', []);
            const logs = [];
            habits.forEach(h => {
                if (h.HabitLogs) {
                    h.HabitLogs.forEach(l => {
                        if (l.status) {
                            logs.push({
                                id: 'log-' + h.id + '-' + l.date,
                                date: l.date,
                                Habit: h
                            });
                        }
                    });
                }
            });
            // Sort by date desc
            logs.sort((a, b) => new Date(b.date) - new Date(a.date));
            return { data: logs };
        }

        // --- MOODS ---
        if (url === '/moods') {
            const moods = getStorage('moods', []);
            return { data: moods };
        }

        // --- FOCUS ---
        if (url === '/history/focus') {
            const focusLogs = getStorage('focusLogs', []);
            // Sort by completedAt desc
            focusLogs.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
            return { data: focusLogs };
        }

        // --- HEALTH ---
        if (url === '/history/health') {
            const healthLogs = getStorage('healthLogs', []);
            // Sort by date desc
            healthLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
            return { data: healthLogs };
        }

        return Promise.reject({ response: { status: 404 } });
    },

    post: async (url, body) => {
        await delay(300);

        // --- AUTH ---
        if (url === '/auth/login') {
            const users = getStorage('users');
            const user = users.find(u => u.email === body.email && u.password === body.password);

            if (user) {
                const token = 'mock-token-' + Date.now();
                user.token = token;
                setStorage('users', users);
                return { data: { token, user } };
            }
            return Promise.reject({ response: { status: 400, data: { msg: 'Invalid credentials' } } });
        }

        if (url === '/auth/register') {
            const users = getStorage('users');
            if (users.find(u => u.email === body.email)) {
                return Promise.reject({ response: { status: 400, data: { msg: 'User already exists' } } });
            }

            const user = {
                id: 'user-' + Date.now(),
                username: body.username,
                email: body.email,
                password: body.password,
                dob: body.dob || '2000-01-01',
                gender: body.gender || 'Not Specified',
                token: 'mock-token-' + Date.now()
            };

            users.push(user);
            setStorage('users', users);
            return { data: { token: user.token, user } };
        }

        if (url === '/auth/birthday-wish') {
            return { data: { msg: 'Happy Birthday!' } };
        }

        // --- HABITS ---
        if (url === '/habits') {
            const habits = getStorage('habits', []);
            const newHabit = {
                id: 'habit-' + Date.now(),
                ...body,
                HabitLogs: []
            };
            habits.push(newHabit);
            setStorage('habits', habits);
            return { data: newHabit };
        }

        if (url === '/habits/log') {
            const habits = getStorage('habits', []);
            const { habitId, date, status } = body;
            const habit = habits.find(h => h.id === habitId);
            if (habit) {
                if (!habit.HabitLogs) habit.HabitLogs = [];
                const existingLog = habit.HabitLogs.find(l => l.date === date);
                if (existingLog) {
                    existingLog.status = status;
                } else {
                    habit.HabitLogs.push({ date, status });
                }
                setStorage('habits', habits);
                return { data: { msg: 'Logged' } };
            }
            return Promise.reject({ response: { status: 404 } });
        }

        // --- MOODS ---
        if (url === '/moods') {
            const moods = getStorage('moods', []);
            const newMood = {
                id: 'mood-' + Date.now(),
                ...body,
                date: new Date().toISOString()
            };
            if (body.date) newMood.date = body.date;

            moods.push(newMood);
            setStorage('moods', moods);
            return { data: newMood };
        }

        // --- FOCUS ---
        if (url === '/history/focus') {
            const focusLogs = getStorage('focusLogs', []);
            const newLog = {
                id: 'focus-' + Date.now(),
                duration: body.duration,
                completedAt: new Date().toISOString()
            };
            focusLogs.push(newLog);
            setStorage('focusLogs', focusLogs);
            return { data: newLog };
        }

        // --- HEALTH ---
        if (url === '/health') {
            const healthLogs = getStorage('healthLogs', []);
            const newLog = {
                id: 'health-' + Date.now(),
                ...body
            };
            healthLogs.push(newLog);
            setStorage('healthLogs', healthLogs);
            return { data: newLog };
        }

        return Promise.reject({ response: { status: 404 } });
    },

    delete: async (url) => {
        await delay(300);

        if (url.startsWith('/habits/')) {
            const id = url.split('/').pop();
            let habits = getStorage('habits', []);
            habits = habits.filter(h => h.id !== id);
            setStorage('habits', habits);
            return { data: { msg: 'Deleted' } };
        }

        return Promise.reject({ response: { status: 404 } });
    }
};

// Add interceptors property to mimic axios
mockApi.interceptors = {
    request: {
        use: (fn) => fn({ headers: {} }) // Dummy implementation
    }
};

export default mockApi;
