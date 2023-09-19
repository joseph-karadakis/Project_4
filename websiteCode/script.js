document.addEventListener("DOMContentLoaded", function () {
    const tickerSelector = document.getElementById("tickerSelector");
    const newsContent = document.getElementById("news-content");
    const stockDataContent = document.getElementById("stock-data-content");
    const candlestickChartContainer = document.getElementById("candlestickChartContainer");
    const tickerImage = document.getElementById("tickerImage");

    let jsonData = null; 

    // Function to load and parse the JSON file for the selected ticker symbol
    function loadJSONFile(predictionsSelectedTicker) {
        const jsonFileName = `../machineLearning/LinReg/${predictionsSelectedTicker}_model_info.json`;

        fetch(jsonFileName)
            .then((response) => response.json())
            .then((data) => {
                if (data && data.intercept !== undefined && data.coef !== undefined) {
                    jsonData = data; 
                } else {
                    throw new Error("JSON data is missing required fields.");
                }
            })
            .catch((error) => {
                console.error("Error loading JSON file:", error);
            });
    }

    // Function to fetch news content
    function fetchNews(selectedTicker) {
        const apiKey = '7IWYGE8ECV7Q03TY';
        const apiUrl = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&limit=5&tickers=${selectedTicker}&apikey=${apiKey}`;

        // Loading message
        newsContent.innerHTML = '<div class="text-center">Loading news...</div>';

        fetch(apiUrl)
            .then((response) => response.json())
            .then((data) => {
                newsContent.innerHTML = '';
                if (data.feed && data.feed.length > 0) {
                    const newsList = document.createElement('ul');
                    newsList.classList.add('list-group');
                    data.feed.forEach((article) => {
                        const listItem = document.createElement('li');
                        listItem.classList.add('list-group-item');
                    
                        // Parse the date string
                        const dateString = article.time_published;
                        const year = dateString.slice(0, 4);
                        const month = dateString.slice(4, 6);
                        const day = dateString.slice(6, 8);
                        const hours = dateString.slice(9, 11);
                        const minutes = dateString.slice(11, 13);
                        const seconds = dateString.slice(13, 15);
                        const articleDate = new Date(year, month - 1, day, hours, minutes, seconds);
                        const formattedDate = articleDate.toLocaleString();
                    
                        listItem.innerHTML = `
                            <div class="row">
                                <div class="col-md-9">
                                    <h5>${article.title}</h5>
                                    <p>${article.summary}</p>
                                    <a href="${article.url}" target="_blank" class="btn custom-box-bg btn-sm text-white ">Read More</a>
                                </div>
                                <div class="col-md-3">
                                    <div class="info">
                                        <small>Author: ${article.authors.join(', ')}</small><br>
                                        <small>Source: ${article.source}</small><br>
                                        <small>Category: ${article.category_within_source}</small><br>
                                        <small>Source Domain: ${article.source_domain}</small><br>
                                        <small>Date: ${formattedDate}</small><br>
                                        <small>Overall Sentiment: ${article.overall_sentiment_label}</small><br>
                                        <small>Ticker Sentiment (${article.ticker_sentiment[0].ticker}): ${article.ticker_sentiment[0].ticker_sentiment_label}</small><br>
                                    </div>
                                </div>
                            </div>
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
        const apiKey = '7IWYGE8ECV7Q03TY'; // Replace with your actual API key
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
        const apiKey = '7IWYGE8ECV7Q03TY'; // Replace with your actual API key
        const intradayApiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${selectedTicker}&interval=5min&apikey=${apiKey}`;

        fetch(intradayApiUrl)
            .then((response) => response.json())
            .then((data) => {
                if (data["Time Series (5min)"]) {
                    const timeSeriesData = data["Time Series (5min)"];
                    const seriesData = [];
            
                    // Reverse the order of timestamps
                    const timestamps = Object.keys(timeSeriesData).reverse();
            
                    for (const timestamp of timestamps) {
                        const entry = timeSeriesData[timestamp];
                        const timestampMillis = Date.parse(timestamp);
                        const open = parseFloat(entry["1. open"]);
                        const high = parseFloat(entry["2. high"]);
                        const low = parseFloat(entry["3. low"]);
                        const close = parseFloat(entry["4. close"]);
                        seriesData.push([timestampMillis, open, high, low, close]);
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
                }
            })
    }
   
    // Create a map to store ticker symbols and their corresponding thumbnail URLs
    const tickerThumbnailPaths = new Map();

    // Add entries for each ticker symbol and its thumbnail path
    tickerThumbnailPaths.set("AAPL", "../machineLearning/aapl_plot.png");
    tickerThumbnailPaths.set("SBUX", "../machineLearning/sbux_plot.png");
    tickerThumbnailPaths.set("MSFT", "../machineLearning/msft_plot.png");
    tickerThumbnailPaths.set("CSCO", "../machineLearning/csco_plot.png");
    tickerThumbnailPaths.set("QCOM", "../machineLearning/qcom_plot.png");
    tickerThumbnailPaths.set("META", "../machineLearning/meta_plot.png");
    tickerThumbnailPaths.set("AMZN", "../machineLearning/amzn_plot.png");
    tickerThumbnailPaths.set("TSLA", "../machineLearning/tsla_plot.png");
    tickerThumbnailPaths.set("AMD", "../machineLearning/amd_plot.png");
    tickerThumbnailPaths.set("NFLX", "../machineLearning/nflx_plot.png");

    // Function to get the thumbnail path for a selected ticker
    function getTickerThumbnailPath(predictionsSelectedTicker) {
        // Check if the selectedTicker exists in the map
        if (tickerThumbnailPaths.has(predictionsSelectedTicker)) {
            return tickerThumbnailPaths.get(predictionsSelectedTicker);
        } else {
            // Return a default URL or handle the case when the ticker is not found
            return "http://make-everything-ok.com/"; // Replace with a default image URL
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
    const tickerText = document.getElementById("tickerText"); // Add this line


    predictionsTickerSelector.addEventListener("change", function () {
        const predictionsSelectedTicker = this.value;
        const thumbnailPath = getTickerThumbnailPath(predictionsSelectedTicker);
        
        // Display the ticker thumbnail based on the selected ticker
        tickerImage.innerHTML = `<img src="${thumbnailPath}" alt="${predictionsSelectedTicker} Thumbnail" class="img-thumbnail">`;

        
        // Load and parse the JSON file for the selected ticker symbol
        loadJSONFile(predictionsSelectedTicker);
    });

    // Attach a click event listener to the predictButton
    const predictButton = document.getElementById("predictButton");
    predictButton.addEventListener("click", function () {
        // Check if jsonData is available
        if (jsonData) {
            // Parse the opening price input as a float
            const openingPriceInput = document.getElementById("openingPriceInput");
            const openingPrice = parseFloat(openingPriceInput.value);

            // Calculate the closing price prediction using Linear Regression formula
            const predictedClosingPrice = jsonData.intercept + jsonData.coef * openingPrice;

            // Display the prediction result in the "predictionResult" element
            const predictionResult = document.getElementById("predictionResult");
            predictionResult.textContent = `${predictedClosingPrice.toFixed(2)}`;
        } else {
            console.error("JSON data is not available. Please load the data first.");
        }
    });
});
