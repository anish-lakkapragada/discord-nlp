# fck this bug

# %%
import requests

URL = "https://f955-150-230-44-145.jp.ngrok.io"
#%%

with open("ML_CLUB_GENERAL.txt", "r") as f:
    text = f.read()

import json

data = json.loads(text)
data["messagesAveraging"] = 200
data["title"] = "Generic Title"

r = requests.get(URL)
assert r.status_code == 200

r = requests.post(f"{URL}/senti", json=data, timeout=20 * 60)
print(r)

# %%
