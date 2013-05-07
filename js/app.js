//GLobals
var spinner;
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
    if(events != null && typeof(events.event != 'undefined')){
        console.log(events);
        
        $('#ammount').html('<span class="badge badge-success">'+events.event.length+'</span>');
        for (var i = 0; i< events.event.length; i++){
            var event = new Event(events.event[i]);
            $('#events').append(event.html);
        }
    }else{
    
        $('#events').html("<li><h4 class='text-center error'>Sorry! We didn't found events for that city</h4></li>");
    }
}

var wikipediaHTMLResult = function(data) {
    console.log(data);
    if(typeof(data.parse) != 'undefined'){
        var readData = $('<div>' + data.parse.text["*"] + '</div>');
     
        // handle redirects
        var redirect = readData.find('li:contains("REDIRECT") a').text();
        if(redirect != '') {
            callWikipediaAPI(redirect);
            return;
        }
        var a = readData.find('a');
        a.attr('href', 'http://en.wikipedia.org'+a.attr('href'));
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
    }else{
        $('#wikipedia').html("<h4 class='text-center error'>Sorry! We didn't found that page</h4>");
    }
    
};
 
function callWikipediaAPI(wikipediaPage) {
	// http://www.mediawiki.org/wiki/API:Parsing_wikitext#parse
    $.getJSON('http://en.wikipedia.org/w/api.php?action=parse&format=json&callback=?', {page:wikipediaPage, prop:'text|images', uselang:'en'}, wikipediaHTMLResult);
   //$('#wikipedia').html('<iframe src="http://en.wikipedia.org/wiki/'+wikipediaPage+'"></iframe>');
}

var getData = function(){
   
    showSpinner();
    var ajax = $.ajax({
        data: {
            '_method' : 'getForecasts',
            'location' : $('#city').val(),
        },
        url: 'https://george-vustrey-weather.p.mashape.com/api.php',
        headers:{'X-Mashape-Authorization' : 'cK5S0GMLvUI3dXNPdesjPDBKc1OOt3g4'}
        }
    ).done(function(data) { hideSpinner(); createWeatherChart(data); })
    .fail(function() { showMessage(error) });
    
  
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
     $('#chart').html('');
    document.getElementById('chart').appendChild(canvasChart);
    
    chart = new Chart(contextChart).Line(dataChart,{});
    $('#wikipedia').html('');
}

var homePage = function(){
    $('.main').show();
    $('.menu').hide();
    $('#information').hide();
    clearData();
}

var showSpinner = function(){
    var target = document.getElementById('information');
    var opts = {top: $('#information').height()/4 +'px', left:$('#information').width()/2 -10 +'px'};
    console.log(opts);
    spinner = new Spinner(opts).spin(target);
}

var hideSpinner = function(){
    spinner.stop();
}

var showMessage= function(type){
    $('#chart').html('<h4 class="text-center error">Sorry! '+ $('#city').val() + ' was not found. Please type it in english if you did not.</h4>');
}

 
var doBindings = function(){
    $('#city').bind('keypress', function(e) {
    
        var code = (e.keyCode ? e.keyCode : e.which);

         if(code == 13) { //Enter keycode
             getData();
              $('#information').show();
              $('#accordion2').collapse().css({'height' : 'auto !important'});
              $('.main').hide();
              $('.menu').show();
         }
    });
    
    $('.back').bind('click',function(e){
        homePage();
       
    });
}
$(document).ready(function(){
    doBindings();  
    $('#information').hide();
    
});

