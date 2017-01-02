var CTPS = {};
CTPS.demoApp = {};
var f = d3.format(",")
var e = d3.format(".1f")

//Using the queue.js library
d3.queue()
  .defer(d3.csv, "tip.csv")
  .defer(d3.csv, "targets.csv")
  .awaitAll(function(error, results){ 
    CTPS.demoApp.generateWorksheet(results[0], results[1]);
    CTPS.demoApp.generateProgramming(results[0], results[1]);
    CTPS.demoApp.generateFunders(results[0], "CMAQ", results[1]);
    CTPS.demoApp.generateFunders(results[0], "HSIP", results[1]);
    CTPS.demoApp.generateFunders(results[0], "TAP", results[1]);
    CTPS.demoApp.generateBreakdowns(results[0]);
    CTPS.demoApp.generateSubregions(results[0]);
})

var investment = d3.scaleOrdinal()
				.domain(["B/P", "CS", "CT", "INT", "MI"])
				.range(["#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e"])

CTPS.demoApp.generateWorksheet = function(data, targets) { 
  var height = data.length * 50;   
  var static = d3.select("#static").append("svg")
                  .attr("width", "100%")
                  .attr("height", 100)

  var worksheet = d3.select("#worksheet").append("svg")
                  .attr("width", "100%")
                  .attr("height", height)
                  .style("background-color", "rgba(243,243,243,.5)")

  var w = $("#worksheet").width();

  var categories = ["Proponent", "Subregion", "TIP ID", "Project Name", "Investment Type", "Total Cost"];
  var yearLabels = ["FFY 2017", "FFY 2018", "FFY 2019", "FFY 2020", "FFY 2021", "FFY 2022", "FFY 2023 and Beyond",""];

  var projectIDs = [];
  data.forEach(function(i){
  	projectIDs.push(i.TIP_ID);
  })

  var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([0, 10])
    .html(function(d) {
      var add_info = "";
      if (d.Additional_Information != "") { add_info = "<p><br>Additional Information:</p>" + d.Additional_Information;}
      return "<p>Funding Distribution:</p>CMAQ: " + parseInt(100*d.CMAQ) + "%<br>HSIP: " + parseInt(100*d.HSIP) + "%<br>TAP: " + parseInt(100*d.TAP) + "%" + add_info;
    })

  worksheet.call(tip); 

  var labels = d3.scaleOrdinal() //labels project descriptors
              .domain(categories)
              .range([0, 100, 180, 260, 460, 540, 620])

  var years = d3.scaleLinear()
                .domain([2017, 2024])
                .range([640, w - 10])

  var yearsL = d3.scalePoint() //labels years with "FFY"
                .domain(yearLabels)
                .range([640, w - 10])

  var projects = d3.scalePoint() 
              .domain(projectIDs)
              .range([30, height - 10])

  var labelAxis = d3.axisTop(labels);
  var yearAxis = d3.axisTop(yearsL);
  var projectAxis = d3.axisLeft(projects);

  static.append("g").attr("class", "axis")
    .attr("transform", "translate(0, 90)")
    	.call(labelAxis)
    	.selectAll(".axis text")
    		.attr("transform", "translate(0, -20)")
    		.style("text-anchor", "start")
    		.style("font-size", 11)
    		.style("font-weight", 700)
      		.call(wrap, 80);

  static.append("g").attr("class", "axis")
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
      .style("fill-opacity", .05)
      .attr("rx", 5)
      .attr("ry", 5)
      .style("stroke", function(d) { return investment(d.Investment_Category)})
      .style("stroke-width", 0)
      .on("mouseenter", function(d){
      	var classid = this.getAttribute("class").split(" ", 2)[1];
      	worksheet.selectAll("." + classid + ":not(text)")
      		.style("stroke-width", 1)
          tip.show(d);
  	   })
       .on("mouseleave", function(d){
      	var classid = this.getAttribute("class").split(" ", 2)[1];
      	worksheet.selectAll("." + classid + ":not(text)")
      		.style("stroke-width", 0)
          tip.hide(d);         
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

 yearbins = [{"total":0,"CMAQ":0,"HSIP":0,"TAP":0},{"total":0,"CMAQ":0,"HSIP":0,"TAP":0},{"total":0,"CMAQ":0,"HSIP":0,"TAP":0},{"total":0,"CMAQ":0,"HSIP":0,"TAP":0},{"total":0,"CMAQ":0,"HSIP":0,"TAP":0},{"total":0,"CMAQ":0,"HSIP":0,"TAP":0},{"total":0,"CMAQ":0,"HSIP":0,"TAP":0}];   

 for (i = 2017; i < 2024; i++) { //appends grey rectangles
 	data.forEach(function(d){
    d.currentFunding = +d.Earliest_Advertisement_Year;
 		if (d.currentFunding <= i){
		worksheet.append("rect")
		      .attr("class", function() { 
            var highlighted = "";
            if (+d.Earliest_Advertisement_Year == i) { highlighted = " selected"; }
            return "id" + d.TIP_ID + " yr" + i + highlighted;
          })
		      .attr("x", years(i))
		      .attr("y", projects(d.TIP_ID) - 15)
		      .attr("width", 60)
		      .attr("height", 30)
		      .style("fill", function() {
            if (+d.Earliest_Advertisement_Year == i) { return investment(d.Investment_Category)}
            else { return "lightgrey" }
          })
		      .style("stroke", investment(d.Investment_Category))
		      .style("stroke-width", 0)
		      .on("mouseenter", function(){
					   var thisId = this.getAttribute("class").split(' ', 3)[0];
             var thisYear = this.getAttribute("class").split(' ', 3)[1];
					   worksheet.selectAll("." + thisId + "." + thisYear)
			      		.style("stroke-width", 2)
			     })
			    .on("mouseleave", function(){
			  		 var thisId = this.getAttribute("class").split(' ', 3)[0];
             var thisYear = this.getAttribute("class").split(' ', 3)[1];
             worksheet.selectAll("." + thisId + "." + thisYear)
			      		.style("stroke-width", 0)
          })
          .on("click", function(){
              var thisId = this.getAttribute("class").split(' ', 3)[0];
              var thisYear = this.getAttribute("class").split(' ', 3)[1];
              var yearNum = parseInt(thisYear.substring(2));

              worksheet.selectAll("rect." + thisId + ":not(." + thisYear + ")")
                .style("fill", "lightgrey")
              worksheet.selectAll("." + thisId + "." + thisYear)
                .style("fill", investment(d.Investment_Category))

              d.currentFunding = yearNum;
              updateFunctions(yearNum);

              d3.selectAll(".current").remove();

              CTPS.demoApp.generateProgramming(data, targets);
              CTPS.demoApp.generateFunders(data, "CMAQ", targets);
              CTPS.demoApp.generateFunders(data, "HSIP", targets);
              CTPS.demoApp.generateFunders(data, "TAP", targets);
              CTPS.demoApp.generateBreakdowns(data);
              CTPS.demoApp.generateSubregions(data);
          })
  		}
    function updateTotals (year) {
      if (+d.currentFunding == year){
        if (i > 2018) { var multiplier = 1.04}
        yearbins[i - 2017].total += parseInt(+d.Total_Cost_All_Fys);
        yearbins[i - 2017].CMAQ += parseInt(+d.CMAQ * +d.Total_Cost_All_Fys);
        yearbins[i - 2017].HSIP += parseInt(+d.HSIP * +d.Total_Cost_All_Fys);
        yearbins[i - 2017].TAP += parseInt(+d.TAP * +d.Total_Cost_All_Fys);
      }
    }
    updateTotals(i);
 	})
 }

function updateFunctions (year) {
  yearbins = [{"total":0,"CMAQ":0,"HSIP":0,"TAP":0},{"total":0,"CMAQ":0,"HSIP":0,"TAP":0},{"total":0,"CMAQ":0,"HSIP":0,"TAP":0},{"total":0,"CMAQ":0,"HSIP":0,"TAP":0},{"total":0,"CMAQ":0,"HSIP":0,"TAP":0},{"total":0,"CMAQ":0,"HSIP":0,"TAP":0},{"total":0,"CMAQ":0,"HSIP":0,"TAP":0}];   
  for (i = 2017; i < 2023; i++) { //appends grey rectangles
    data.forEach(function(d){
      d.currentFunding == year;
      if (d.currentFunding == i){
        yearbins[i - 2017].total += parseInt(+d.Total_Cost_All_Fys);
        yearbins[i - 2017].CMAQ += parseInt(+d.CMAQ * +d.Total_Cost_All_Fys);
        yearbins[i - 2017].HSIP += parseInt(+d.HSIP * +d.Total_Cost_All_Fys);
        yearbins[i - 2017].TAP += parseInt(+d.TAP * +d.Total_Cost_All_Fys);
      }
    })
}}
	 //Color key
    var x = 5, 
    	y = 20,
    	r = 5;
    //text and colors
    static.append("circle")
      .style("fill", investment("B/P")).style("stroke", "none")
      .attr("cx", x).attr("cy", y).attr("r", r)
    static.append("text")
      .attr("x", x + 15).attr("y", y + 3)
      .text("Bicycle and/or Pedestrian");

    static.append("circle")
      .style("fill", investment("CS")).style("stroke", "none")
      .attr("cx", x + 200).attr("cy", y).attr("r", r)
    static.append("text")
      .attr("x", x + 215).attr("y", y)
      .text("Complete Streets Roadway Recontruction")
      .call(wrapt, 180);

    static.append("circle")
      .style("fill", investment("CT")).style("stroke", "none")
      .attr("cx", x + 400).attr("cy", y).attr("r", r)
    static.append("text")
      .attr("x", x + 415).attr("y", y)
      .text("Community Tranportation / Parking / Clean Air Mobility")
      .call(wrapt, 180);

    static.append("circle")
      .style("fill", investment("INT")).style("stroke", "none")
      .attr("cx", x + 600).attr("cy", y).attr("r", r)
    static.append("text")
      .attr("x", x + 615).attr("y", y + 3)
      .text("Intersection Improvement");

    static.append("circle")
      .style("fill", investment("MI")).style("stroke", "none")
      .attr("cx", x + 800).attr("cy", y).attr("r", r)
    static.append("text")
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


CTPS.demoApp.generateProgramming = function(data, targets) { 
  var programming = d3.select("#programming").append("svg")
                  .attr("width", "100%")
                  .attr("height", 300)
                  .attr("class", "current")

  var w = $("#programming").width();
  
  maxCostTotal = [[], [], [], []]; // maxes for Total, CMAQ, HSIP, and TAP
  yearbins.forEach(function(d){
    maxCostTotal[0].push(d.total);
    maxCostTotal[1].push(d.CMAQ);
    maxCostTotal[2].push(d.HSIP);
    maxCostTotal[3].push(d.TAP);
  })

  var yearLabels = ["FFY 2017", "FFY 2018", "FFY 2019", "FFY 2020", "FFY 2021", "FFY 2022", "FFY 2023 and Beyond",""];

  var years = d3.scaleLinear()
                .domain([2017, 2024])
                .range([80, w - 50])

  var yearsL = d3.scalePoint() //labels years with "FFY"
                .domain(yearLabels)
                .range([80, w - 50])

  var yScalePos = d3.scaleLinear()
                .domain([0, d3.max(maxCostTotal[0])])
                .range([250, 40])

  var yScaleHeight = d3.scaleLinear()
                .domain([0, d3.max(maxCostTotal[0])])
                .range([0, 210])

  var yearAxis = d3.axisBottom(yearsL);
  var yAxis = d3.axisLeft(yScalePos);

  programming.append("g").attr("class", "axis")
     	.attr("transform", "translate(0, 250)") 	
    	.call(yearAxis)
    	.selectAll(".axis text")
    		.attr("transform", "translate(65, 5)")
    		.style("text-anchor", "middle")
    		.style("font-size", 11)
    		.style("font-weight", 700)

  programming.append("g").attr("class", "axis")
      .attr("transform", "translate(80, 0)")   
      .call(yAxis)
      .selectAll(".axis text")
        .attr("transform", "translate(0, 0)")
        .style("text-anchor", "end")
        .style("font-size", 11)
        .style("font-weight", 700)

  yearbins.forEach(function(d){
    programming.append("rect")
      .attr("x", years(yearbins.indexOf(d)+2017) + 40)
      .attr("y", yScalePos(d.total))
      .attr("width", 50)
      .attr("height", yScaleHeight(d.total))
      .style("fill", "grey")

    programming.append("text")
      .attr("x", years(yearbins.indexOf(d)+2017) + 65)
      .attr("y", yScalePos(d.total) - 10)
      .style("fill", "black")
      .style("text-anchor", "middle")
      .text("$" + f(d.total))
  })

  programming.selectAll(".targetsTotal")
      .data(targets)
      .enter()
        .append("rect")
        .attr("x", function(d){
          return years(d.Year) + 40;
        })
        .attr("y", function(d) {
          return yScalePos(d.Total_Target);
        })
        .attr("width", 50)
        .attr("height", 3)
        .style("fill", "red")

}

CTPS.demoApp.generateFunders = function(data, funder, targets) { 
  var programming = d3.select("#" + funder).append("svg")
                  .attr("width", "100%")
                  .attr("height", 300)
                  .attr("class", "current")

  var w = $("#" + funder).width();
  
  var yearLabels = ["FFY 2017", "FFY 2018", "FFY 2019", "FFY 2020", "FFY 2021", "FFY 2022", "FFY 2023 and Beyond",""];

  var years = d3.scaleLinear()
                .domain([2017, 2024])
                .range([80, w - 10])

  var yearsL = d3.scalePoint() //labels years with "FFY"
                .domain(yearLabels)
                .range([80, w - 10])

  var indexTotal = 0;
  if (funder == "CMAQ") {indexTotal = d3.max(maxCostTotal[1])}
  if (funder == "HSIP") {indexTotal = d3.max(maxCostTotal[2])}
  if (funder == "TAP") {indexTotal = d3.max(maxCostTotal[3])}

  var yScalePos = d3.scaleLinear()
                .domain([0, indexTotal])
                .range([250, 40])

  var yScaleHeight = d3.scaleLinear()
                .domain([0, indexTotal])
                .range([0, 210])

  var yearAxis = d3.axisBottom(yearsL);
  var yAxis = d3.axisLeft(yScalePos);

  programming.append("g").attr("class", "axis")
      .attr("transform", "translate(0, 250)")   
      .call(yearAxis)
      .selectAll(".axis text")
        .attr("transform", "translate(15, 5)")
        .style("text-anchor", "middle")
        .style("font-size", 11)
        .style("font-weight", 700)
        .call(wrapt, 40)

  programming.append("g").attr("class", "axis")
      .attr("transform", "translate(80, 0)")   
      .call(yAxis)
      .selectAll(".axis text")
        .attr("transform", "translate(0, 0)")
        .style("text-anchor", "end")
        .style("font-size", 11)
        .style("font-weight", 700)

  yearbins.forEach(function(d){
    programming.append("rect")
      .attr("x", years(yearbins.indexOf(d)+2017) + 15)
      .attr("y", yScalePos(d[funder]))
      .attr("width", 15)
      .attr("height", yScaleHeight(d[funder]))
      .style("fill", "grey")

    programming.append("text")
      .attr("x", years(yearbins.indexOf(d)+2017) + 20)
      .attr("y", yScalePos(d[funder]) - 5)
      .style("fill", "black")
      .style("font-size", 10)
      .style("text-anchor", "middle")
      .text("$" + f(d[funder]))
  })

   programming.selectAll(".targets" + funder)
      .data(targets)
      .enter()
        .append("rect")
        .attr("x", function(d){
          return years(d.Year) + 15;
        })
        .attr("y", function(d) {
          return yScalePos(d[funder + "_Target"]);
        })
        .attr("width", 15)
        .attr("height", 2)
        .style("fill", "red")
}

CTPS.demoApp.generateBreakdowns = function(data) { 
  var iTypes = [{ "type": "B/P", "amount": 0},
               { "type": "CS", "amount": 0},
               { "type": "CT", "amount": 0},
               { "type": "INT", "amount": 0},
               { "type": "MI", "amount": 0}];

  var total = 0;

  data.forEach(function(d){
    iTypes.forEach(function(e){
      if (d.Investment_Category == e.type && d.currentFunding != 2017 && d.currentFunding != 2023){
        e.amount += +d.Total_Cost_All_Fys
        total += +d.Total_Cost_All_Fys;
      }
    })
  })


  var programming = d3.select("#investmentCategory").append("svg")
                  .attr("width", "100%")
                  .attr("height", 100)
                  .attr("class", "current")

  var w = $("#investmentCategory").width();

  var xScale = d3.scaleLinear()
                .domain([0, total])
                .range([80, w - 80])

  var xScaleL = d3.scaleLinear()
                .domain([0, total])
                .range([0, w - 160])

  programming.selectAll(".types")
    .data(iTypes)
    .enter()
    .append("rect")
      .attr("x", function(d) {
        if (d.type == "B/P") {return xScale(0)}
        if (d.type == "CS") {return xScale(iTypes[0].amount)}
        if (d.type == "CT") {return xScale(iTypes[0].amount + +iTypes[1].amount)}
        if (d.type == "INT") {return xScale(iTypes[0].amount + +iTypes[1].amount + +iTypes[2].amount)}
        if (d.type == "MI") {return xScale(iTypes[0].amount + +iTypes[1].amount + +iTypes[2].amount + +iTypes[3].amount)}
      })
      .attr("y", 60)
      .attr("width", function(d){ return xScaleL(d.amount);})
      .attr("height", 20)
      .attr("fill", function(d){ return investment(d.type)})

  programming.selectAll(".typeLabels")
    .data(iTypes)
    .enter()
    .append("text")
      .attr("x", function(d) {
        if (d.type == "B/P") {return xScale(iTypes[0].amount/2)}
        if (d.type == "CS") {return xScale(iTypes[0].amount + +(iTypes[1].amount/2))}
        if (d.type == "CT") {return xScale(iTypes[0].amount + +iTypes[1].amount + +(iTypes[2].amount/2))}
        if (d.type == "INT") {return xScale(iTypes[0].amount + +iTypes[1].amount + +iTypes[2].amount + +(iTypes[3].amount/2))}
        if (d.type == "MI") {return xScale(iTypes[0].amount + +iTypes[1].amount + +iTypes[2].amount + +iTypes[3].amount + +(iTypes[4].amount/2))}
      })
      .attr("y", 30)
      .style("text-anchor", "middle")
      .style("font-weight", 700)
      .text(function(d){return d.type})


   programming.selectAll(".typePercents")
    .data(iTypes)
    .enter()
    .append("text")
      .attr("x", function(d) {
        if (d.type == "B/P") {return xScale(iTypes[0].amount/2)}
        if (d.type == "CS") {return xScale(iTypes[0].amount + +(iTypes[1].amount/2))}
        if (d.type == "CT") {return xScale(iTypes[0].amount + +iTypes[1].amount + +(iTypes[2].amount/2))}
        if (d.type == "INT") {return xScale(iTypes[0].amount + +iTypes[1].amount + +iTypes[2].amount + +(iTypes[3].amount/2))}
        if (d.type == "MI") {return xScale(iTypes[0].amount + +iTypes[1].amount + +iTypes[2].amount + +iTypes[3].amount + +(iTypes[4].amount/2))}
      })
      .attr("y", 45)
      .style("text-anchor", "middle")
      .text(function(d){return e(d.amount*100/total) + "%"})
}

CTPS.demoApp.generateSubregions = function(data) { 
  var iTypes = [{ "type": "IC", "amount": 0},
               { "type": "MAGIC", "amount": 0},
               { "type": "MW", "amount": 0},
               { "type": "NSTF", "amount": 0},
               { "type": "NSPC", "amount": 0},
               { "type": "SSC", "amount": 0},
               { "type": "SWAP", "amount": 0},
               { "type": "TRIC", "amount": 0},
               { "type": "All", "amount": 0}];

  var total = 0;

  data.forEach(function(d){
    iTypes.forEach(function(e){
      if (d.Subregion == e.type && d.currentFunding != 2017 && d.currentFunding != 2023){
        e.amount += +d.Total_Cost_All_Fys;
        total += +d.Total_Cost_All_Fys;
      }
    })
  })

  var max = [];
  iTypes.forEach(function(d){
    max.push(+d.amount);
  })

  var programming = d3.select("#subregions").append("svg")
                  .attr("width", "100%")
                  .attr("height", 200)
                  .attr("class", "current")

  var w = $("#subregions").width();

  var xScale = d3.scalePoint()
                .domain(["IC", "MAGIC", "MW", "NSTF", "NSPC", "SSC", "SWAP", "TRIC", "All"])
                .range([80, w - 80])

  var yScale = d3.scaleLinear()
                .domain([0, d3.max(max)])
                .range([180, 40])

  var yScaleH = d3.scaleLinear()
                .domain([0, d3.max(max)])
                .range([0, 140])

  programming.selectAll(".subregions")
    .data(iTypes)
    .enter()
    .append("rect")
      .attr("x", function(d) { return xScale(d.type)})
      .attr("y", function(d) { return yScale(d.amount)})
      .attr("width", 40)
      .attr("height", function(d) { return yScaleH(d.amount)})
      .attr("fill", "grey")

  programming.selectAll(".subregionLabels")
    .data(iTypes)
    .enter()
    .append("text")
      .attr("x", function(d) { return xScale(d.type) + 20})
      .attr("y", function(d) { return yScale(d.amount) - 30})
      .style("text-anchor", "middle")
      .style("font-weight", 700)
      .text(function(d){return d.type})


   programming.selectAll(".subregionsAmounts")
    .data(iTypes)
    .enter()
    .append("text")
      .attr("x", function(d) { return xScale(d.type) + 20})
      .attr("y", function(d) { return yScale(d.amount) - 15})
      .style("text-anchor", "middle")
      .text(function(d){return "$" + f(d.amount);})
}

function expandCollapse() {
    var change = document.getElementById("toggle");
    if (change.innerHTML == "Expand Table")
    {
        change.innerHTML = "Collapse Table";
        document.getElementById('worksheet').style.height = '300px';
    }
    else {
        change.innerHTML = "Expand Table";
        document.getElementById('worksheet').style.height = '50px';
    }
}
