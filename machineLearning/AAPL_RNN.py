# %%
# Import the modules
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from keras.models import Sequential
from keras.layers import Dense, LSTM
from keras.layers import Dropout
import tensorflow as tf 

# %%
# Read the csv file and clean the data
stock_data = pd.read_csv('Resources/data.csv')
stock_data['Date'] = pd.to_datetime(stock_data['Date'], errors='coerce')
price_columns = ['Close/Last', 'Open', 'High', 'Low']
for column in price_columns:
    stock_data[column] = stock_data[column].str.replace('$', '').astype(float)
appl_data = stock_data[stock_data['Company'] == 'AAPL']
appl_data = appl_data.sort_values(by="Date")
appl_data.head()


# %%
appl_csv = appl_data.to_csv(index=True)

# %%
from pathlib import Path 
filepath = Path('Proj_4/Resources/appl_csv.csv')
filepath.parent.mkdir(parents=True, exist_ok=True) 
appl_data.to_csv(filepath)

# %%
# Plotting the close price history
plt.figure(figsize=(16,6))
plt.title('Apple Close Price History')
plt.plot(appl_data['Date'], appl_data['Close/Last'])
plt.xlabel('Date', fontsize=18)
plt.ylabel('Close Price USD ($)', fontsize=18)
plt.show()

# %%
appl_data.isna().any()

# %%
# Split training and testing datasets

df_test = appl_data.tail(40)
appl_df = appl_data[40:]

# %%
# Moving average

appl_df['Open'].plot(figsize=(16, 6))
appl_df.rolling(100).mean()['Open'].plot()

# %%
training_df = appl_df['Open']
training_df = pd.DataFrame(training_df)
training_df

# %%
# Feature scaling

from sklearn.preprocessing import MinMaxScaler
sc = MinMaxScaler(feature_range = (0,1))
training_df_scaled = sc.fit_transform(training_df)

# %%
# Create structure with 60 timesteps and 1 output

X_train = []
y_train = []
for i in range(60, 2476):
    X_train.append(training_df_scaled[i-60:i, 0])
    y_train.append(training_df_scaled[i, 0])
X_train, y_train = np.array(X_train), np.array(y_train)



# Reshape

X_train = np.reshape(X_train, (X_train.shape[0], X_train.shape[1], 1))
X_train


# %%
# Initialize RNN

regressor = Sequential()

# %%
# First LSTM layer

regressor.add(LSTM(units = 50, return_sequences = True, input_shape = (X_train.shape[1], 1)))
regressor.add(Dropout(0.2))


# Second LSTM layer

regressor.add(LSTM(units = 50, return_sequences = True))
regressor.add(Dropout(0.2))


# Third LSTM layer

regressor.add(LSTM(units = 50, return_sequences = True))
regressor.add(Dropout(0.2))


# Fourth LSTM layer

regressor.add(LSTM(units = 50))
regressor.add(Dropout(0.2))

              
# Output layer

regressor.add(Dense(units = 1))

# %%
# Compile RNN

regressor.compile(optimizer = 'adam', loss = 'mean_squared_error')


# Fit RNN

regressor.fit(X_train, y_train, epochs = 100, batch_size = 32)

# %%
real_stock_price = df_test['Open'].values
real_stock_price

# %%
df_total = pd.concat((appl_df['Open'], df_test['Open']), axis = 0)
inputs = df_total[len(df_total) - len(df_test) - 60:].values
inputs = inputs.reshape(-1,1)
inputs = sc.transform(inputs)
X_test = []
for i in range(60, 100):
    X_test.append(inputs[i-60:i, 0])
X_test = np.array(X_test)
X_test = np.reshape(X_test, (X_test.shape[0], X_test.shape[1], 1))

predicted_stock_price = regressor.predict(X_test)
predicted_stock_price = sc.inverse_transform(predicted_stock_price)

# %%
predicted_stock_price = pd.DataFrame(predicted_stock_price)
predicted_stock_price = predicted_stock_price.values
predicted_stock_price

# %%
real_stock_price

# %%
# Plot the results

plt.plot(real_stock_price, color = 'red', label = 'Real Apple Stock Price')
plt.plot(predicted_stock_price, color = 'blue', label = 'Predicted Apple Stock Price')
plt.title('Apple Stock Price Prediction')
plt.xlabel('Time')
plt.ylabel('Stock Price')
plt.legend()
plt.show()

