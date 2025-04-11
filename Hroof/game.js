const letters = ['أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'];

function createHexGrid() {
    const grid = document.getElementById('hexGrid');
    const layout = [
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''], 
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '']
    ];

    layout.forEach((row, rowIndex) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'row';
        row.forEach((letter, colIndex) => {
            const hex = document.createElement('div');
            hex.className = 'hexagon';
            
            if (rowIndex === 0 || rowIndex === 6) {
                hex.classList.add('fixed');
            } 
            else if (colIndex === 0 || colIndex === 6) {
                hex.classList.add('fixed-side');
            }
            
            

            if (!hex.classList.contains('fixed') && !hex.classList.contains('fixed-side')) {
                hex.classList.add('changeable');
            }
            
            rowDiv.appendChild(hex);
        });
        grid.appendChild(rowDiv);
    });
}

function shuffleLetters() {
    const hexagons = document.querySelectorAll('.changeable');
    const availableLetters = [...letters];
    
    hexagons.forEach(hex => {
        const randomIndex = Math.floor(Math.random() * availableLetters.length);
        hex.textContent = availableLetters[randomIndex];
        availableLetters.splice(randomIndex, 1);
        hex.style.backgroundColor = '#efeaea';
    });
}

document.addEventListener('click', (e) => {
    const hex = e.target;
    if (hex.classList.contains('changeable')) {
        const currentColor = hex.style.backgroundColor;

        if (currentColor === 'rgb(0, 40, 185)') { 
            hex.style.backgroundColor = '#bc0000'; 
        } else if (currentColor === 'rgb(188, 0, 0)') { 
            hex.style.backgroundColor = '#ffffff'; 
        } else {
            hex.style.backgroundColor = '#0028b9'; 
        }
    }
});


document.getElementById('shuffleButton').addEventListener('click', shuffleLetters);

window.onload = function() {
    createHexGrid();
    shuffleLetters();
};