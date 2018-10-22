function buildMetadata(wines) {
  // @TODO: Complete the following function that builds the metadata panel
  // Use `d3.json` to fetch the metadata for a sample
  var url = `/metadata/${wines}`;
  // Use d3 to select the panel with id of `#sample-metadata`
  d3.json(url).then(function (wines) {
    var sample_metadata = d3.select("#sample-metadata");
    // Use `.html("") to clear any existing metadata
    sample_metadata.html("");
    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(wines).forEach(function ([key, value]) {
      var row = sample_metadata.append("p");
      row.text(`${key}: ${value}`);
      //console.log(wines)
    });
  });
};
function buildCharts(province) {

  var url = `/samples/${province}`;

  d3.json(url).then(function (data) {
    // var xLength = [];
    // var provinceLength = data.Provinces;
    // for (i = 0; i < provinceLength.length; i++) {
    //   xLength.push(i)
    // };
    var bubX = data.Points;
    var bubY = data.Prices;
    var rawCount = data.Count;
    var allProvinces = data.Provinces;
    
    var adjCount = data.Count.map(function (e) {
      e = Math.log1p(e) * 2;
      return e;
    });
    var m_size = adjCount;
    // console.log(m_size)
    var color = rawCount.map(function (x) {
      y = getColor(x);
      return y;
    });
    console.log(color)
 
    arrProvinceCounts = []
    for (i=0; i < allProvinces.length; i++){
      arrProvinceCounts.push({Province: allProvinces[i], Count: rawCount[i], Avg_Rating: bubX[i].toFixed(2), Avg_Price: bubY[i].toFixed(2)})
    };
    
    
    
    var textValue = arrProvinceCounts.map(province => `${province.Province} <br>No. of Wineries: ${province.Count}<br>Avg Rating ${province.Avg_Rating}<br>Avg Price ${province.Avg_Price}`);

    var trace1 = {
      x: bubX,
      y: bubY,
      hovertext: textValue,
      hoverinfo: "text",
      mode: 'markers',
      marker: {
        size: m_size,
        sizeref: .67,
        sizemin: 1,
        color: rawCount,
        showscale: true,
        colorscale: "Rainbow"
      }
    };
    var data = [trace1];

    var layout = {
      title: 'Average Price and Point by Province',
      yaxis: {
        "title": "Average Price",
        range: [0, 100]
      },
      xaxis: {
        tickangle: 35,
        range: [82, 94]
      },
      hovermode: 'closest',
      autosize: false,
      showlegend: false,
      width: 940,
      height: 600,
      margin: {
        l: 50,
        r: 50,
        b: 100,
        t: 100,
        pad: 4
      },
      paper_bgcolor: '#E1C56C',
      plot_bgcolor: '#FFFFFF'
    };
    Plotly.newPlot('bubble', data, layout, {responsive: true}, );
  });

};

function optionChanged(newProvince) {
  // Fetch new data each time a new sample is selected
  buildCharts(newProvince);
  buildMetadata(newProvince);
};

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
};

function getColor(d) {
  return d > 2000 ? '#0000FF' :
      d > 1500 ? '#41D429' :
          d > 500 ? '#FFF300' :
              d > 250 ? '#FF8300' :
                  d > 100 ? '#FF0000' :
                      '#000000';
}

// Initialize the dashboard
init();
