import pandas as pd
import numpy as np
import os
def calculateHistorical7DayRollingMeanJabs():
    fieldsOfInterest = ['total_doses_daily', 'date', 'daily_doses_rolling', 'days_to_complete']
    jsonFileNamePath = 'chicago-jab-data.json'
    if(not os.path.isfile(jsonFileNamePath)):
        print('oops')
        return
    df = pd.read_json(jsonFileNamePath)
    df = df.reindex(index=df.index[::-1])

    df['daily_doses_rolling'] = df['total_doses_daily'].rolling(7).mean().values.round().astype(int)

    df['days_to_complete'] = (4310362 - df['total_doses_cumulative']) / df['daily_doses_rolling']
    df['days_to_complete'] = df['days_to_complete'].values.round().astype(int)

    df['date'] = df['date'].dt.strftime('%m-%d-%Y')

    df = df[fieldsOfInterest]
    df = df.reindex(index=df.index[::-1])
    df = df[df.select_dtypes(include=[np.number]).ge(0).all(1)]
    df.to_json(path_or_buf='rolling-mean.json', orient='records')

if __name__ == "__main__":
    calculateHistorical7DayRollingMeanJabs()