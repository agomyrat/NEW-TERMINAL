/**
 * Maglumatlary ugradyp yzyna gelen zady alamak ucin
 *
 * @param {string} method POST or GET
 * @param {string} url API url
 * @param {object} param ugradyljak maglumatlar {}
 * @param {function} callback yzyna gaytarylyan zatlar
 * @author Agamyrat C
 * @returns 
 */
async function getData(method, url, param, callback) {
    const response = await window.fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(param) 
    });
    return callback(response.json());
}



  
  


