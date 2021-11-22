let BARCODE = '';
let ITEMS_REF = 0;
renderPrinterSettings();

// SEARCH PANEL FUNCTIONS AND ACTIONS
//---------------------------------------------------------------------------
const search_panel_el = document.querySelector('#search-panel');
const search_input_el = document.querySelector('#search-input');
const search_input_btn_el = document.querySelector('#search-input-btn');
const search_close_el = document.querySelector('#search-close');
const search_btn = document.querySelector('#search-btn');

/**
 * Search Panel Close and Open
 */
const closeOpenSearchPanel = () => {
    search_panel_el.classList.toggle('active');
    if (search_panel_el.classList.contains('active')) {
        search_input_el.value = '';
        search_input_el.focus();
    }
};

/**
 * Show Search  Loading
 */
function showSearchPanelLoading() {
    const searchPanelLoading = document.querySelector('#search-panel .loading');
    searchPanelLoading.classList.add('active');
}

/**
 * Hidding Search Losing Panel
 */
function hideSearchPanelLoading() {
    const searchPanelLoading = document.querySelector('#search-panel .loading');
    searchPanelLoading.classList.remove('active');
}

/**
 * @param {string} text
 * Show Searching panel Placeholder
 */
function showSearchingPanelPlaceholder(text) {
    const searchPanelPlaceholder = document.querySelector(
        '#search-panel > .bottom > .info_al'
    );
    searchPanelPlaceholder.innerHTML = text;
    searchPanelPlaceholder.classList.add('active');
}

/**
 * Hide Searching Panel Placeholder
 */
function hideSearchingPanelPlaceholder() {
    const searchPanelPlaceholder = document.querySelector(
        '#search-panel > .bottom > .info_al'
    );
    searchPanelPlaceholder.classList.remove('active');
}

/**
 * When search button clicked and get data. Then render it.
 */
search_input_btn_el.addEventListener('click', () => {
    getSearchinResualt(search_input_el.value);
});

// Closing and Opening Search Panel
search_close_el.addEventListener('click', closeOpenSearchPanel);
search_btn.addEventListener('click', closeOpenSearchPanel);

// INFO PANEL FUNCTIONS AND ACTIONS
//---------------------------------------------------------------------------

/**
 * Show Info Panel Loading
 */
const showInfoPanelLoading = () => {
    const infoLoading = document.querySelector('#info .loading');
    infoLoading.classList.add('active');
};

/**
 * Hide Info Panel Loding
 */
const hideInfoPanelLoading = () => {
    const infoLoading = document.querySelector('#info .loading');
    infoLoading.classList.remove('active');
};

/**
 *
 * @param {string} text Placeholder text
 *
 * Show Info Panel Placeholder with text
 */
const showInfoPanelPlaceholder = (text) => {
    const infoPanelPlaceholder = document.querySelector('#info .info_al');
    infoPanelPlaceholder.innerHTML = text;
    infoPanelPlaceholder.classList.add('active');
};

/**
 * Hide Info Panel Placeholder
 */
const hideInfoPanelPlaceholder = () => {
    const infoPanelPlaceholder = document.querySelector('#info .info_al');
    if (infoPanelPlaceholder.classList.contains('active')) {
        infoPanelPlaceholder.classList.remove('active');
    }
};

/**
 * Render Printer Settings
 */
function renderPrinterSettings() {
    const printersSection = document.querySelector('#printers-printer');
    printersSection.innerHTML = '';
    let printer = null;
    if (getCookie('printer')) {
        printer = JSON.parse(getCookie('printer'));
    }

    // fetching all printers
    fetch(`../api/v1/print/getPrinters/`, {
        headers: {
            'Content-Type': 'application/json',
        },
        method: 'GET',
    })
        .then((data) => data.json())
        .then((data) => {
            for (data_printer of data) {
                if (printer && printer.printer.id == data_printer.id) {
                    printersSection.innerHTML += `<option value="${data_printer.id}" selected="selected">${data_printer.name}</option>`;
                } else {
                    printersSection.innerHTML += `<option value="${data_printer.id}">${data_printer.name}</option>`;
                }
            }
        })
        .catch((data) => {
            alert(
                'Garaşylmadyk ýalňyşlyk boldy. Sahypany täzelap täzeden synanşyň.'
            );
        });

    // BEYLEKI MAGLUMATLARY RENDER
    if (printer) {
        // Ribon settings
        for (ribon of document.querySelector('#ribon_type').options) {
            if (ribon.value == printer.ribon.value) {
                document.querySelector('#ribon_type').selectedIndex =
                    ribon.index;
            }
        }

        // printType settings
        for (type of document.querySelector('#print_type').options) {
            if (type.value == printer.printType.value) {
                document.querySelector('#print_type').selectedIndex =
                    type.index;
                if (printer.printType.value == 'F') {
                    document
                        .querySelector('[for="size"]')
                        .classList.remove('d-none');
                    document
                        .querySelector('[name="size"]')
                        .classList.remove('d-none');
                    document
                        .querySelector('[for="tarih"]')
                        .classList.remove('d-none');
                    document
                        .querySelector('[name="tarih"]')
                        .classList.remove('d-none');
                } else {
                    document
                        .querySelector('[for="size"]')
                        .classList.add('d-none');
                    document
                        .querySelector('[name="size"]')
                        .classList.add('d-none');
                    document
                        .querySelector('[for="tarih"]')
                        .classList.add('d-none');
                    document
                        .querySelector('[name="tarih"]')
                        .classList.add('d-none');
                    document
                        .querySelector('.info_print .birim')
                        .classList.add('active');
                }
            }
        }

        // Size settings
        for (size of document.querySelector('#size_page').options) {
            if (size.value == printer.size) {
                document.querySelector('#size_page').selectedIndex = size.index;
            }
        }

        // Printer info settings
        document.querySelector('.printer_barada>.printer-name').innerHTML =
            printer.printer.name;
        document.querySelector(
            '.printer_barada>.printer-alt-info'
        ).innerHTML = `${printer.printType.text} | ${printer.size} | ${printer.ribon.text}`;
    } else {
        // If printer cookies empty show printer settings
        $('#printerSettings').modal('show');
    }
    // set Date
    document.querySelector('#tarih').valueAsDate = new Date();
}

// Barcode read
const barcodeInput = document.querySelector('#barcodeInput');

barcodeInput.addEventListener('keypress', async (event) => {
    if (event.keyCode == 13) {
        await fetchInfoDataWithBarcode(
            document.querySelector('[name="barcode"]').value
        );
        document.querySelector('[name="barcode"]').value = '';
        document.querySelector('[name="barcode"]').style.display = 'none';
        barcodeButtonForScan.classList.toggle('active');
    }
});

// PRINTER SETTINGS FUNCTION AND ACTIONS
// ---------------------------------------------------------------------------------------

document
    .querySelector('#printer-settings-save')
    .addEventListener('click', () => {
        let printerSettings = {};

        // Printer id and name set
        printerSelection = document.querySelector('#printers-printer');
        printerSettings.printer = {
            id: printerSelection.value,
            name: printerSelection.options[printerSelection.selectedIndex].text,
        };

        // Printer ribon set
        ribonSelection = document.querySelector('#ribon_type');
        printerSettings.ribon = {
            value: ribonSelection.value,
            text: ribonSelection.options[ribonSelection.selectedIndex].text,
        };

        // Print type set
        printTypeSelection = document.querySelector('#print_type');
        printerSettings.printType = {
            value: printTypeSelection.value,
            text: printTypeSelection.options[printTypeSelection.selectedIndex]
                .text,
        };

        // If printType is Barcode set size 45x15 else set chosen size
        if (printerSettings.printType.value == 'B') {
            printerSettings.size = '45x15';
            document
                .querySelector('.info_print .birim')
                .classList.add('active');
        } else {
            printerSettings.size = document.querySelector('#size_page').value;
        }

        setCookie('printer', JSON.stringify(printerSettings), 350);

        // Printer Label info set
        document.querySelector('.printer_barada>.printer-name').innerHTML =
            printerSettings.printer.name;

        document.querySelector(
            '.printer_barada>.printer-alt-info'
        ).innerHTML = `${printerSettings.printType.text} | ${printerSettings.size} | ${printerSettings.ribon.text}`;
    });

// When change printType show or hide size, date
document.querySelector('#print_type').addEventListener('change', (d) => {
    if (document.querySelector('#print_type').value == 'F') {
        document.querySelector('[for="size"]').classList.remove('d-none');
        document.querySelector('[name="size"]').classList.remove('d-none');
        document.querySelector('[for="tarih"]').classList.remove('d-none');
        document.querySelector('[name="tarih"]').classList.remove('d-none');
        document.querySelector('.info_print .birim').classList.remove('active');
    } else {
        document.querySelector('[for="size"]').classList.add('d-none');
        document.querySelector('[name="size"]').classList.add('d-none');
        document.querySelector('[for="tarih"]').classList.add('d-none');
        document.querySelector('[name="tarih"]').classList.add('d-none');
        document.querySelector('.info_print .birim').classList.add('active');
    }
});

// Close Printer Panel
document.querySelector('.close').addEventListener('click', closeOpenPrint);

function closeOpenPrint() {
    document.querySelector('#printer').classList.toggle('active');
    if (getCookie('printer')) {
        const printer = JSON.parse(getCookie('printer'));
        if (printer.printType.value === 'B') {
            document.querySelector('#birim-printer').select();
        } else {
            document.querySelector('#miktar-printer').select();
        }
    }
}

// print miktar settings
const miktarPrinterInputEl = document.querySelector('#miktar-printer');
document.querySelector('.miktar-m').addEventListener('click', () => {
    miktarPrinterInputEl.value =
        parseInt(miktarPrinterInputEl.value) > 1
            ? parseInt(miktarPrinterInputEl.value) - 1
            : 1;
});

document.querySelector('.miktar-p').addEventListener('click', () => {
    miktarPrinterInputEl.value = parseInt(miktarPrinterInputEl.value) + 1;
});

// print barkod sayisi settings
const birimPrinterInputEl = document.querySelector('#birim-printer');
document.querySelector('.birim-m').addEventListener('click', () => {
    birimPrinterInputEl.value =
        parseInt(birimPrinterInputEl.value) > 1
            ? parseInt(birimPrinterInputEl.value) - 1
            : 1;
});

document.querySelector('.birim-p').addEventListener('click', () => {
    birimPrinterInputEl.value = parseInt(birimPrinterInputEl.value) + 1;
});
