function buildMetadata(sample) {
  // @TODO: Complete the following function that builds the metadata panel
  // Use `d3.json` to fetch the metadata for a sample
  var url = `/metadata/${sample}`;
    // Use d3 to select the panel with id of `#sample-metadata`
    d3.json(url).then(function(sample) {
      var sample_metadata = d3.select("#sample-metadata");
    // Use `.html("") to clear any existing metadata
    sample_metadata.html("");
     // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
      Object.entries(sample).forEach(function ([key, value]){
      var row = sample_metadata.append("p");
      row.text(`${key}: ${value}`);
      });
    });
};
function buildCharts(sample) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots
    var url = `/samples/${sample}`;
    // @TODO: Build a Bubble Chart using the sample data
    d3.json(url).then(function(data) {
      var bubX = data.otu_ids;
      var bubY = data.sample_values;
      var m_size = data.sample_values;
      var m_color = data.otu_ids;
      var textValue = data.otu_labels;
      
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
        title: 'OTU ID',
        showlegend: false
        };
      

      Plotly.newPlot('bubble', data, layout);      

    // @TODO: Build a Pie Chart
    // HINT: You will need to use slice() to grab the top 10 sample_values,
    // otu_ids, and labels (10 each).

    d3.json(url).then(function(data)  {
      var pie_values = data.sample_values.slice(0,10)
      var pie_labels = data.otu_ids.slice(0,10)
      var pie_hover = data.otu_labels.slice(0,10)
      var data = [{
        type: "pie",
        hoverinfo: pie_hover,
        values: pie_values,
        labels: pie_labels,
        }];
  
      Plotly.newPlot("pie", data);
      });
    });
// ACTIVITY 15-2-7
};


function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
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
