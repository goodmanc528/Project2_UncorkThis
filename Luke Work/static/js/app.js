function buildMetadata(wines) {
  // @TODO: Complete the following function that builds the metadata panel
  // Use `d3.json` to fetch the metadata for a sample
  var url = `/metadata/${wines}`;
    // Use d3 to select the panel with id of `#sample-metadata`
    d3.json(url).then(function(wines) {
      var sample_metadata = d3.select("#sample-metadata");
    // Use `.html("") to clear any existing metadata
    sample_metadata.html("");
     // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
      Object.entries(wines).forEach(function ([key, value]){
      var row = sample_metadata.append("p");
      row.text(`${key}: ${value}`);
    console.log(wines)
      });
    });
};
function buildCharts(wines) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots
    var url = `/samples/${wines}`;
    // @TODO: Build a Bubble Chart using the sample data
    d3.json(url).then(function(data) {
      var bubX = data.points;
      var bubY = data.price;
      var m_size = data.price;
      var m_color = data.points;
      var textValue = data.varieties;
      
      var trace1 = {
        x: bubX,
        y: bubY,
        text: textValue,
        mode: 'markers',
        marker: {
          color: m_color,
          size: m_size,
        }
      };
      var data = [trace1];

      var layout = {
        title: 'Wines & Stuff',
        showlegend: false
        };
      

      Plotly.newPlot('bubble', data, layout);      

    // @TODO: Build a Pie Chart
    // HINT: You will need to use slice() to grab the top 10 price,
    // points, and labels (10 each).

    d3.json(url).then(function(data)  {
      var pie_values = data.price.slice(0,10)
      var pie_labels = data.points.slice(0,10)
      var pie_hover = data.varieties.slice(0,10)
      var data = [{
        type: "pie",
        hoverinfo: pie_hover,
        values: pie_values,
        labels: pie_labels,
        }];
  
      Plotly.newPlot("pie", data);
      });
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
