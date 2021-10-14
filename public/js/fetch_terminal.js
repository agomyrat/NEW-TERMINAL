// GET INFO WITH SEARCH AND RENDER SEARCH_RESAULT CARTS
/**
 *
 * @param {string} search_text Searching text
 * @param {int} limit Limit of carts
 *
 * Return: Searching cards render.
 */
const getSearchinResualt = (search_text = '', limit = 100) => {
    // Searching text is empty don't do any thing
    if (search_text == '') {
        return;
    }

    // Clearch old cards
    const oldSearchingCards =
        search_panel_el.querySelectorAll('.bottom .search-r');
    for (el of oldSearchingCards) {
        el.remove();
    }

    // Show loading before fetching data
    hideSearchingPanelPlaceholder();
    showSearchPanelLoading();

    // Fetching data
    fetch(`../api/v1/items/search/${search_text}/limit/${limit}`, {
        headers: {
            'Content-Type': 'application/json',
        },
        method: 'GET',
    })
        .then((data) => data.json())
        .then((data) => {
            // Data is came hiden loading
            hideSearchPanelLoading();
            if (data.length == 0) {
                showSearchingPanelPlaceholder(
                    `"${search_text}" sözüne göra haryt tapylmady...`
                );
            } else {
                hideSearchingPanelPlaceholder();
            }

            // Render cards
            for (el of data) {
                search_panel_el.querySelector(
                    '#search-panel .bottom'
                ).innerHTML =
                    `
                    <div class="search-r" onclick='fetchInfoDataWithID(${el.id})'>
                        <div class="info">
                            <div class="header">${el.code}</div>
                            <div class="title">
                                ${el.name}
                            </div>
                        </div>
                    </div>
                    ` + search_panel_el.querySelector('.bottom').innerHTML;
            }
        })
        .catch((err) => {
            // If something is error: hide loading;
            hideSearchPanelLoading();
            alert('Ýalňyşlyk döredi. Sahypany täzeläp dowam ediň');
            showSearchingPanelPlaceholder(
                'Gözleg sözüni ýazyň we "Gözle" düwmesine basyň...'
            );
        });
};

/**
 *
 * @param {object} product
 *
 * render all information about product
 */
const renderProductInfo = (product) => {
    const generalInfo = document.querySelector('#info');
    if (product) {
        generalInfo.innerHTML =
            `
        <div class="btn btn-primary float-right container-fluid mt-2 mb-2" id="yazdir" onclick="closeOpenPrint()">Çap et</div>

        <div class="card">
            <div class="header">Harytd Kody</div>
            <div class="title">${product.code}</div>
        </div>
        <div class="card">
            <div class="header">Haryt Ady</div>
            <div class="title">${product.name}</div>
        </div>
        <div class="card">
            <div class="header">Bahasy</div>
            <div class="title">${product.price}</div>
        </div>
        <div class="card">
            <div class="header">Birim</div>
            <div class="title">${product.unit}</div>
        </div>
        <div class="card">
            <div class="header">Bahanyň soňky üýtgedilen senesi</div>
            <div class="title">${product.last_updated_price}</div>
        </div>
        <div class="stok-box"></div> ` + generalInfo.innerHTML;
        const stock_box = document.querySelector('.stok-box');
        for (stock of product.stock) {
            stock_box.innerHTML += `
            <div class="stok card">
                <div class="name">${stock.warehouse_name}</div>
                <div class="count">${Math.round(stock.amount * 100) / 100}</div>
            </div>
            `;
        }
    } else {
        alert('Ýalňyşlyk döredi. Sahypany täzeläp dowam ediň');
        showInfoPanelPlaceholder(`Haryt barada maglumat üçin haryt okadyň.`);
        ITEMS_REF = 0;
        BARCODE = '';
    }
};

/**
 * @param {int} id Product logical ref (id)
 * Fetching data then render with renderProcuntInfo;
 */
const fetchInfoDataWithID = (id) => {
    // Search Panel close etmezden on Pozmaly zatlary pozup sonra loading sonra render etmeli
    const carts = document.querySelectorAll('#info .card');
    for (el of carts) {
        el.remove();
    }
    const stok_box = document.querySelector('#info .stok-box');
    if (stok_box) {
        stok_box.remove();
    }
    const yazdir_btn = document.querySelector('#yazdir');
    if (yazdir_btn) {
        yazdir_btn.remove();
    }

    // text infony gizlemeli
    closeOpenSearchPanel();
    hideInfoPanelPlaceholder();
    showInfoPanelLoading();

    // Fetch
    fetch(`../api/v1/items/${id}`, {
        headers: {
            'Content-Type': 'application/json',
        },
        method: 'GET',
    })
        .then((data) => data.json())
        .then((data) => {
            hideInfoPanelLoading();
            renderProductInfo(data);
            ITEMS_REF = data?.id ? data.id : 0;
        })
        .catch((err) => {
            console.error(err);
            hideInfoPanelLoading();
            alert('Ýalňyşlyk döredi. Sahypany täzeläp dowam ediň');
            showInfoPanelPlaceholder(
                'Gözleg sözüni ýazyň we "Gözle" düwmesine basyň...'
            );
            ITEMS_REF = 0;
            BARCODE = '';
        });
};

/**
 * @param {int} id Product logical ref (id)
 * Fetching data then render with renderProcuntInfo;
 */
const fetchInfoDataWithBarcode = (barcode) => {
    // Search Panel close etmezden on Pozmaly zatlary pozup sonra loading sonra render etmeli
    const carts = document.querySelectorAll('#info .card');
    for (el of carts) {
        el.remove();
    }
    const stok_box = document.querySelector('#info .stok-box');
    if (stok_box) {
        stok_box.remove();
    }
    const yazdir_btn = document.querySelector('#yazdir');
    if (yazdir_btn) {
        yazdir_btn.remove();
    }

    // text infony gizlemeli

    hideInfoPanelPlaceholder();
    showInfoPanelLoading();
    BARCODE = barcode;
    // Fetch
    fetch(`../api/v1/items/barcode/${BARCODE}`, {
        headers: {
            'Content-Type': 'application/json',
        },
        method: 'GET',
    })
        .then((data) => data.json())
        .then((data) => {
            hideInfoPanelLoading();
            renderProductInfo(data);
            ITEMS_REF = data?.id ? data.id : 0;
            BARCODE = data?.id ? BARCODE : '';
        })
        .catch((err) => {
            console.error(err);
            hideInfoPanelLoading();
            alert('Ýalňyşlyk döredi. Sahypany täzeläp dowam ediň');
            showInfoPanelPlaceholder(
                'Gözleg sözüni ýazyň we "Gözle" düwmesine basyň...'
            );
            ITEMS_REF = 0;
            BARCODE = '';
        });
};

// PRINT ACTION
//---------------------------------------------------------------------------------------
document.querySelector('#yazdir_son').addEventListener('click', () => {
    // Egerde sayalanan bir item bar bolsa cap et egerde yok bolsa chap etme
    if (ITEMS_REF) {
        const id = ITEMS_REF;
        const miktar = document.querySelector('#miktar-printer').value;
        const birim = document.querySelector('#birim-printer').value;
        const printer_id = JSON.parse(getCookie('printer'))?.printer?.id;
        const ribon = JSON.parse(getCookie('printer'))?.ribon?.value;
        const print_type = JSON.parse(getCookie('printer'))?.printType?.value;
        const galyndy = BARCODE;
        const kapak = 1;
        const tarih = document.querySelector('#tarih').value;
        const size = JSON.parse(getCookie('printer'))?.size;
        const data = {
            id,
            miktar,
            birim,
            printer_id,
            ribon,
            print_type,
            galyndy,
            kapak,
            tarih,
            size,
        };
        closeOpenPrint();
        fetch(`../api/v1/print/`, {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify(data),
        })
            .then((data) => data.json())
            .then((data) => {
                if (data?.status == 'success') {
                } else {
                    console.error(err);
                    alert('Ýalňyşlyk döredi. Sahypany täzeläp dowam ediň');
                }
            })
            .catch((err) => {
                console.error(err);
                alert('Ýalňyşlyk döredi. Sahypany täzeläp dowam ediň');
            });
    } else {
        alert('Harydy täzeden saýlaň.');
    }
});
