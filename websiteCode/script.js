document.addEventListener("DOMContentLoaded", function () {
    // Handle the Stock Summary tab
    const tickerSelector = document.getElementById("tickerSelector");
    const newsContent = document.getElementById("news-content");
    const stockChartContent = document.getElementById("stock-chart-content"); // Add this line

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

        // Define the API URL
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

        // Define the API URL for stock data
        const stockApiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${selectedTicker}&apikey=${apiKey}`;

        // Clear previous stock chart
        stockChartContent.innerHTML = '<div class="text-center">Loading stock data...</div>';

        // Fetch stock data from the API
        fetch(stockApiUrl)
            .then((response) => response.json())
            .then((data) => {
                // Clear the loading message
                stockChartContent.innerHTML = '';

                if (data["Time Series (Daily)"]) {
                    // Extract date labels and closing prices
                    const dates = Object.keys(data["Time Series (Daily)"]).reverse();
                    const closingPrices = dates.map((date) => parseFloat(data["Time Series (Daily)"][date]["4. close"]));

                    // Create a line chart
                    const ctx = document.createElement("canvas");
                    stockChartContent.appendChild(ctx);

                    new Chart(ctx, {
                        type: "line",
                        data: {
                            labels: dates,
                            datasets: [
                                {
                                    label: `${selectedTicker} Closing Prices`,
                                    data: closingPrices,
                                    borderColor: "blue",
                                    borderWidth: 2,
                                    fill: false,
                                },
                            ],
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                x: {
                                    type: "time",
                                    time: {
                                        unit: "day",
                                        displayFormats: {
                                            day: "MMM D",
                                        },
                                    },
                                    title: {
                                        display: true,
                                        text: "Date",
                                    },
                                },
                                y: {
                                    title: {
                                        display: true,
                                        text: "Closing Price",
                                    },
                                },
                            },
                        },
                    });
                } else {
                    // If no stock data is found
                    stockChartContent.innerHTML = '<div class="text-center">No stock data available.</div>';
                }
            })
            .catch((error) => {
                console.error('Error fetching stock data:', error);
                // Display an error message if the API request fails
                stockChartContent.innerHTML = '<div class="text-center text-danger">Error fetching stock data. Please try again later.</div>';
            });
    }
});
