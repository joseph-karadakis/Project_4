// function fetchStockData() {
    //     const apiKey = '7IWYGE8ECV7Q03TY';
    //     const selectedSymbol = document.getElementById('symbol-select').value;
    //     const apiUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${selectedSymbol}&apikey=${apiKey}`;

    //     fetch(apiUrl)
    //         .then(response => response.json())
    //         .then(data => {
    //             const symbol = data['Global Quote']['01. symbol'];
    //             const price = parseFloat(data['Global Quote']['05. price']);
    //             const change = parseFloat(data['Global Quote']['09. change']);
    //             const changePercent = parseFloat(data['Global Quote']['10. change percent']);
    //             const volume = parseInt(data['Global Quote']['06. volume']);
    //             const timestamp = data['Global Quote']['07. latest trading day'];

    //             const formattedVolume = formatNumberWithCommas(volume);

    //             const resultContainer = document.getElementById('result-container');
    //             resultContainer.innerHTML = `
    //                 <h2>${symbol}</h2>
    //                 <p>Price: $${price.toFixed(2)}</p>
    //                 <p>Change: <span style="color: ${change >= 0 ? 'green' : 'red'};">$${change.toFixed(2)}</span></p>
    //                 <p>Change Percent: <span style="color: ${changePercent >= 0 ? 'green' : 'red'};">${changePercent.toFixed(2)}%</span></p>
    //                 <p>Volume: ${formattedVolume}</p>
    //                 <p>Timestamp: ${timestamp}</p>
    //             `;
    //         })
    //         .catch(error => console.error(error));
    // }