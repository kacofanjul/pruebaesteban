document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('dataForm');
    const dataTableBody = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
    const clearDataButton = document.getElementById('clearDataButton');

    // Contenedores para instancias de Chart.js para poder destruirlas y recrearlas
    let ageChartInstance = null;
    let countryChartInstance = null;
    let bmiChartInstance = null;

    // Almacenaremos los datos aquí. Podríamos usar localStorage para persistencia.
    let allData = JSON.parse(localStorage.getItem('personalData')) || [];

    // Función para calcular IMC
    function calculateIMC(peso, alturaCm) {
        if (!peso || !alturaCm) return 'N/A';
        const alturaM = alturaCm / 100;
        return (peso / (alturaM * alturaM)).toFixed(2);
    }

    // Función para renderizar la tabla
    function renderTable() {
        dataTableBody.innerHTML = ''; // Limpiar tabla existente
        allData.forEach(data => {
            const row = dataTableBody.insertRow();
            row.insertCell().textContent = data.nombre;
            row.insertCell().textContent = data.edad;
            row.insertCell().textContent = data.altura;
            row.insertCell().textContent = data.peso;
            row.insertCell().textContent = data.imc;
            row.insertCell().textContent = data.ciudad;
            row.insertCell().textContent = data.pais;
        });
    }

    // Función para actualizar los gráficos
    function updateCharts() {
        // 1. Gráfico de Distribución de Edades (Histograma simple - Bar Chart)
        if (ageChartInstance) {
            ageChartInstance.destroy();
        }
        const ageCtx = document.getElementById('ageChart').getContext('2d');
        const ageData = allData.map(d => d.edad);
        // Agrupar edades para un histograma más significativo (ejemplo simple)
        const ageGroups = { '0-18': 0, '19-35': 0, '36-50': 0, '51+': 0 };
        ageData.forEach(age => {
            if (age <= 18) ageGroups['0-18']++;
            else if (age <= 35) ageGroups['19-35']++;
            else if (age <= 50) ageGroups['36-50']++;
            else ageGroups['51+']++;
        });

        ageChartInstance = new Chart(ageCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(ageGroups),
                datasets: [{
                    label: 'Número de Personas',
                    data: Object.values(ageGroups),
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1 // Para asegurar números enteros en el eje Y
                        }
                    }
                }
            }
        });

        // 2. Gráfico de Distribución de Países (Pie Chart)
        if (countryChartInstance) {
            countryChartInstance.destroy();
        }
        const countryCtx = document.getElementById('countryChart').getContext('2d');
        const countryCounts = allData.reduce((acc, curr) => {
            acc[curr.pais] = (acc[curr.pais] || 0) + 1;
            return acc;
        }, {});

        countryChartInstance = new Chart(countryCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(countryCounts),
                datasets: [{
                    label: 'Distribución por País',
                    data: Object.values(countryCounts),
                    backgroundColor: [ // Colores variados
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                        'rgba(255, 159, 64, 0.7)'
                    ],
                    borderColor: '#fff',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
            }
        });

        // 3. Gráfico de Tendencia de IMC (Line Chart - para los primeros 10, por ejemplo)
        if (bmiChartInstance) {
            bmiChartInstance.destroy();
        }
        const bmiCtx = document.getElementById('bmiChart').getContext('2d');
        const bmiData = allData.slice(0, 10).map(d => parseFloat(d.imc)); // Tomar IMC, convertir a float
        const bmiLabels = allData.slice(0, 10).map(d => d.nombre);

        bmiChartInstance = new Chart(bmiCtx, {
            type: 'line',
            data: {
                labels: bmiLabels,
                datasets: [{
                    label: 'IMC',
                    data: bmiData,
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false // IMC no suele empezar en cero
                    }
                }
            }
        });
    }

    // Event listener para el envío del formulario
    form.addEventListener('submit', (event) => {
        event.preventDefault(); // Evitar que la página se recargue

        const nombre = document.getElementById('nombre').value.trim();
        const edad = parseInt(document.getElementById('edad').value);
        const altura = parseFloat(document.getElementById('altura').value);
        const peso = parseFloat(document.getElementById('peso').value);
        const ciudad = document.getElementById('ciudad').value.trim();
        const pais = document.getElementById('pais').value.trim();

        if (nombre && !isNaN(edad) && !isNaN(altura) && !isNaN(peso) && ciudad && pais) {
            const imc = calculateIMC(peso, altura);
            const newData = { nombre, edad, altura, peso, imc, ciudad, pais };
            allData.push(newData);

            // Guardar en localStorage
            localStorage.setItem('personalData', JSON.stringify(allData));

            renderTable();
            updateCharts();
            form.reset(); // Limpiar el formulario
        } else {
            alert('Por favor, completa todos los campos correctamente.');
        }
    });

    clearDataButton.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres borrar todos los datos? Esta acción no se puede deshacer.')) {
            allData = [];
            localStorage.removeItem('personalData');
            renderTable();
            updateCharts(); // Esto limpiará los gráficos o los mostrará vacíos
        }
    });

    // Cargar datos y gráficos iniciales si existen en localStorage
    renderTable();
    updateCharts();
});
