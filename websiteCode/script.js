
document.addEventListener("DOMContentLoaded", function () {
    const tickerSelector = document.getElementById("tickerSelector");
    const newsContent = document.getElementById("news-content");
    const stockDataContent = document.getElementById("stock-data-content");

    // function to fetch news content
    function fetchNews(selectedTicker) {
        const apiKey =  'demo';
        const apiUrl = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${selectedTicker}&apikey=${apiKey}`;

        // loading message
        newsContent.innerHTML = '<div class="text-center">Loading news...</div>';

        fetch(apiUrl)
            .then((response) => response.json())
            .then((data) => {
                newsContent.innerHTML = ''; // Clear loading message

                if (data.feed && data.feed.length > 0) {
                    const newsList = document.createElement('ul');
                    newsList.classList.add('list-group');

                    data.feed.forEach((article) => {
                        const listItem = document.createElement('li');
                        listItem.classList.add('list-group-item');
                        const articleDate = new Date(article.time_published);

                        listItem.innerHTML = `
                            <h5>${article.title}</h5>
                            <p>${article.summary}</p>
                            <small>${articleDate.toLocaleString()}</small>
                            <a href="${article.url}" target="_blank" class="btn btn-primary btn-sm float-right">Read More</a>
                        `;
                        newsList.appendChild(listItem);
                    });

                    newsContent.appendChild(newsList);
                } else {
                    newsContent.innerHTML = '<div class="text-center">No news articles available.</div>';
                }
            })
            .catch((error) => {
                console.error('Error fetching news:', error);
                newsContent.innerHTML = '<div class="text-center text-danger">Error fetching news. Please try again later.</div>';
            });
    }

    //format numbers with commas
    function formatNumberWithCommas(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    // fetch and display stock data
    function fetchStockData(selectedTicker) {
        const apiKey =  'demo'; 
        const stockApiUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${selectedTicker}&apikey=${apiKey}`;

        stockDataContent.innerHTML = '<div class="text-center">Loading stock data...</div>';

        fetch(stockApiUrl)
            .then((response) => response.json())
            .then((data) => {
                if (data && data['Global Quote']) {
                    const symbol = data['Global Quote']['01. symbol'];
                    const price = parseFloat(data['Global Quote']['05. price']);
                    const change = parseFloat(data['Global Quote']['09. change']);
                    const changePercent = parseFloat(data['Global Quote']['10. change percent']);
                    const volume = parseInt(data['Global Quote']['06. volume']);
                    const timestamp = data['Global Quote']['07. latest trading day'];
                    const formattedVolume = formatNumberWithCommas(volume);

                    stockDataContent.innerHTML = `
                        <h2>${symbol}</h2>
                        <p>Price: $${price.toFixed(2)}</p>
                        <p>Change: <span style="color: ${change >= 0 ? 'green' : 'red'};">$${change.toFixed(2)}</span></p>
                        <p>Change Percent: <span style="color: ${changePercent >= 0 ? 'green' : 'red'};">${changePercent.toFixed(2)}%</span></p>
                        <p>Volume: ${formattedVolume}</p>
                        <p>Timestamp: ${timestamp}</p>
                    `;
                } else {
                    stockDataContent.innerHTML = '<div class="text-center text-danger">Stock data not found for this symbol.</div>';
                }
            })
            .catch((error) => {
                console.error('Error fetching stock data:', error);
                stockDataContent.innerHTML = '<div class="text-center text-danger">Error fetching stock data. Please try again later.</div>';
            });
    }

    // Listener for tickerSelector
    tickerSelector.addEventListener("change", function () {
        const selectedTicker = this.value;
        fetchNews(selectedTicker);
        fetchStockData(selectedTicker);
    });
    // Function to fetch and display candlestick chart
    function fetchCandlestickChart(selectedTicker) {
        const apiKey = 'demo';
        const intradayApiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=IBM&interval=5min&apikey=${apiKey}`;

        fetch(intradayApiUrl)
            .then((response) => response.json())
            .then((data) => {
                if (data["Time Series (5min)"]) {
                    const timeSeriesData = data["Time Series (5min)"];
                    const seriesData = [];

                    for (const timestamp in timeSeriesData) {
                        const entry = timeSeriesData[timestamp];
                        const open = parseFloat(entry["1. open"]);
                        const high = parseFloat(entry["2. high"]);
                        const low = parseFloat(entry["3. low"]);
                        const close = parseFloat(entry["4. close"]);
                        seriesData.push([Date.parse(timestamp), open, high, low, close]);
                    }

                    // Create the candlestick chart
                    Highcharts.stockChart("candlestickChartContainer", {
                        rangeSelector: {
                            selected: 1
                        },
                        title: {
                            text: "Intraday Chart"
                        },
                        series: [{
                            type: "candlestick",
                            name: selectedTicker,
                            data: seriesData
                        }]
                    });
                } else {
                    console.error("No intraday data available for the selected symbol.");
                    // You can display an error message or handle this case as needed.
                }
            })
            .catch((error) => {
                console.error("Error fetching intraday data:", error);
                // You can display an error message or handle this case as needed.
            });
    }

    // Listener for tickerSelector
    tickerSelector.addEventListener("change", function () {
        const selectedTicker = this.value;
        fetchNews(selectedTicker);
        fetchStockData(selectedTicker);
        fetchCandlestickChart(selectedTicker); // Fetch and display the candlestick chart
    });
    
});
