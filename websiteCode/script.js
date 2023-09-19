document.addEventListener("DOMContentLoaded", function () {
    const tickerSelector = document.getElementById("tickerSelector");
    const newsContent = document.getElementById("news-content");
    const stockDataContent = document.getElementById("stock-data-content");
    const candlestickChartContainer = document.getElementById("candlestickChartContainer");
    const tickerImage = document.getElementById("tickerImage");

    let jsonData = null; 

    // Function to load and parse the JSON file for the selected ticker symbol
    function loadJSONFile(predictionsSelectedTicker) {
        const jsonFileName = `../machineLearning/josephsLNRexperiment/${predictionsSelectedTicker}_model_info.json`;

        fetch(jsonFileName)
            .then((response) => response.json())
            .then((data) => {
                if (data && data.ticker && data.intercept !== undefined && data.coef !== undefined) {
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

                    for (const timestamp in timeSeriesData) {
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
            .catch((error) => {
                console.error("Error fetching intraday data:", error);
            });
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

        // Define text based on the selected ticker
        let text = "";
        switch(predictionsSelectedTicker) {
            case "AAPL":
                text = `
                <pre style="color: white;">


                The training and validation 
                accuracy scores of our 3 models is:

                LogisticRegression:
                Training Accuracy: 0.5321559725277262
                Validation Accuracy: 0.5278904665314402
                
                SVC:
                Training Accuracy: 0.533309388603404
                Validation Accuracy: 0.4947388438133874
                
                XGBClassifier:
                Training Accuracy: 0.9617975919113765
                Validation Accuracy: 0.5347996957403651`;
                break;
            case "AMD":
                text = `<pre style="color: white;">


                The training and validation 
                accuracy scores of our 3 models is:

                LogisticRegression:
                Training Accuracy :  0.5123858688017979
                Validation Accuracy :  0.5599015834963094
                
                SVC:
                Training Accuracy :  0.4842666729097408
                Validation Accuracy :  0.43249637246861394

                
                XGBClassifier:
                Training Accuracy :  0.9235586302695447
                Validation Accuracy :  0.5212920320484512`;
                break;
            case "AMZN":
                text = `<pre style="color: white;">


                The training and validation 
                accuracy scores of our 3 models is:

                LogisticRegression:
                Training Accuracy :  0.5209906930717874
                Validation Accuracy :  0.5328575102880659              
                
                SVC:
                Training Accuracy :  0.4836377187378653
                Validation Accuracy :  0.5009002057613169                
              
                XGBClassifier:
                Training Accuracy :  0.9645560889607054
                Validation Accuracy :  0.5176826131687242`;
                break;
            case "CSCO":
                text = `<pre style="color: white;">


                The training and validation 
                accuracy scores of our 3 models is:

                LogisticRegression:
                Training Accuracy :  0.517419898371889
                Validation Accuracy :  0.5168610547667343                              
                
                SVC:
                Training Accuracy :  0.4971664995768098
                Validation Accuracy :  0.4851990365111562                               
                
                XGBClassifier:
                Training Accuracy :  0.921490019894624
                Validation Accuracy :  0.4806668356997971`;
                break;
            case "META":
                text = `<pre style="color: white;">


                The training and validation 
                accuracy scores of our 3 models is:

                LogisticRegression:
                Training Accuracy :  0.5418181547730888
                Validation Accuracy :  0.5128383506197824                              
                
                SVC:
                Training Accuracy :  0.5406277792391616
                Validation Accuracy :  0.5373134328358209                               
                
                XGBClassifier:
                Training Accuracy :  0.9477961024889456
                Validation Accuracy :  0.5576460915760182`;
                break;
            case "MSFT":
                text = `<pre style="color: white;">


                The training and validation 
                accuracy scores of our 3 models is:

                LogisticRegression:
                Training Accuracy :  0.5400376351657981
                Validation Accuracy :  0.4927104462474645                              
                
                SVC:
                Training Accuracy :  0.45707595887517016
                Validation Accuracy :  0.5067190669371197                               
                
                XGBClassifier:
                Training Accuracy :  0.9321757194497912
                Validation Accuracy :  0.5402827079107505`;
                break;
            case "NFLX":
                text = `<pre style="color: white;">


                The training and validation 
                accuracy scores of our 3 models is:

                LogisticRegression:
                Training Accuracy :  0.5336983575472309
                Validation Accuracy :  0.518733809313199                              
                
                SVC:
                Training Accuracy :  0.5318466835824229
                Validation Accuracy :  0.49804132179187466                               
                
                XGBClassifier:
                Training Accuracy :  0.9326997343929501
                Validation Accuracy :  0.5071081064004549`;
                break;
            case "QCOM":
                text = `<pre style="color: white;">


                The training and validation 
                accuracy scores of our 3 models is:

                LogisticRegression:
                Training Accuracy :  0.5203775954218742
                Validation Accuracy :  0.5455350366810018                              
                
                SVC:
                Training Accuracy :  0.5278050235684767
                Validation Accuracy :  0.5439855805717176                               
                
                XGBClassifier:
                Training Accuracy :  0.9408699095057961
                Validation Accuracy :  0.47514545914495315`;
                break;
            case "SBUX":
                text = `<pre style="color: white;">


                The training and validation 
                accuracy scores of our 3 models is:

                LogisticRegression:
                Training Accuracy :  0.5178261348430986
                Validation Accuracy :  0.4579107505070994                              
                
                SVC:
                Training Accuracy :  0.5282666991616147
                Validation Accuracy :  0.42450557809330625                               
                
                XGBClassifier:
                Training Accuracy :  0.9417317151474108
                Validation Accuracy :  0.4757543103448276`;
                break;
            case "TSLA":
                text = `<pre style="color: white;">


                The training and validation 
                accuracy scores of our 3 models is:

                LogisticRegression:
                Training Accuracy :  0.5140954819427772
                Validation Accuracy :  0.4810383032605255                              
                
                SVC:
                Training Accuracy :  0.4942828693977592
                Validation Accuracy :  0.5406141183918962                               
                
                XGBClassifier:
                Training Accuracy :  0.9371096094687875
                Validation Accuracy :  0.40443178220956`;
                break;
            default:
                text = "No information available for this ticker.";
        }

        // Display the text next to the ticker image
        tickerText.innerHTML = text;

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
