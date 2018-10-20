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
    """Show the interactive map."""
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


@app.route("/wines")
def wine_data():
    # blocker
    sql_cmd = sqlalchemy.text('''
    SELECT wines.title, wines.points, wines.price, provinces.pro_lon, provinces.pro_lat
    FROM wines INNER JOIN provinces
    ON wines.province_id = provinces.id  
    ''')
    # results = db.session.query(*sql_cmd).filter(wines.province_id == province).all()
    results = db.engine.execute(sql_cmd).fetchall()

    # Create a dictionary entry for each row of metadata information
    wines = []
    for result in results:
        wines.append({"name": result[0],
                      "price": result[2],
                      "rating": result[1],
                      "lat": result[4],
                      "lon": result[3]
                      })
    return jsonify(wines)


@app.route("/samples/<province>")
def samples(province):

    sql_cmd = sqlalchemy.text('''
    SELECT avg(wines.price) as averageprice, avg(wines.points) as points, provinces.province as province
    FROM wines INNER JOIN provinces
    ON wines.province_id = provinces.id
    GROUP BY province
    ''')

    df = pd.read_sql_query(sql_cmd, db.session.bind)

    data = {
        "Prices": df["averageprice"].values.tolist(),
        "Provinces": df["province"].values.tolist(),
        "Points": df["points"].values.tolist(),
    }
    print(data)
    return jsonify(data)


if __name__ == "__main__":
    app.run(debug=True)
