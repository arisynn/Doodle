let savedName = localStorage.getItem('doodle_n12'); let savedColor = localStorage.getItem('doodle_c12'); let savedType = localStorage.getItem('doodle_t12');
if (savedName) document.getElementById('nameInput').value = savedName;
if (savedColor) { playerColor = savedColor; }
if (savedType) { playerType = savedType; }
