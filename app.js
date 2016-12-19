var CTPS = {};
CTPS.demoApp = {};
var f = d3.format(",")

//Using the queue.js library
d3.queue()
  .defer(d3.csv, "tip.csv")
  .awaitAll(function(error, results){ 
    CTPS.demoApp.generateWorksheet(results[0]);
    CTPS.demoApp.generateProgramming(results[0]);
    CTPS.demoApp.generateCMAQ(results[0]);
    CTPS.demoApp.generateHSIP(results[0]);
    CTPS.demoApp.generateTAP(results[0]);
})

var investment = d3.scaleOrdinal()
				.domain(["B/P", "CS", "CT", "INT", "MI"])
				.range(["#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e"])

CTPS.demoApp.generateWorksheet = function(data) { 
  var height = data.length * 50;   
  var worksheet = d3.select("#worksheet").append("svg")
                  .attr("width", "100%")
                  .attr("height", height)

  var w = $("#worksheet").width();

  var categories = ["Proponent", "Subregion", "TIP ID", "Project Name", "Investment Type", "Total Cost"];
  var yearLabels = ["FFY 2017", "FFY 2018", "FFY 2019", "FFY 2020", "FFY 2021", "FFY 2022", "FFY 2023 and Beyond",""];

  var projectIDs = [];
  data.forEach(function(i){
  	projectIDs.push(i.TIP_ID);
  })

  var labels = d3.scaleOrdinal() //labels project descriptors
              .domain(categories)
              .range([0, 100, 180, 260, 460, 540, 620])

  var years = d3.scaleLinear()
                .domain([2016, 2023])
                .range([640, w - 10])

  var yearsL = d3.scalePoint() //labels years with "FFY"
                .domain(yearLabels)
                .range([640, w - 10])

  var projects = d3.scalePoint() 
              .domain(projectIDs)
              .range([110, height - 10])

  var labelAxis = d3.axisTop(labels);
  var yearAxis = d3.axisTop(yearsL);
  var projectAxis = d3.axisLeft(projects);

  worksheet.append("g").attr("class", "axis")
    .attr("transform", "translate(0, 90)")
    	.call(labelAxis)
    	.selectAll(".axis text")
    		.attr("transform", "translate(0, -20)")
    		.style("text-anchor", "start")
    		.style("font-size", 11)
    		.style("font-weight", 700)
      		.call(wrap, 80);

  worksheet.append("g").attr("class", "axis")
    .attr("transform", "translate(0, 90)")
    	.call(yearAxis)
    	.selectAll(".axis text")
    		.attr("transform", "translate(0, -20)")
    		.style("text-anchor", "start")
    		.style("font-size", 11)
    		.style("font-weight", 700)
      		.call(wrap, 80);

  worksheet.selectAll(".fullRow")
    .data(data)
    .enter()
    .append("rect")
      .attr("class", function(d) { return "fullRow id" + d.TIP_ID;})
      .attr("x", 5)
      .attr("y", function(d) { return projects(d.TIP_ID) - 15; })
      .attr("width", 610)
      .attr("height", 50)
      .style("fill", "#ddd")
      .style("fill-opacity", .01)
      .attr("rx", 5)
      .attr("ry", 5)
      .style("stroke", function(d) { return investment(d.Investment_Category)})
      .style("stroke-width", 0)
      .on("mouseenter", function(){
      	var classid = this.getAttribute("class").split(" ", 2)[1];
      	worksheet.selectAll("." + classid + ":not(text)")
      		.style("stroke-width", 1)
  	   })
       .on("mouseleave", function(){
      	var classid = this.getAttribute("class").split(" ", 2)[1];
      	worksheet.selectAll("." + classid + ":not(text)")
      		.style("stroke-width", 0)
  	   })

  worksheet.selectAll(".proponent")
    .data(data)
    .enter()
    .append("text")
      .attr("class", function(d) { return "proponent id" + d.TIP_ID;})
      .attr("x", 10)
      .attr("y", function(d) { return projects(d.TIP_ID); })
      .style("fill", "black")
      .text(function(d) { return d.Proponent})
      .call(wrapt, 85)

 	worksheet.selectAll(".subregion")
    .data(data)
    .enter()
    .append("text")
      .attr("class", function(d) { return "subregion id" + d.TIP_ID;})
      .attr("x", 100)
      .attr("y", function(d) { return projects(d.TIP_ID); })
      .style("fill", "black")
      .text(function(d) { return d.Subregion})
      .call(wrapt, 80)

   worksheet.selectAll(".tipId")
    .data(data)
    .enter()
    .append("text")
      .attr("class", function(d) { return "tipId id" + d.TIP_ID;})
      .attr("x", 180)
      .attr("y", function(d) { return projects(d.TIP_ID); })
      .style("fill", "black")
      .text(function(d) { return d.TIP_ID})
      .call(wrapt, 80)

   worksheet.selectAll(".name")
    .data(data)
    .enter()
    .append("text")
      .attr("class", function(d) { return "name id" + d.TIP_ID;})
      .attr("x", 260)
      .attr("y", function(d) { return projects(d.TIP_ID); })
      .style("fill", "black")
      .text(function(d) { return d.Project_Name})
      .call(wrapt, 180)

	worksheet.selectAll(".investmentType")
    .data(data)
    .enter()
    .append("circle")
      .attr("class", function(d) { return "investmentType id" + d.TIP_ID;})
      .attr("cx", 470)
      .attr("cy", function(d) { return projects(d.TIP_ID); })
      .attr("r", 5)
      .style("fill", function(d) { return investment(d.Investment_Category)})

	worksheet.selectAll(".cost")
    .data(data)
    .enter()
    .append("text")
      .attr("class", function(d) { return "cost id" + d.TIP_ID;})
      .attr("x", 540)
      .attr("y", function(d) { return projects(d.TIP_ID); })
      .style("fill", "black")
      .text(function(d) { return "$" + f(d.Total_Cost_All_Fys)})
      .call(wrapt, 180)

     for (i = 2017; i < 2023; i++) { //appends grey rectangles
     	data.forEach(function(d){
     		if (+d.Earliest_Advertisement_Year <= i){
				worksheet.append("rect")
				      .attr("id", "id" + d.TIP_ID + "yr" + i)
				      .attr("x", years(i))
				      .attr("y", projects(d.TIP_ID) - 15)
				      .attr("width", 60)
				      .attr("height", 30)
				      .style("fill", "lightgrey")
				      .style("stroke", investment(d.Investment_Category))
				      .style("stroke-width", 0)
				      .on("mouseenter", function(){
							var thisId = this.getAttribute("id")
							worksheet.selectAll("#" + thisId)
					      		.style("stroke-width", 2)
					  })
					  .on("mouseleave", function(){
					  		var thisId = this.getAttribute("id")
							worksheet.selectAll("#" + thisId)
					      		.style("stroke-width", 0)
					  })
      		}
     	})
     }

	 //Color key
    var x = 5, 
    	y = 20,
    	r = 5;
    //text and colors
    worksheet.append("circle")
      .style("fill", investment("B/P")).style("stroke", "none")
      .attr("cx", x).attr("cy", y).attr("r", r)
    worksheet.append("text")
      .attr("x", x + 15).attr("y", y + 3)
      .text("Bicycle and/or Pedestrian");

    worksheet.append("circle")
      .style("fill", investment("CS")).style("stroke", "none")
      .attr("cx", x + 200).attr("cy", y).attr("r", r)
    worksheet.append("text")
      .attr("x", x + 215).attr("y", y)
      .text("Complete Streets Roadway Recontruction")
      .call(wrapt, 180);

    worksheet.append("circle")
      .style("fill", investment("CT")).style("stroke", "none")
      .attr("cx", x + 400).attr("cy", y).attr("r", r)
    worksheet.append("text")
      .attr("x", x + 415).attr("y", y)
      .text("Community Tranportation / Parking / Clean Air Mobility")
      .call(wrapt, 180);

    worksheet.append("circle")
      .style("fill", investment("INT")).style("stroke", "none")
      .attr("cx", x + 600).attr("cy", y).attr("r", r)
    worksheet.append("text")
      .attr("x", x + 615).attr("y", y + 3)
      .text("Intersection Improvement");

    worksheet.append("circle")
      .style("fill", investment("MI")).style("stroke", "none")
      .attr("cx", x + 800).attr("cy", y).attr("r", r)
    worksheet.append("text")
      .attr("x", x + 815).attr("y", y + 3)
      .text("Major Infrastructure");
   
}

function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}

function wrapt(text, width) {
    text.each(function () {
        var text = d3.select(this),
        	words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            x = text.attr("x"),
            y = text.attr("y"),
            dy = 0, //parseFloat(text.attr("dy")),
            tspan = text.text(null)
                        .append("tspan")
                        .attr("x", x)
                        .attr("y", y)
                        .attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan")
                            .attr("x", x)
                            .attr("y", y)
                            .attr("dy", ++lineNumber * lineHeight + dy + "em")
                            .text(word);
            }
        }
    });
}


CTPS.demoApp.generateProgramming = function(data) { 
  var programming = d3.select("#programming").append("svg")
                  .attr("width", "100%")
                  .attr("height", 300)

  var w = $("#programming").width();
  
  var yearLabels = ["FFY 2017", "FFY 2018", "FFY 2019", "FFY 2020", "FFY 2021", "FFY 2022", "FFY 2023 and Beyond",""];

  var years = d3.scaleLinear()
                .domain([2016, 2023])
                .range([50, w - 50])

  var yearsL = d3.scalePoint() //labels years with "FFY"
                .domain(yearLabels)
                .range([50, w - 50])

  var yearAxis = d3.axisBottom(yearsL);

  programming.append("g").attr("class", "axis")
     	.attr("transform", "translate(0, 250)") 	
    	.call(yearAxis)
    	.selectAll(".axis text")
    		.attr("transform", "translate(0, 5)")
    		.style("text-anchor", "start")
    		.style("font-size", 11)
    		.style("font-weight", 700)
}


CTPS.demoApp.generateCMAQ = function(data) { 
  var programming = d3.select("#CMAQ").append("svg")
                  .attr("width", "100%")
                  .attr("height", 300)

  var w = $("#CMAQ").width();
  
  var yearLabels = ["FFY 2017", "FFY 2018", "FFY 2019", "FFY 2020", "FFY 2021", "FFY 2022", "FFY 2023 and Beyond",""];

  var years = d3.scaleLinear()
                .domain([2016, 2023])
                .range([20, w - 20])

  var yearsL = d3.scalePoint() //labels years with "FFY"
                .domain(yearLabels)
                .range([20, w - 20])

  var yearAxis = d3.axisBottom(yearsL);

  programming.append("g").attr("class", "axis")
     	.attr("transform", "translate(0, 230)") 	
    	.call(yearAxis)
    	.selectAll(".axis text")
    		.attr("transform", "translate(0, 10)")
    		.style("text-anchor", "start")
    		.style("font-size", 11)
    		.style("font-weight", 700)
    		.call(wrapt, 40)
}


CTPS.demoApp.generateHSIP = function(data) { 
  var programming = d3.select("#HSIP").append("svg")
                  .attr("width", "100%")
                  .attr("height", 300)

  var w = $("#HSIP").width();
  
  var yearLabels = ["FFY 2017", "FFY 2018", "FFY 2019", "FFY 2020", "FFY 2021", "FFY 2022", "FFY 2023 and Beyond",""];

  var years = d3.scaleLinear()
                .domain([2016, 2023])
                .range([20, w - 20])

  var yearsL = d3.scalePoint() //labels years with "FFY"
                .domain(yearLabels)
                .range([20, w - 20])

  var yearAxis = d3.axisBottom(yearsL);

  programming.append("g").attr("class", "axis")
     	.attr("transform", "translate(0, 230)") 	
    	.call(yearAxis)
    	.selectAll(".axis text")
    		.attr("transform", "translate(0, 10)")
    		.style("text-anchor", "start")
    		.style("font-size", 11)
    		.style("font-weight", 700)
    		.call(wrapt, 40)
}


CTPS.demoApp.generateTAP = function(data) { 
  var programming = d3.select("#TAP").append("svg")
                  .attr("width", "100%")
                  .attr("height", 300)

  var w = $("#TAP").width();
  
  var yearLabels = ["FFY 2017", "FFY 2018", "FFY 2019", "FFY 2020", "FFY 2021", "FFY 2022", "FFY 2023 and Beyond",""];

  var years = d3.scaleLinear()
                .domain([2016, 2023])
                .range([20, w - 20])

  var yearsL = d3.scalePoint() //labels years with "FFY"
                .domain(yearLabels)
                .range([20, w - 20])

  var yearAxis = d3.axisBottom(yearsL);

  programming.append("g").attr("class", "axis")
     	.attr("transform", "translate(0, 230)") 	
    	.call(yearAxis)
    	.selectAll(".axis text")
    		.attr("transform", "translate(0, 10)")
    		.style("text-anchor", "start")
    		.style("font-size", 11)
    		.style("font-weight", 700)
    		.call(wrapt, 40)
}
