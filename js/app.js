//GLobals
//Canvas for chart
var canvasChart = document.createElement("canvas");
var contextChart = canvasChart.getContext("2d");
canvasChart.width = $('.main').width()-10;
canvasChart.height = 300;

document.getElementById('chart').appendChild(canvasChart);

var chart; 
var dataChart = {
        labels : [],
        datasets : [
            {
                fillColor : "rgba(243,87,74,0.5)",
                strokeColor : "rgba(243,87,74,1)",
                pointColor : "rgba(243,87,74,1)",
                pointStrokeColor : "#fff",
                data : []
            },
            {
                fillColor : "rgba(84, 77, 243,0.5)",
                strokeColor : "rgba(84, 77, 243,1)",
                pointColor : "rgba(84, 77, 243,1)",
                pointStrokeColor : "#fff",
                data : []
            }
        ]
    };
//Events
var events;
var Event = function(data){
    this.title = data.title;
    this.start_time = data.start_time;
    this.stop_time = data.stop_time;
    this.venue_address = data.venue_address;
    this.venue = data.venue_name;
    if(typeof(data.image) != 'undefined' && data.image != null){
        this.image = data.image.medium.url;
        this.html = '<li><img src="'+this.image+'"></img>'+this.title+'</li>';
    }else{
         this.html = '<li>'+this.title+'</li>';
    }
}
var createWeatherChart = function(data){
    //Reset chart
    dataChart.labels = [];
    dataChart.datasets[0].data = [];
    dataChart.datasets[1].data = [];
    
    for(var i = 0; i< data.length; i++){
        dataChart.labels.push(data[i].day_of_week);
        var celsiusHigh = (data[i].high - 32) /1.8;
        var celsiusLow = (data[i].low - 32) /1.8;
        dataChart.datasets[0].data.push(celsiusHigh);
        dataChart.datasets[1].data.push(celsiusLow);
    }
    chart = new Chart(contextChart).Line(dataChart,{});
}

var createEvents = function(events){
    console.log(events);
    $('#events').html('');
    $('#ammount').html('<span class="badge badge-success">'+events.event.length+'</span>');
    for (var i = 0; i< events.event.length; i++){
        var event = new Event(events.event[i]);
        $('#events').append(event.html);
    }
}

var wikipediaHTMLResult = function(data) {
    console.log(data);
    var readData = $('<div>' + data.parse.text["*"] + '</div>');
 
    // handle redirects
    var redirect = readData.find('li:contains("REDIRECT") a').text();
    if(redirect != '') {
    	callWikipediaAPI(redirect);
        return;
    }
    
    var box = readData.find('.infobox');
    
    var binomialName    = box.find('.binomial').text();
    var fishName        = box.find('th').first().text();
    var imageURL        = null;
 
    // Check if page has images
    if(data.parse.images.length >= 1) {
        imageURL        = box.find('img').first().attr('src');
    }
    
    //$('#wikipedia').append('<div><img src="'+ imageURL + '"/>'+ fishName +' <i>('+ binomialName +')</i></div>');
    $('#wikipedia').html(readData);
};
 
function callWikipediaAPI(wikipediaPage) {
	// http://www.mediawiki.org/wiki/API:Parsing_wikitext#parse
    $.getJSON('http://en.wikipedia.org/w/api.php?action=parse&format=json&callback=?', {page:wikipediaPage, prop:'text|images', uselang:'en'}, wikipediaHTMLResult);
}

var getData = function(){
   
    
    var ajax = $.ajax({
        data: {
            '_method' : 'getForecasts',
            'location' : $('#city').val(),
        },
        url: 'https://george-vustrey-weather.p.mashape.com/api.php',
        headers:{'X-Mashape-Authorization' : 'cK5S0GMLvUI3dXNPdesjPDBKc1OOt3g4'}
        }
    ).done(function(data) { createWeatherChart(data); })
    .fail(function() { alert("error"); });
    
  
    //Events
    var oArgs = {
        app_key: '8qVgwWD8MzQRRdF7',
        l: $('#city').val(),
        page_size: 25
    };
    EVDB.API.call("/events/search", oArgs, function(oData)
    {   
        createEvents(oData.events);
    });
    
    //Wikipedia
    callWikipediaAPI($('#city').val());
}

var clearData = function(){
    $('#events').html('');
    dataChart.labels = [];
    dataChart.datasets[0].data = [];
    dataChart.datasets[1].data = [];
    chart = new Chart(contextChart).Line(dataChart,{});
    $('#wikipedia').html('');
}

//Only place where I do use JQuery. 
var doBindings = function(){
    $('#city').bind('keypress', function(e) {
    
        var code = (e.keyCode ? e.keyCode : e.which);
        console.log(code);
         if(code == 13) { //Enter keycode
             getData();
              $('#information').show();
              $('#accordion2').collapse().css({'height' : 'auto !important'});
              $('.main').hide();
              $('.menu').show();
         }
    });
    
    $('.back').bind('click',function(e){
        $('.main').show();
        $('.menu').hide();
        $('#information').hide();
        clearData();
    });
}
$(document).ready(function(){
    doBindings();  
    $('#information').hide();
    
});

