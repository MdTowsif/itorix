const calendarEl = document.querySelector('.calendar');
        const noteInputEl = document.getElementById('noteInput');
        const saveNoteBtn = document.getElementById('saveNote');
        const notesContainerEl = document.getElementById('notesContainer');
        const currentDateEl = document.getElementById('currentDate');
        const calendarViewEl = document.getElementById('calendarView');
        const viewCalendarBtn = document.getElementById('viewCalendar');
        const closeCalendarBtn = document.getElementById('closeCalendar');
        const moodIcons = document.querySelectorAll('.mood-icon');
        const body = document.querySelector('body');

        const today = new Date();
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        let selectedMood = '';
        let weatherData = null;

        function isLeapYear(year) {
            return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
        }

        if (isLeapYear(today.getFullYear())) {
            daysInMonth[1] = 29;
        }

        function updateDate() {
            currentDateEl.textContent = `${monthNames[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;
        }

        function createCalendar(year, month) {
            calendarEl.innerHTML = `
                <div class="calendar-header">Sun</div>
                <div class="calendar-header">Mon</div>
                <div class="calendar-header">Tue</div>
                <div class="calendar-header">Wed</div>
                <div class="calendar-header">Thu</div>
                <div class="calendar-header">Fri</div>
                <div class="calendar-header">Sat</div>
            `;

            const firstDayOfMonth = new Date(year, month, 1).getDay();
            const days = daysInMonth[month];

            for (let i = 0; i < firstDayOfMonth; i++) {
                calendarEl.innerHTML += `<div class="calendar-day"></div>`;
            }

            for (let day = 1; day <= days; day++) {
                const dayDate = new Date(year, month, day);
                const storedNote = notes.find(note => {
                    const noteDate = new Date(note.date);
                    return noteDate.getDate() === day && noteDate.getMonth() === month && noteDate.getFullYear() === year;
                });

                const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                let dayContent = `<div class="${isToday ? 'bg-white/30 border-purple-400 font-semibold' : 'bg-white/20'} calendar-day" data-day="${dayDate.toISOString()}">${day}`;
                if (storedNote) {
                    dayContent += `<div class="mt-1 text-xs">${storedNote.emoji}</div>`;
                }
                dayContent += `</div>`;
                calendarEl.innerHTML += dayContent;
            }
        }

        function getWeather(latitude, longitude) {
            const apiKey = 'YOUR_OPENWEATHERMAP_API_KEY'; // Replace with your API key
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    weatherData = data;
                    displayWeatherData(data);
                })
                .catch(error => {
                    console.error('Error fetching weather data:', error);
                    alert('Failed to fetch weather data. Please ensure your internet connection is working and you have a valid API key.');
                    weatherData = null;
                });
        }

        function displayWeatherData(data) {
            const weatherIconEl = document.getElementById('weatherIcon');
            const temperatureEl = document.getElementById('temperature');
            const descriptionEl = document.getElementById('weatherDescription');

            if (weatherIconEl && temperatureEl && descriptionEl) {
                const iconCode = data.weather[0].icon;
                const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
                const temperature = Math.round(data.main.temp);
                const description = data.weather[0].description;

                weatherIconEl.src = iconUrl;
                temperatureEl.textContent = `${temperature}°C`;
                descriptionEl.textContent = description;
            }
        }

        function getLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const latitude = position.coords.latitude;
                        const longitude = position.coords.longitude;
                        getWeather(latitude, longitude);
                    },
                    (error) => {
                        console.error('Error getting user location:', error);
                        alert('Please allow location access to get weather data.');
                        // Default weather data for a specific location (e.g., London)
                        getWeather(51.5074, 0.1278);
                    }
                );
            } else {
                alert('Geolocation is not supported by this browser.');
                // Default weather data for a specific location (e.g., London)
                getWeather(51.5074, 0.1278);
            }
        }

        let notes = JSON.parse(localStorage.getItem('moodNotes')) || [];

        function displayNotes() {
            notesContainerEl.innerHTML = '';
            notes.forEach(note => {
                const noteCard = document.createElement('div');
                noteCard.className = 'note-card';
                const noteDateObj = new Date(note.date);
                const formattedDate = `${monthNames[noteDateObj.getMonth()]} ${noteDateObj.getDate()}, ${noteDateObj.getFullYear()} - ${noteDateObj.getHours()}:${String(noteDateObj.getMinutes()).padStart(2, '0')}`;
                noteCard.innerHTML = `
                    <div class="note-card-header">
                        <span class="note-emoji">${note.emoji}</span>
                        <span class="note-date">${formattedDate}</span>
                         ${note.weather ? `<div class="flex items-center gap-2"><img src="https://openweathermap.org/img/wn/${note.weather.icon}@2x.png" alt="Weather Icon" class="weather-icon"><span class="text-sm">${note.weather.temperature}°C</span></div>` : ''}
                    </div>
                    <p class="note-content">${note.text}</p>
                `;
                notesContainerEl.appendChild(noteCard);
            });
        }

        function saveNote() {
            const noteText = noteInputEl.value.trim();
            if (!selectedMood) {
                alert('Please select a mood!');
                return;
            }
            if (!noteText) {
                alert('Please enter a note!');
                return;
            }

            const newNote = {
                date: new Date().toISOString(),
                text: noteText,
                emoji: selectedMood,
                weather: weatherData
                    ? {
                        icon: weatherData.weather[0].icon,
                        temperature: Math.round(weatherData.main.temp),
                    }
                    : null,
            };
            notes.push(newNote);
            localStorage.setItem('moodNotes', JSON.stringify(notes));
            displayNotes();
            noteInputEl.value = '';
            selectedMood = '';
            moodIcons.forEach(icon => icon.classList.remove('bg-purple-500', 'ring-2', 'ring-purple-500'));
            alert('Note saved successfully!');
        }

        function showCalendar() {
            calendarViewEl.classList.remove('hidden');
            createCalendar(today.getFullYear(), today.getMonth());
        }

        function closeCalendar() {
            calendarViewEl.classList.add('hidden');
        }

        moodIcons.forEach(icon => {
            icon.addEventListener('click', () => {
                selectedMood = icon.dataset.mood;
                moodIcons.forEach(icon => icon.classList.remove('bg-purple-500', 'ring-2', 'ring-purple-500'));
                icon.classList.add('bg-purple-500', 'ring-2', 'ring-purple-500');
            });
        });

        calendarEl.addEventListener('click', (event) => {
            const target = event.target.closest('.calendar-day');
            if (target && target.dataset.day) {
                const selectedDate = new Date(target.dataset.day);
                const noteForDay = notes.find(note => {
                    const noteDate = new Date(note.date);
                    return noteDate.getDate() === selectedDate.getDate() &&
                           noteDate.getMonth() === selectedDate.getMonth() &&
                           noteDate.getFullYear() === selectedDate.getFullYear();
                });

                if (noteForDay) {
                    alert(`Mood: ${noteForDay.emoji}\nNote: ${noteForDay.text}`);
                } else {
                    alert('No note for this day.');
                }
            }
        });

        window.onload = () => {
            updateDate();
            getLocation();
            displayNotes();
            saveNoteBtn.addEventListener('click', saveNote);
            viewCalendarBtn.addEventListener('click', showCalendar);
            closeCalendarBtn.addEventListener('click', closeCalendar);
        };
    


