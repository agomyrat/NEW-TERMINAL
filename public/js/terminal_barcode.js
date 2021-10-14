const barcodeButtonForScan = document.querySelector('#barcode-btn');
barcodeButtonForScan.addEventListener('click', (e) => {
    if (barcodeButtonForScan.style.backgroundColor != '#66b0ff') {
        barcodeInput.value = '';
        barcodeInput.style.display = 'block';
        barcodeInput.focus();
        BARCODE = '';
    } else {
        document.querySelector('body').focus();
        barcodeInput.style.display = 'none';
        barcodeInput.value = '';
    }
});
barcodeInput.addEventListener('focus', (event) => {
    barcodeButtonForScan.style.backgroundColor = '#66b0ff';
});

barcodeInput.addEventListener('blur', (event) => {
    barcodeButtonForScan.style.backgroundColor = '#fff';
});
