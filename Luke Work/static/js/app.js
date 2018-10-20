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
      console.log(wines)
    });
  });
};
function buildCharts(province) {

  var url = `/samples/${province}`;

  d3.json(url).then(function (data) {
    var xLength = [];
    var provinceLength = data.Provinces;
    for (i = 0; i < provinceLength.length; i++) {
      xLength.push(i)
    };
    var bubX = data.Points;
    var bubY = data.Prices;
    var adjCount = data.Count.map(function (e) {
      e = Math.log1p(e) * 2;
      return e;
    });
    var m_size = adjCount;

    var textValue = data.Provinces;

    var trace1 = {
      x: bubX,
      y: bubY,
      text: textValue,
      mode: 'markers',
      marker: {
        size: m_size,
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
      },
      hovermode: 'closest',
      autosize: false,
      showlegend: false,
      width: 1200,
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
    Plotly.newPlot('bubble', data, layout);
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

// Initialize the dashboard
init();
