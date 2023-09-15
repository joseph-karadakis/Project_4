document.addEventListener("DOMContentLoaded", function () {
    const tickerSelector = document.getElementById("tickerSelector");
    const newsContent = document.getElementById("news-content");
    const stockDataContent = document.getElementById("stock-data-content");
    const candlestickChartContainer = document.getElementById("candlestickChartContainer");
    const tickerImage = document.getElementById("tickerImage");

    // function to fetch news content
    function fetchNews(selectedTicker) {
        const apiKey = 'your_api_key'; // Replace with your actual API key
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
                            <a href="${article.url}" target="_blank" class="btn custom-box-bg btn-sm text-white float-right">Read More</a>
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
        const apiKey = 'your_api_key'; // Replace with your actual API key
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

    // Function to fetch and display candlestick chart
    function fetchCandlestickChart(selectedTicker) {
        const apiKey = 'your_api_key'; // Replace with your actual API key
        const intradayApiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${selectedTicker}&interval=5min&apikey=${apiKey}`;

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
    // Create a map to store ticker symbols and their corresponding thumbnail URLs
    const tickerThumbnailUrls = new Map();

    // Add entries for each ticker symbol and its thumbnail URL
    tickerThumbnailUrls.set("AAPL", "https://mdc.mo.gov/sites/default/files/styles/carousel/public/mdcd7/media/images/2014/03/pa2-04-2014.jpg?h=ed80be45&itok=ROS0jacl");
    tickerThumbnailUrls.set("SBUX", "https://example.com/thumbnails/SBUX.png");
    tickerThumbnailUrls.set("MSFT", "https://example.com/thumbnails/MSFT.png");
    tickerThumbnailUrls.set("CSCO", "https://example.com/thumbnails/CSCO.png");
    tickerThumbnailUrls.set("QCOM", "https://example.com/thumbnails/QCOM.png");
    tickerThumbnailUrls.set("META", "https://example.com/thumbnails/META.png");
    tickerThumbnailUrls.set("AMZN", "https://example.com/thumbnails/AMZN.png");
    tickerThumbnailUrls.set("TSLA", "https://example.com/thumbnails/TSLA.png");
    tickerThumbnailUrls.set("AMD", "https://example.com/thumbnails/AMD.png");
    tickerThumbnailUrls.set("NFLX", "https://example.com/thumbnails/NFLX.png");

    // Function to get the thumbnail URL for a selected ticker
    function getTickerThumbnailUrl(predictionsSelectedTicker) {
        // Check if the selectedTicker exists in the map
        if (tickerThumbnailUrls.has(predictionsSelectedTicker)) {
            return tickerThumbnailUrls.get(predictionsSelectedTicker);
        } else {
            // Return a default URL or handle the case when the ticker is not found
            return "https://example.com/default-thumbnail.png"; // Replace with a default image URL
        }
    }
    // Listener for tickerSelector
    tickerSelector.addEventListener("change", function () {
        const selectedTicker = this.value;
        fetchNews(selectedTicker);
        fetchStockData(selectedTicker);
        fetchCandlestickChart(selectedTicker); // Fetch and display the candlestick chart
    });

    // Listener for predictionsTickerSelector
    const predictionsTickerSelector = document.getElementById("predictionsTickerSelector");
    predictionsTickerSelector.addEventListener("change", function () {
        const predictionsSelectedTicker = this.value;
        getTickerThumbnailUrl(predictionsSelectedTicker);
        
        // Display the ticker thumbnail based on the selected ticker
        const thumbnailUrl = getTickerThumbnailUrl(predictionsSelectedTicker);
        tickerImage.innerHTML = `<img src="${thumbnailUrl}" alt="${predictionsSelectedTicker} Thumbnail" class="img-thumbnail">`;
    });

});
