// Credits to Paolo Moretti @ https://stackoverflow.com/questions/3582671/how-to-open-a-local-disk-file-with-javascript
// Credits to Dan Story @ https://stackoverflow.com/questions/2528076/delete-a-line-of-text-in-javascript

"use strict";
let myChart;
let option;
let time = [];
let kestrelData = [];
let samplingDate;
let state = 0;
let weatherVariables = ['Wind Speed','Barometric Pressure','Density Altitude','Relative Humidity','Station Pressure','Headwind','Altitude','Dew Point','Magnetic Direction','Wet Bulb Temperature','Wind Chill','Crosswind','Heat Stress Index','Temperature','True Direction'];
let dataColors = ['#c23531','#2f4554', '#61a0a8', '#d48265', '#91c7ae','#749f83',  '#ca8622', '#bda29a','#6e7074', '#546570', '#c4ccd3','red','blue','green','purple']
let units = ['m/s','mbar','m','%','mbar','m/s','m','°C','゜','°C','°C','m/s','°C','°C','°'];

let browse = document.getElementById('browseButton');
browse.addEventListener('change', readSingleFile, false);

let nextButton = document.getElementById('nextButton');
nextButton.addEventListener('click', cycleRight, false);

let previousButton = document.getElementById('previousButton');
previousButton.addEventListener('click', cycleLeft, false);

function cycleRight(e){
    state += 1;
    if(state > 14)
        state = 0;
    graph();
}

function cycleLeft(e){
    state -= 1;
    if(state < 0)
        state = 14;
    graph();
}

// File upload method
function readSingleFile(e) {
    let file = e.target.files[0];
    if (!file) {
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        let contents = e.target.result;
        let splicedContents = spliceContents(contents);
        csv2array(splicedContents);
    };
    reader.readAsText(file);
}

// Parse the initial lines of fluff
function spliceContents(contents) {
    let lines = contents.split('\n');
    lines.splice(0, 5);
    return lines.join('\n');
}

function csv2array(csvFile){
    let thousandComma = /,(?=\d)/g; // Comma, if followed by a digit
    let noCommaSeparator = csvFile.replace(thousandComma, '');
    let noQuotes = noCommaSeparator.replace(/"/g, '');
    let formattedTime = noQuotes.replace(/\s(?=\d\d:)/g,'T');
    let parsedInput= formattedTime.split(/,|\n/);
    parsedInput.pop(); // Last element is an empty value

    console.log(parsedInput);
    let oneDArray = [];
    let size = parsedInput.length;
    let j = 0;
    let k = 0;
    let minutes;
    for(let i=0; i<size;++i){
        if(i%16) { // Skip date entries, as these are not meant to be parsed as floats
            oneDArray[j] = parseFloat(parsedInput[i]);
            ++j;
        }
        else{ // Create Time array
            console.log(parsedInput[i]);
            let t = new Date(parsedInput[i]);
            minutes =  t.getMinutes();
            if(minutes < 10){
                time[k] = [t.getHours(), '0'+minutes].join(':');
            }
            else {
                time[k] = [t.getHours(), minutes].join(':');
            }
            ++k;
        }
    }
    console.log(oneDArray);
    console.log(time);

    kestrelData = new TwoDArray(oneDArray,oneDArray.length/15,15);
    console.log(kestrelData.getElement(":",0));
    graph();
}

//For testing
function displayContents(contents) {
    let output = document.getElementById('file-content');
    output.textContent = contents;
}

//TODO: Sort columns into individual arrays!



function TwoDArray(oneDArray, rows, columns){
    if(rows*columns !== oneDArray.length) {   // Error check for valid matrix TODO: Exception handle
    }
    console.log(this.size = oneDArray.length);
    this.rows = rows;
    this.columns = columns;
    this.oneDArray = oneDArray;
    this.data = [];
    for(let i=0; i<this.columns; i++){
        this.data[i] = this.getElement(":",i);
    }
    console.log(this.data);
}

TwoDArray. prototype.getElement = function(row = ":", column = ":"){
    let i=0;
    let j=0;
    let selection = [];

    /*TODO: HANDLE EXCEPTION
    if (row<this.rows || column<this.columns){
        console.log("interpreted as error");
    }
*/
    if(row === ":" && column === ":"){
        return this.data;
    }

    else if(row === ":"){
        for(let j=column;j<this.size;j+=this.columns){
            selection[i] =  this.oneDArray[j];
            i++;
        }
        return selection;
    }

    else if(column === ":"){
        for(i=this.columns*row;i<this.columns*row+this.columns;i++){
            selection[j] =  this.oneDArray[i];
            j++;
        }
        return selection;
    }
    else {
        return this.data[row * this.columns + column];
    }
};


// based on prepared DOM, initialize echarts instance
    myChart = echarts.init(document.getElementById('main'));
// specify chart configuration item and data
function graph() {
    option = {
        title: {
            text: samplingDate,
        },
        tooltip: {},
        legend: {
            data: [weatherVariables[state]]
        },
        xAxis: {

            data: time,
        },
        yAxis: [
            {
                type : 'value',
                axisLabel : {
                    formatter: '{value} ' +  units[state],
                },
                name: weatherVariables[state],
                nameLocation: 'middle',
                nameGap: 70
            }
        ],
        series: [{
            name: weatherVariables[state],
            type: 'line',
            data: kestrelData.getElement(":",state),
            color: dataColors[state],
        }],
        grid: [{
           left: '20%',
        }],
    };
    myChart.setOption(option);
}console.log(state);