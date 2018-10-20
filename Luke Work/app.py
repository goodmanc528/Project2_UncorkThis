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
provinces = Base.classes.provinces
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
    """Return a list of province names."""

    # Use Pandas to perform the sql query
    stmt = db.session.query(provinces).statement
    df = pd.read_sql_query(stmt, db.session.bind)

    provinceVar = (df["province"].tolist())
    print(provinceVar)
    return jsonify(provinceVar)


@app.route("/metadata/<province>")
def sample_metadata(province):

    sql_cmd = sqlalchemy.text('''
    SELECT avg(wines.price) as averageprice, avg(wines.points) as points, provinces.province as province
    FROM wines INNER JOIN provinces
    ON wines.province_id = provinces.id
    WHERE provinces.province = "{}"
    GROUP BY province    
    '''.format(province))

    results = db.engine.execute(sql_cmd).fetchall()

    # Create a dictionary entry for each row of metadata information
    sample_metadata = {}
    for result in results:
        sample_metadata["Province"] = result[2]
        sample_metadata["Average Price"] = "$" + f"{result[0]:.2f}"
        sample_metadata["Average Rating in Points"] = f"{result[1]:.0f}"
    print(sample_metadata)
    return jsonify(sample_metadata)


@app.route("/samples/<wines>")
def samples(wines):

    sql_cmd = sqlalchemy.text('''
    SELECT avg(wines.price) as averageprice, avg(wines.points) as points, provinces.province as province
    FROM wines INNER JOIN provinces
    ON wines.province_id = provinces.id
    WHERE provinces.province = "{}"
    GROUP BY province    
    '''.format(wines))

    results = db.engine.execute(sql_cmd).fetchall()

    # sample_data = df.loc[df[wines] > 1, ["Prices", "Points", wines]]
    data = {
        "Prices": results.price.values.tolist(),
        "Provinces": results[wines].values.tolist(),
        "Points": results.points.tolist(),
    }
    print(results)
    return jsonify(data)

if __name__ == "__main__":
    app.run(debug=True)
