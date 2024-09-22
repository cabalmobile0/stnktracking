const apiKey = 'AIzaSyD-5pzxAE3OQ_XwJS980gimWYrK5Jqg7mc'; // Ganti dengan API Key Anda
const sheetId1 = '14C5a4TEYbrx5pdUoVjio2kS3yikAN4ygm95BCkl4kGM'; // Ganti dengan ID spreadsheet pertama
const sheetId2 = '1AgB8uek81Q_Nd6aSyUAB9g2DFzoB5xz3bZR1RCO5fJg'; // Ganti dengan ID spreadsheet kedua
const range = 'Sheet1!A:Q'; // Sesuaikan rentang untuk mencakup semua kolom

function trackItem() {
    const trackId = document.getElementById('trackId').value;
    const resultDiv = document.getElementById('trackResult');
    const timelineDiv = document.getElementById('timeline');

    if (!trackId) {
        alert("Harap masukkan ID Pelacakan.");
        return;
    }

    // Ambil data dari kedua spreadsheet
    Promise.all([
        fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId1}/values/${range}?key=${apiKey}`).then(response => response.json()),
        fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId2}/values/${range}?key=${apiKey}`).then(response => response.json())
    ])
    .then(dataArray => {
        const [data1, data2] = dataArray;
        const rows1 = data1.values || [];
        const rows2 = data2.values || [];
        
        const rows = [...rows1, ...rows2]; // Gabungkan data dari kedua spreadsheet
        const header = rows[0];
        const idIndex = header.indexOf('ID Pelacakan');
        const nameIndex = header.indexOf('Nama STNK');
        const addressIndex = header.indexOf('No Rangka');

        let result = 'ID Pelacakan tidak ditemukan.';
        let timelineContent = '';

        // Loop untuk menemukan ID Pelacakan yang cocok
        for (let i = 1; i < rows.length; i++) {
            if (rows[i][idIndex] === trackId) {
                result = `
                    <div style="text-align: center; color: #ffffff; font-size: 18px;">
                        <div style="color: #ffffff; text-shadow: 0 0 10px rgba(255, 77, 77, 0.8);">
                            <strong>Nama STNK:</strong> ${rows[i][nameIndex]}
                        </div>
                        <div style="color: #ffffff; text-shadow: 0 0 10px rgba(255, 77, 77, 0.8);">
                            <strong>No Rangka:</strong> ${rows[i][addressIndex]}
                        </div>
                    </div>`;

                // Loop untuk mengambil status dan tanggal pengiriman (dari kolom 4 hingga akhir, sampai Status 5)
                for (let j = 3; j < rows[i].length; j += 2) {
                    const date = rows[i][j];  // Ambil tanggal
                    const status = rows[i][j + 1];  // Ambil status

                    if (date && status) {
                        timelineContent += `
                            <div class="container ${j % 4 === 0 ? 'left' : 'right'}">
                                <div class="content">
                                    <h3>${date}</h3>
                                    <p><strong>Status:</strong> ${status}</p>
                                </div>
                            </div>`;
                    }
                }
                break;
            }
        }

        resultDiv.innerHTML = result;
        timelineDiv.innerHTML = timelineContent || 'ID Pelacakan tidak ditemukan.';
    })
    .catch(error => {
        console.error('Error:', error);
        resultDiv.innerHTML = 'Terjadi kesalahan saat mengambil data.';
        timelineDiv.innerHTML = '';
    });
}

function pasteText() {
    navigator.clipboard.readText().then(text => {
        document.getElementById('trackId').value = text;
    }).catch(err => {
        console.error('Failed to read clipboard contents: ', err);
    });
}

