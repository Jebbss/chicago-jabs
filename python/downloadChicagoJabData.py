import requests
import json

def downloadChicagoJabData():
    response = requests.get('https://data.cityofchicago.org/resource/2vhs-cf6b.json')
    jsonBody = response.json()
    # The order of the response occasionally gets reversed
    if("2020" in jsonBody[0]["date"]):
        jsonBody.reverse()
    with open('chicago-jab-data.json', 'w') as f:
        json.dump(jsonBody, f)

if __name__ == "__main__":
    downloadChicagoJabData()