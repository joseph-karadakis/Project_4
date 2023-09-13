document.addEventListener("DOMContentLoaded", function () {
    // Handle the Stock Summary tab
    const tickerSelector = document.getElementById("tickerSelector");
    const newsContent = document.getElementById("news-content");
    const stockDataContent = document.getElementById("stock-data-content"); // Updated variable name

    // Listen for changes in the tickerSelector
    tickerSelector.addEventListener("change", function () {
        const selectedTicker = this.value;
        fetchNews(selectedTicker);
        fetchStockData(selectedTicker); // Call the function to fetch stock data
    });

    // Fetch and display news for the default ticker (AAPL)
    fetchNews(tickerSelector.value);

    // Function to fetch and display news content
    function fetchNews(selectedTicker) {
        // Replace 'YOUR_API_KEY' with your actual Alpha Vantage API key
        const apiKey = '7IWYGE8ECV7Q03TY';

        // Define the API URL for news sentiment
        const apiUrl = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${selectedTicker}&apikey=${apiKey}`;

        // Clear previous news content
        newsContent.innerHTML = '<div class="text-center">Loading news...</div>';

        // Fetch data from the API
        fetch(apiUrl)
            .then((response) => response.json())
            .then((data) => {
                // Clear the loading message
                newsContent.innerHTML = '';

                if (data.feed && data.feed.length > 0) {
                    // Create a list of news articles
                    const newsList = document.createElement('ul');
                    newsList.classList.add('list-group');

                    data.feed.forEach((article) => {
                        const listItem = document.createElement('li');
                        listItem.classList.add('list-group-item');
                        const articleDate = new Date(article.time_published.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6Z'));
                        listItem.innerHTML = `
                            <h5>${article.title}</h5>
                            <p>${article.summary}</p>
                            <small>${articleDate.toLocaleString()}</small>
                            <a href="${article.url}" target="_blank" class="btn btn-primary btn-sm float-right">Read More</a>
                        `;
                        newsList.appendChild(listItem);
                    });

                    // Append the news list to the newsContent div
                    newsContent.appendChild(newsList);
                } else {
                    // If no news articles are found
                    newsContent.innerHTML = '<div class="text-center">No news articles available.</div>';
                }
            })
            .catch((error) => {
                console.error('Error fetching news:', error);
                // Display an error message if the API request fails
                newsContent.innerHTML = '<div class="text-center text-danger">Error fetching news. Please try again later.</div>';
            });
    }

    // Function to fetch and display stock data
    function fetchStockData(selectedTicker) {
        // Replace 'YOUR_API_KEY' with your actual Alpha Vantage API key
        const apiKey = '7IWYGE8ECV7Q03TY';

        // Define the API URL for global quote data
        const stockApiUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${selectedTicker}&apikey=${apiKey}`;

        // Clear previous stock data content
        stockDataContent.innerHTML = '<div class="text-center">Loading stock data...</div>';

        // Fetch stock data from the API
        fetch(stockApiUrl)
            .then((response) => response.json())
            .then((data) => {
                // Clear the loading message
                stockDataContent.innerHTML = '';

                if (data["Global Quote"]) {
                    // Extract and display global quote data
                    const globalQuoteData = data["Global Quote"];
                    const stockDataList = document.createElement('ul');
                    stockDataList.classList.add('list-group');

                    for (const key in globalQuoteData) {
                        if (globalQuoteData.hasOwnProperty(key)) {
                            const listItem = document.createElement('li');
                            listItem.classList.add('list-group-item');
                            listItem.innerHTML = `<strong>${key}:</strong> ${globalQuoteData[key]}`;
                            stockDataList.appendChild(listItem);
                        }
                    }

                    // Append the stock data list to the stockDataContent div
                    stockDataContent.appendChild(stockDataList);
                } else {
                    // If no stock data is found
                    stockDataContent.innerHTML = '<div class="text-center">No stock data available.</div>';
                }
            })
            .catch((error) => {
                console.error('Error fetching stock data:', error);
                // Display an error message if the API request fails
                stockDataContent.innerHTML = '<div class="text-center text-danger">Error fetching stock data. Please try again later.</div>';
            });
    }
});
