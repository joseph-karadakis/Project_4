from flask import Flask, render_template
from config import api_key

app = Flask(__name__)

# List of symbols to fetch data for
symbols = ['AAPL', 'SBUX', 'MSFT', 'CSCO', 'QCOM', 'META', 'AMZN', 'TSLA', 'AMD', 'NFLX']

@app.route('/')
def index():
    return render_template('stock_summary_index.html', symbols=symbols, api_key=api_key)

if __name__ == '__main__':
    app.run(debug=True)
