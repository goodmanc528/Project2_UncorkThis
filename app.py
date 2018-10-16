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
Countries = Base.classes.countries
Provinces = Base.classes.provinces
Wineries = Base.classes.wineries
Wines = Base.classes.wines

@app.route("/")
def index():
    """Return the homepage."""
    return render_template("index.html")


@app.route("/provinces")
def names():
    """Return a list of sample names."""

    # Use Pandas to perform the sql query
    stmt = db.session.query(Wineries).statement
    df = pd.read_sql_query(stmt, db.session.bind)

    # Return a list of the column names (sample names)
    return jsonify(list(df.rows)[1:])


@app.route("/wineries/<winery>")
def sample_metadata(winery):
    """Return the MetaData for a given sample."""
    sel = [
        Wineries.ID,
        Wineries.winery,
        Wineries.country_id,
        Wineries.province_id,


    ]

    results = db.session.query(*sel).filter(Wineries.winery == winery).all()

    # Create a dictionary entry for each row of metadata information
    sample_metadata = {}
    for result in results:
        sample_metadata["Winery"] = result[1]
        sample_metadata["Country ID"] = result[2]
        sample_metadata["Province ID"] = result[3]

    print(sample_metadata)
    return jsonify(sample_metadata)

@app.route("")

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

# if __name__ == "__main__":
#     app.run()
