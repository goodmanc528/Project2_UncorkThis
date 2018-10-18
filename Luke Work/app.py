import os

import pandas as pd
import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

from flask import Flask, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)


#################################################
# Database Setup
#################################################

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db/winetasting.sqlite"
db = SQLAlchemy(app)

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(db.engine, reflect=True)

# Save references to each table
countries = Base.classes.countries
provinces = Base.classes.provinces
wineries = Base.classes.wineries
wines = Base.classes.wines


@app.route("/")
def index():
    """Return the homepage."""
    return render_template("index.html")


@app.route("/map")
def map():
    """Return the homepage."""
    return render_template("map.html")


@app.route("/names")
def names():
    """Return a list of sample names."""
    print("Names is working")
    # Use Pandas to perform the sql query
    stmt = db.session.query(provinces).statement
    df = pd.read_sql_query(stmt, db.session.bind)
    print(df)
    # Return a list of the column names (sample names)
    provinceVar = (df["province"].tolist())
    return jsonify(provinceVar)


@app.route("/wineries/<id>")
def sample_metadata(sample):

    sql_cmd = sqlalchemy.text('''
    SELECT wineries.winery, wines.title
    FROM wineries INNER JOIN wines 
    ON wines.winery_id = wineries.id
    ''')
    results = db.execute(sql_cmd).fetchall()
    print(results)

    # """Return the MetaData for a given sample."""
    results = [
        wineries.winery,
        wineries.country_id,
        wineries.province_id,
        wines.winery_id,
        wines.title,
        wines.variety,
        wines.price,
        wines.points,
    ]
    # Create a dictionary entry for each row of metadata information
    sample_metadata = {}
    for result in results:
        sample_metadata["Winery"] = result[1]
        sample_metadata["Country ID"] = result[2]
        sample_metadata["Province ID"] = result[3]
        sample_metadata["Winery ID"] = result[4]
        sample_metadata["Title"] = result[5]
        sample_metadata["Variety"] = result[6]
        sample_metadata["Price"] = result[7]
        sample_metadata["Points"] = result[8]

    print(sample_metadata)
    return jsonify(sample_metadata)


# @app.route("/samples/<sample>")
# def samples(sample):
#     """Return `otu_ids`, `otu_labels`,and `sample_values`."""
#     stmt = db.session.query(Samples).statement
#     df = pd.read_sql_query(stmt, db.session.bind)

#     # Filter the data based on the sample number and
#     # only keep rows with values above 1
#     sample_data = df.loc[df[sample] > 1, ["otu_id", "otu_label", sample]]
#     # Format the data to send as json
#     data = {
#         "otu_ids": sample_data.otu_id.values.tolist(),
#         "sample_values": sample_data[sample].values.tolist(),
#         "otu_labels": sample_data.otu_label.tolist(),
#     }
#     return jsonify(data)

if __name__ == "__main__":
    app.run(debug=True)
