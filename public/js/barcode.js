document.querySelector('#barcode-btn').addEventListener('click', (x) => {
    window.location.href = 'http://zxing.appspot.com/scan?...';
});
BARCODE = '';
if (window.location.search.slice(6)) {
    BARCODE = window.location.search.slice(6);
    fetchInfoDataWithBarcode(BARCODE);
}
