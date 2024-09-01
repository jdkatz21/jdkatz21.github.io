// Load the CSV file and initialize the visualization
d3.csv('brownian_motions.csv').then(function(data) {

    let svg;
    let xScale;
    let yScale;

    // The number of random walks in the file (excluding the first column)
    const numWalks = data.columns.length - 1;

    // Convert data into an array of arrays, excluding the first column (random walks)
    const walks = data.map(d => {
        return data.columns.slice(1).map(col => +d[col]);
    });

    // set up dt
    let dt = 1;

    // Get the time values (first column)
    const timeSteps = d3.range(0, data.length).map(i => i / 200);  // Generate timeSteps as 1/1000th of a step
    // Define a fixed color palette (you can customize these colors)
    const colorPalette = [
        "#1f77b4",  // blue
        "#ff7f0e",  // orange
        "#2ca02c",  // green
        "#d62728",  // red
        "#9467bd",  // purple
        "#8c564b",  // brown
        "#e377c2",  // pink
        "#7f7f7f",  // gray
        "#bcbd22",  // olive
        "#17becf"   // teal
    ];

    // Keep track of the indices of the displayed walks
    let displayedWalkIndices = [];
    let showStandardDeviation = false; // Flag for showing standard deviation
    let showDistribution = false;

    // Initial render
    renderWalks(displayedWalkIndices, showStandardDeviation, dt);
    refreshWalk();

    // Button and input event listeners
    d3.select("#refreshButton").on("click", function() {
        // Stop the ongoing animation
        isAnimating = false;
        d3.select(".animation").interrupt();  // Stop any ongoing animation
        refreshWalk();
    });

    d3.select("#walkCount").on("change", function() {

        const walkCount = +d3.select(this).property("value");
    
        // Stop the ongoing animation
        isAnimating = false;
        d3.select(".animation").interrupt();  // Stop any ongoing animation
    
        // Call your function to update the walks based on the new walk count
        updateWalks(walkCount);
    });

    d3.select("#showStdDev").on("change", function() {
        showStandardDeviation = d3.select(this).property("checked");
        renderWalks(displayedWalkIndices, showStandardDeviation, dt);
    });

    // Event listener for the checkbox
    d3.select("#showDistribution").on("change", function() {

        showDistribution = d3.select(this).property("checked");
        renderWalks(displayedWalkIndices, showStandardDeviation, dt);
        
    });
    // Event listener for the slider to update the dt value and the plot
    d3.select("#dt-slider").on("input", function() {

        const sliderValue = +d3.select(this).property("value");  // Get the slider value (0-100)
        dt = sliderToLogScale(sliderValue);  // Convert slider value to log scale dt
        d3.select("#dt-value").text(dt.toFixed(4));  // Update the displayed dt value

        renderWalks(displayedWalkIndices, showStandardDeviation, dt);
        // Update the plot with the new dt value
    });


    // Function to calculate the normal distribution PDF at time t
    function normalDistribution(t, x) {
        const variance = t;
        const mean = 0;
        const stddev = Math.sqrt(variance);
        
        return (1 / (stddev * Math.sqrt(2 * Math.PI))) * Math.exp(-((x - mean) ** 2) / (2 * variance));
    }

    // Function to convert slider value to a logarithmic scale
    function sliderToLogScale(value) {
        // The range of the slider goes from 0 to 100
        // We will map this range logarithmically to 0.005 to 1
        const minDt = 0.005;
        const maxDt = 1;
        const logMinDt = Math.log10(minDt);
        const logMaxDt = Math.log10(maxDt);

        // Convert the slider value (0-100) to the corresponding dt value on a log scale
        const logDt = logMinDt + (value / 100) * (logMaxDt - logMinDt);
        return Math.pow(10, logDt);  // Convert back from log scale to actual dt value
    }

    // Function to subsample data based on the dt value
    function subsampleData(data, dt) {
        const sampledData = [];

        // Ensure the start point (0) is always included
        // sampledData.push({ x: +0, y: data[0] });


        const step = Math.max(1, Math.floor((data.length -2)* dt/4));  // Determine how to space points

        for (let i = 0; i < data.length; i += step) {
            const t = i / (data.length - 1) * 4;  // Calculate the corresponding x value (0 to 2 range)
            console.log(t)
            sampledData.push({ x: +t, y: data[i] });

        }

        // sampledData.push({x:+2, y: data[data.length - 1]});
        let sampledData = sampledData.map(point => {
            return {x: point.x * 0.5, y: point.y};
        });
        return sampledData;

        
    }

    // // Function to update the plot based on dt
    // function updatePlot(dt) {
    //    // Clear the existing walk lines (but not axes)
    // svg.selectAll(".walk-line").remove();

    // // Loop through each walk and plot subsampled data
    // data.columns.slice(1).forEach((column, idx) => {
    //     const walkData = data.map(d => +d[column]);
    //     const subsampledWalkData = subsampleData(walkData, dt);  // Subsample the data

    //     // Append a path for each subsampled walk
    //     svg.append("path")
    //         .datum(subsampledWalkData)
    //         .attr("class", "walk-line")  // Add class to target for clearing later
    //         .attr("fill", "none")
    //         .attr("stroke", colorPalette[idx % colorPalette.length])
    //         .attr("stroke-width", 1.5)
    //         .attr("d", d3.line()
    //             .x((d, i) => xScale(i / 100))  // x position based on subsampled index
    //             .y(d => yScale(d))
    //         );
    // });
    // }

    

    // Function to refresh with a new random walk
    function refreshWalk() {
        // Clear the existing walks and reset to a new first walk
        displayedWalkIndices = [];
        const randomIndex = Math.floor(Math.random() * numWalks);
        displayedWalkIndices.push(randomIndex);

        // Reset the walk count input to 1
        d3.select("#walkCount").property("value", 1);

        // Render the new walk
        renderWalks(displayedWalkIndices, showStandardDeviation, dt);
    }

    // Function to add a random walk to the chart
    function addWalk() {
        const randomIndex = Math.floor(Math.random() * numWalks);
        displayedWalkIndices.push(randomIndex);
        renderWalks(displayedWalkIndices, showStandardDeviation, dt);
    }

    // Function to remove the last walk from the chart
    function removeLastWalk() {
        displayedWalkIndices.pop();
        renderWalks(displayedWalkIndices, showStandardDeviation, dt);
    }

    // Function to update the number of walks
    function updateWalks(newWalkCount) {
        const currentWalkCount = displayedWalkIndices.length;

        while (newWalkCount > currentWalkCount) {
            addWalk();
            currentWalkCount = currentWalkCount + 1;
        } 
        while (newWalkCount < currentWalkCount) {
            removeLastWalk();
            currentWalkCount = currentWalkCount - 1;
        }
    }

    // Function to render the selected walks and optional standard deviation line on the same chart
    function renderWalks(indices, showStdDev, dt) {
        // Clear the previous chart
        d3.select(".chart").selectAll("svg").remove();

        // Set up chart dimensions
        const margin = {top: 20, right: 20, bottom: 30, left: 50};
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        // Create SVG container for the chart
        svg = d3.select(".chart").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Set up the scales with fixed domains
        xScale = d3.scaleLinear()
            .domain([0, 2])  // The x-axis represents the steps in the walk
            .range([0, width/2]);

        yScale = d3.scaleLinear()
            .domain([-5, 5])  // Fixed y-axis domain between -30 and 30
            .range([height, 0]);

        

        // Define the line generator
        const std_dev_line = d3.line()
            .x((d, i) => xScale(i/100))
            .y(d => yScale(d));

        const line = d3.line()
            .x(d => xScale(d.x)) 
            .y(d => yScale(d.y))

        // Append lines for each walk on the same chart with consistent colors
        indices.forEach((index, i) => {
            const walkData = walks.map(d => d[index]);
            // Subsample the data based on dt
            const subsampledWalkData = subsampleData(walkData, dt);  // Subsample the data

            console.log(subsampledWalkData)
            const path = svg.append("path")
                .datum(subsampledWalkData)
                .attr("fill", "none")
                .attr("stroke", colorPalette[i % colorPalette.length])  // Use predefined colors
                .attr("stroke-width", 1.5)
                .attr("d", line);

        });

        // Optionally add the standard deviation line
        if (showStdDev) {
            const stdDevData = timeSteps.map(t => 2 * Math.sqrt(t)); // Calculate 95th percent confidence band for each time step
            // Add the positive standard deviation line
            svg.append("path")
                .datum(stdDevData)
                .attr("fill", "none")
                .attr("stroke", "black")
                .attr("stroke-width", 1.5)
                .attr("stroke-dasharray", "5,5")  // Dashed line for standard deviation
                .attr("d", std_dev_line);

            // Add the negative standard deviation line
            svg.append("path")
                .datum(stdDevData.map(d => -d))  // Reflect the standard deviation below 0
                .attr("fill", "none")
                .attr("stroke", "black")
                .attr("stroke-width", 1.5)
                .attr("stroke-dasharray", "5,5")
                .attr("d", std_dev_line);
        }

        // Optionally add the distribution at t=10
        if (showDistribution) {
            renderDistributionAtT10(svg, xScale, yScale)
        }


        // Add the X axis
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale));

        // Add the Y axis with fixed domain
        svg.append("g")
            .call(d3.axisLeft(yScale));
    }


});

