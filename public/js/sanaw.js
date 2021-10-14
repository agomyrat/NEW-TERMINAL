TERMINAL_NAME = getCookie('terminalUUID');
let SANOW = [];
// egerde terminal ady yok bolsa.
if (!TERMINAL_NAME.trim()) {
    TERMINAL_NAME = uuidv4();
    setCookie('terminalUUID', TERMINAL_NAME, 365);
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}




// Barcode read 
const barcodeInput = document.querySelector("#barcodeInput");

const barcodeButtonForScan = document.querySelector('#barcode-btn');
barcodeButtonForScan.addEventListener('click', (e) => {
    if (barcodeButtonForScan.style.backgroundColor != "#66b0ff") {
        barcodeInput.value="";
        barcodeInput.style.display = 'block';
        barcodeInput.focus();
        BARCODE = "";
    } else {
        document.querySelector('body').focus();
        barcodeInput.style.display = 'none';
        barcodeInput.value = '';
    }
});

barcodeInput.addEventListener('focus', (event) => {
    barcodeButtonForScan.style.backgroundColor = "#66b0ff";
});

barcodeInput.addEventListener('blur', (event) => {
    barcodeButtonForScan.style.backgroundColor = "#fff";
});


const info_el = document.querySelector("#info");
// Barcode okadylan vagty maglumatlary getir egerde onden yok bolsa render et egerde bar bolsa miktaryny ulalt
barcodeInput.addEventListener('keypress', async (event) => {
    if (event.keyCode == 13) {
        fetch(
            `../api/v1/items/sanaw/newItem`,
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify({
                    "barcode":barcodeInput.value,
                    "terminal":TERMINAL_NAME
                })
            })
            .then((data) => data.json())
            .then((data) => {
                if (data.id) {
                    
                    // creating element for new items or change items
                    const item_el = document.createElement('div');
                    item_el.className = 'items new';
                    item_el.setAttribute('data-items-id', data.id);
                    item_el.innerHTML = `
                        <div class="item-info">
                            <div class="code" ondblclick="setFocuse(${data.id})">${data.code}</div>
                            <div class="name" ondblclick="setFocuse(${data.id})">${data.name}</div>
                        </div>
                        <div class="count">
                            <div class="up" onclick='up(${data.id})'></div>
                            <input type="number" name="" id="" value="${data.miktar}" onchange="changeItemCount(${data.id})">
                            <div class="down" onclick='down(${data.id})'></div>
                        </div>
                    `;
                    // ONDEN BAR BOLSA MIKTARININ USTUNE GOSH.
                    if (SANOW.some(item => { return item.id == data.id })) {
                        info_el.querySelector(`[data-items-id="${data.id}"]`).remove();
                        let newMiktar = 0;
                        
                        SANOW.forEach(item => {
                            if (item.id == data.id) {
                                newMiktar = item.miktar + data.miktar;
                                item.miktar = newMiktar;
                            }
                            return item;
                        });
                        item_el.querySelector('input').value = newMiktar;
    
                    } else {
                        SANOW.push(data);
                    }
                    info_el.insertBefore(item_el, info_el.firstChild);
                    setTimeout(() => {
                        item_el.classList = "items";
                    }, 1000);
                } else {
                    error()
                }

            })
            .catch((err) => {
                // If something is error: hide loading;
                error()

            })
        barcodeInput.value = "";
        barcodeInput.focus();
    } else {
        barcodeInput.value = "";
        barcodeButtonForScan.classList.add('error');
        setTimeout(() => {
            barcodeButtonForScan.classList.remove('error');
        }, 1500);
    }
});

// when change items count
const changeItemCount = function (id) {
    const itemInput = document.querySelector(`[data-items-id="${id}"] input`);
    if (parseFloat(itemInput.value) == 0 && document.querySelector(`[data-items-id="${id}"] .down`).classList.contains('delete')) {
        document.querySelector(`[data-items-id="${id}"]`).remove();
        fetch(
            `../api/v1/items/sanaw/`,
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                method: "DELETE",
                body: JSON.stringify({ id, terminal:TERMINAL_NAME })
            })
            .then((data) => data.json())
            .then((data) => {
                if (data.status != "success") {
                    console.dir(data);
                    error();
                } 
            })
            .catch((err) => {
                // If something is error: hide loading;
                error();
            })
    } else {
        const miktar = parseFloat(document.querySelector(`[data-items-id="${id}"] input`).value);
        fetch(
            `../api/v1/items/sanaw/changeCount`,
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                method: "PUT",
                body: JSON.stringify({ id, miktar, terminal:TERMINAL_NAME })
            })
            .then((data) => data.json())
            .then((data) => {
                if (data.status != "success") {
                    error();
                } 
            })
            .catch((err) => {
                // If something is error: hide loading;
                error();
            })
    }
    if (parseFloat(itemInput.value)==0) {
        document.querySelector(`[data-items-id="${id}"] .down`).classList.add('delete');
    } else {
        document.querySelector(`[data-items-id="${id}"] .down`).classList.contains('delete') ?
            document.querySelector(`[data-items-id="${id}"] .down`).classList.remove('delete') : '';
    }
        
}

function error(){
    barcodeButtonForScan.classList.add('error');
    setTimeout(() => {
        barcodeButtonForScan.classList.remove('error');
    }, 1000);
}

function setFocuse(id) {
    document.querySelector(`[data-items-id="${id}"] input`).select()
}

function up(id) {
    itemInput = document.querySelector(`[data-items-id="${id}"] input`);
    itemInput.value = parseFloat(itemInput.value) + 1;
    changeItemCount(id);
}

function down(id) {
    itemInput = document.querySelector(`[data-items-id="${id}"] input`);
     
    itemInput.value = parseFloat(itemInput.value) - 1 <= 0 ? 0 : parseFloat(itemInput.value) - 1;
    changeItemCount(id)
}

window.onload  = ()=> {
    fetch(
        `../api/v1/items/sanaw/${TERMINAL_NAME}`,
        {
            headers: {
                'Content-Type': 'application/json'
            },
            method: "GET",
        })
        .then((data) => data.json())
        .then((items) => {
            items.map(data => {
                if (data.id) {
                    const item_el = document.createElement('div');
                    item_el.className = 'items';
                    item_el.setAttribute('data-items-id', data.id);
                    item_el.innerHTML = `
                        <div class="item-info">
                            <div class="code" ondblclick="setFocuse(${data.id})">${data.code}</div>
                            <div class="name" ondblclick="setFocuse(${data.id})">${data.name}</div>
                        </div>
                        <div class="count">
                            <div class="up" onclick='up(${data.id})'></div>
                            <input type="number" name="" id="" value="${data.miktar}" onchange="changeItemCount(${data.id})">
                            <div class="down" onclick='down(${data.id})'></div>
                        </div>
                    `;
                    info_el.insertBefore(item_el, info_el.firstChild);
                }
            })
            SANOW = items;
        })
        .catch((err) => {
            alert("Garaşylmadyk ýalňyşlyk boldy. Sahypany täzelap täzeden synanşyň.");
        })
}








