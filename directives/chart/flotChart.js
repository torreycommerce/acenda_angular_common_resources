angular.module("app.directives")
.directive("flotChart", [function() {
  return {
    restrict: "A",
    link: function(scope, elem, attrs){

      var chart = null;
      var chartoptions = {series: {
        lines: {show:1,fill:!0, fillColor: {colors: [{opacity:0.3},{opacity:.3}]}},
        points: {show:!0,lineWidth:2,fill:!0,fillColor:"#ffffff",symbol:"circle",radius:3}
    },
    colors: ["#31C0BE","#8170CA","#E87352"],
    tooltip: !0,
    tooltipOpts: {content: "%s %y", defaultTheme: !1},
    grid: {hoverable:!0,clickable:!0,tickColor:"#f9f9f9",borderWidth:1,borderColor:"#eeeeee"},
              // colors: ["#1ab394", "#464f88"],
    xaxis: { ticks: [[1, "Jan"], [2, "Feb"], [3, "Mar"], [4, "Apr"], [5, "May"], [6, "Jun"], [7, "Jul"], [8, "Aug"], [9, "Sep"], [10, "Oct"], [11, "Nov"], [12, "Dec"]] } 
};

scope.$watch('datainput', function(newValue, oldValue){
  if(!chart)
  {
    chart = $.plot(elem, newValue , chartoptions);
    elem.show();
}
chart.setData(newValue);
chart.setupGrid();
chart.draw();
}, true);

}
}
}
])