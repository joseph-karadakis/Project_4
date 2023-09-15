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

# %%
# Read the csv file and clean the data
stock_data = pd.read_csv('Resources/data.csv')
stock_data['Date'] = pd.to_datetime(stock_data['Date'], errors='coerce')
price_columns = ['Close/Last', 'Open', 'High', 'Low']
for column in price_columns:
    stock_data[column] = stock_data[column].str.replace('$', '').astype(float)
QCOM_data = stock_data[stock_data['Company'] == 'QCOM']
QCOM_data = QCOM_data.sort_values(by="Date")
QCOM_data.head()


# %%

# %%
# Plotting the close price history
plt.figure(figsize=(16,6))
plt.title('Starbucks Open Price History')
plt.plot(QCOM_data['Date'], QCOM_data['Open'])
plt.xlabel('Date', fontsize=18)
plt.ylabel('Open Price USD ($)', fontsize=18)
plt.show()


# %%

# %%
QCOM_data.isna().any()


# %%

# %%
QCOM_data.tail(10)


# %%

# %%
# Split training and testing datasets

df_test = QCOM_data.tail(40)
QCOM_df = QCOM_data.iloc[::-1]

# %%
QCOM_df['Open'].mean()


# %%

# %%
# Moving average

QCOM_df['Open'].plot(figsize=(16, 6))
QCOM_df.rolling(100).mean()['Open'].plot()

# %%
training_df = QCOM_df['Open']
training_df = pd.DataFrame(training_df)
training_df


# %%

# %%
# Feature scaling

from sklearn.preprocessing import MinMaxScaler
sc = MinMaxScaler(feature_range = (0,1))
training_df_scaled = sc.fit_transform(training_df)


# %%

# %%
# Create structure with 60 timesteps and 1 output

X_train = []
y_train = []
for i in range(60, 2476):
    X_train.append(training_df_scaled[i-60:i, 0])
    y_train.append(training_df_scaled[i, 0])
X_train, y_train = np.array(X_train), np.array(y_train)




# %%

# Reshape

X_train = np.reshape(X_train, (X_train.shape[0], X_train.shape[1], 1))


# %%

# %%
# Initialize RNN

regressor = Sequential()


# %%

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

# %%
# Compile RNN

regressor.compile(optimizer = 'adam', loss = 'mean_squared_error')



# %%

# Fit RNN

regressor.fit(X_train, y_train, epochs = 100, batch_size = 32)

# %%
real_stock_price = df_test['Open'].values
real_stock_price

# %%
df_total = pd.concat((QCOM_df['Open'], df_test['Open']), axis = 0)
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

# %%
predicted_stock_price = pd.DataFrame(predicted_stock_price)
predicted_stock_price = predicted_stock_price.values
predicted_stock_price


# %%

# %%
real_stock_price


# %%

# %%
# Plot the results

plt.plot(real_stock_price, color = 'red', label = 'Real Starbucks Stock Price')
plt.plot(predicted_stock_price, color = 'blue', label = 'Predicted Starbucks Stock Price')
plt.title('Starbucks Stock Price Prediction')
plt.xlabel('Time')
plt.ylabel('Stock Price')
plt.legend()
plt.show()


# %%

# %% [markdown]
# # # Building a validation model for testing
# 

# %%
# Extract the test data
QCOM_data_copy = QCOM_data.copy()
df_test = QCOM_data_copy.tail(40)

# Remove the test data from QCOM_data for further partitioning
QCOM_data_copy = QCOM_data_copy[:-40]


# %%

# Calculate the training data size (80% of the remaining data)
train_size = int(0.8 * len(QCOM_data_copy))


# %%

# Split the data into training and validation sets
train_data = QCOM_data_copy[:train_size]
val_data = QCOM_data_copy[train_size:]


# %%
sc = MinMaxScaler(feature_range = (0,1))
training_scaled = sc.fit_transform(train_data[['Open']])
val_scaled = sc.transform(val_data[['Open']])


# %%

# %%
# Create validation sequences
X_val = []
y_val = []
for i in range(60, len(val_data)):
    X_val.append(val_scaled[i-60:i, 0])
    y_val.append(val_scaled[i, 0])
X_val, y_val = np.array(X_val), np.array(y_val)
X_val = np.reshape(X_val, (X_val.shape[0], X_val.shape[1], 1))



# %%

# %%
# Fit the model and monitor validation loss
history = regressor.fit(X_train, y_train, epochs=100, batch_size=32, validation_data=(X_val, y_val))



# %%

# %%
# Plot training loss and validation loss
plt.plot(history.history['loss'], label='Training loss')
plt.plot(history.history['val_loss'], label='Validation loss')
plt.legend()
plt.show()

# Evaluate model's MSE on validation data
mse = regressor.evaluate(X_val, y_val)
print(f"Validation MSE: {mse}")



