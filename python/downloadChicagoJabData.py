import requests
import json

def downloadChicagoJabData():
    response = requests.get('https://data.cityofchicago.org/resource/2vhs-cf6b.json')
    with open('chicago-jab-data.json', 'w') as f:
        json.dump(response.json(), f)

if __name__ == "__main__":
    downloadChicagoJabData()