angular.module("app.directives")
.directive("flotChart", [function() {
  return {
    restrict: "A",
    link: function(scope, elem, attrs){

      var chart = null;
      var chartoptions = {series: {
        lines: {show:!0,fill:!0, fillColor: {colors: [{opacity:0},{opacity:.3}]}},
        points: {show:!0,lineWidth:2,fill:!0,fillColor:"#ffffff",symbol:"circle",radius:5}
    },
    colors: ["#31C0BE","#8170CA","#E87352"],
    tooltip: !0,
    tooltipOpts: {defaultTheme:!1},
    grid: {hoverable:!0,clickable:!0,tickColor:"#f9f9f9",borderWidth:1,borderColor:"#eeeeee"},
    xaxis: {ticks: [[1,"Jan."],[2,"Feb."],[3,"Mar."],[4,"Apr."],[5,"May"],[6,"June"],[7,"July"],[8,"Aug."],[9,"Sept."],[10,"Oct."],[11,"Nov."],[12,"Dec."]]}
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