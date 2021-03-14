import pandas as pd
import numpy as np
import os

def findDayWithMostDoses(df):
    data = df[df.total_doses_daily == df['total_doses_daily'].max()]
    data = data[['total_doses_daily', 'date']]
    data['date'] = data['date'].dt.strftime('%m-%d-%Y')
    data.to_json(path_or_buf='record-jab-day.json', orient='records')

def seriesCompletedCalculation():
    neededSeriesCompleted = 2693976
    fieldsOfInterest = ['days_to_complete', 'daily_series_completed_rolling', 'date']
    jsonFileNamePath = 'chicago-jab-data.json'
    if(not os.path.isfile(jsonFileNamePath)):
        print('oops')
        return
    df = pd.read_json(jsonFileNamePath)
    df = df.reindex(index=df.index[::-1])
    findDayWithMostDoses(df)
    df['daily_series_completed_rolling'] = df['vaccine_series_completed_daily'].rolling(7).mean().values.round().astype(int)

    df['days_to_complete'] = (neededSeriesCompleted - df['vaccine_series_completed_cumulative']) / df['daily_series_completed_rolling']
    df['days_to_complete'] = df['days_to_complete'].values.round().astype(int)

    df['date'] = df['date'].dt.strftime('%m-%d-%Y')

    df = df[fieldsOfInterest]
    df = df.reindex(index=df.index[::-1])
    df = df[df.select_dtypes(include=[np.number]).ge(0).all(1)]
    df.to_json(path_or_buf='series-rolling-mean.json', orient='records')

if __name__ == "__main__":
    seriesCompletedCalculation()