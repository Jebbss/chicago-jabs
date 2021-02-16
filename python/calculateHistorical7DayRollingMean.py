import pandas as pd
import os
def calculateHistorical7DayRollingMeanJabs():
    fieldsOfInterest = ['total_doses_daily', 'date', 'daily_doses_rolling']
    jsonFileNamePath = 'chicago-jab-data.json'
    if(not os.path.isfile(jsonFileNamePath)):
        print('oops')
        return
    df = pd.read_json(jsonFileNamePath)
    df = df.reindex(index=df.index[::-1])
    df['daily_doses_rolling'] = df['total_doses_daily'].rolling(7).mean()
    df = df[fieldsOfInterest]
    df = df.reindex(index=df.index[::-1])
    df.to_json(path_or_buf='rolling-mean.json', orient='records')

if __name__ == "__main__":
    calculateHistorical7DayRollingMeanJabs()