angular.module("app.directives")
.directive('customChart', function(){
  return{
    restrict: 'A',
    link: function(scope, elem, attrs){

      var chart = null;
      var chartoptions = {
        series:{pie: {show: true, innerRadius: .3}},
        legend: {show: false},
        grid: {hoverable: !0, clickable: !0},
        colors: ["#60CD9B", "#66B5D7", "#EEC95A", "#E87352"],
        tooltip: !0,
        tooltipOpts: {content: "%p.0%, %s", defaultTheme: !1}
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
};
})