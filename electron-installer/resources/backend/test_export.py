import requests
import sys

try:
    response = requests.get('http://127.0.0.1:8000/api/invoices/export_csv/')
    print(f"Status Code: {response.status_code}")
    print(f"Headers: {response.headers}")
    if response.status_code != 200:
        print(f"Error Response: {response.text[:500]}")
    else:
        print("Success! CSV downloaded")
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
