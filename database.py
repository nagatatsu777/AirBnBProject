import pyodbc
from dotenv import load_dotenv
import os;
import pandas as pd
load_dotenv()


def connect_database():
    connectionString = f'DRIVER={{ODBC Driver 18 for SQL Server}};SERVER={os.environ["SERVER"]};DATABASE={os.environ["DATABASE"]};UID={os.environ["USERNAME"]};PWD={os.environ["PASSWORD"]}'
    conn = pyodbc.connect(connectionString, timeout=3) 
    conn.setdecoding(pyodbc.SQL_CHAR, encoding='utf-8')
    conn.setdecoding(pyodbc.SQL_WCHAR, encoding='utf-8')
    conn.setencoding(encoding='utf-8')
    cursor = conn.cursor()
    return cursor
def upload_to_database(cursor):
    data = pd.read_csv('airbnb.csv',sep=",")
    #RoomID,PropertyName,HostName,HostId,Price,Star,ReviewNumber,DatesAvailable,Amenities
    for index, row in data.iterrows():
        cursor.execute(
            f"INSERT INTO Property (RoomID, PropertyName, HostName, HostId, Price, Star, ReviewNumber, AvailableDates, Amenities) "
            f"VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                row["RoomID"],
                row["PropertyName"],
                row["HostName"],
                row["HostId"],
                float(row["Price"]),
                float(row["Star"]),
                int(row["ReviewNumber"]),
                row['AvailableDates'],
                row["Amenities"],
            ),
        )
        cursor.commit()
    print("Success")
    return
def main():
    cursor = connect_database()
    upload_to_database(cursor)
main()

