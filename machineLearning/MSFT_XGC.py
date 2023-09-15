# %%
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
msft_data = stock_data[stock_data['Company'] == 'MSFT']
msft_data = msft_data.sort_values(by="Date")
msft_data.head()

# %%
# Plotting the close price history
plt.figure(figsize=(16,6))
plt.title('Starbucks Open Price History')
plt.plot(msft_data['Date'], msft_data['Open'])
plt.xlabel('Date', fontsize=18)
plt.ylabel('Open Price USD ($)', fontsize=18)
plt.show()

# %%
msft_data.isna().any()

# %%
msft_data.tail(10)

# %%
msft_data.describe()

# %%
msft_data.info()

# %%
msft_data.isnull().sum()

# %%
# Split training and testing datasets

df_test = msft_data.tail(40)
msft_df = msft_data.iloc[::-1]

# %%
msft_df['Open'].mean()


# %%
import seaborn as sb
features = ['Open', 'High', 'Low', 'Close/Last', 'Volume']
 
plt.subplots(figsize=(20,10))
 
for i, col in enumerate(features):
  plt.subplot(2,3,i+1)
  sb.distplot(msft_data[col])
plt.show()

# %%
msft_data.describe()

# %%
msft_data

# %%
plt.subplots(figsize=(20,10))
for i, col in enumerate(features):
  plt.subplot(2,3,i+1)
  sb.boxplot(msft_data[col])
plt.show()

# %%
msft_data["Date"] = msft_data["Date"].astype(str) 
splitted = msft_data['Date'].str.split('-', expand=True)
 
msft_data['day'] = splitted[2].astype('int')
msft_data['month'] = splitted[1].astype('int')
msft_data['year'] = splitted[0].astype('int')
 
msft_data.head()

# %%
msft_data.tail(5)

# %%
msft_data.isnull().sum()

# %%
msft_data['is_quarter_end'] = np.where(msft_data['month']%3==0,1,0)
msft_data.head()

# %%
data_grouped = msft_data.groupby('year').mean()
plt.subplots(figsize=(20,10))
 
for i, col in enumerate(['Open', 'High', 'Low', 'Close/Last']):
  plt.subplot(2,2,i+1)
  data_grouped[col].plot.bar()
plt.show()

# %%
msft_data.groupby('is_quarter_end').mean()

# %%
msft_data['open-close']  = msft_data['Open'] - msft_data['Close/Last']
msft_data['low-high']  = msft_data['Low'] - msft_data['High']
msft_data['target'] = np.where(msft_data['Close/Last'].shift(-1) > msft_data['Close/Last'], 1, 0)

# %%
plt.figure(figsize=(10, 10))
 
# As our concern is with the highly
# correlated features only so, we will visualize
# our heatmap as per that criteria only.
sb.heatmap(msft_data.corr() > 0.9, annot=True, cbar=False)
plt.show()

# %%
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
features = msft_data[['open-close', 'low-high', 'is_quarter_end']]
target = msft_data['target']
 
scaler = StandardScaler()
features = scaler.fit_transform(features)
 
X_train, X_valid, Y_train, Y_valid = train_test_split(
    features, target, test_size=0.1, random_state=2022)
print(X_train.shape, X_valid.shape)

# %%
from xgboost import XGBClassifier
from sklearn.linear_model import LogisticRegression
from sklearn import metrics
from sklearn.svm import SVC

# %%
models = [LogisticRegression(), SVC(
  kernel='poly', probability=True), XGBClassifier()]
 
for i in range(3):
  models[i].fit(X_train, Y_train)
 
  print(f'{models[i]} : ')
  print('Training Accuracy : ', metrics.roc_auc_score(
    Y_train, models[i].predict_proba(X_train)[:,1]))
  print('Validation Accuracy : ', metrics.roc_auc_score(
    Y_valid, models[i].predict_proba(X_valid)[:,1]))
  print()

# %%
