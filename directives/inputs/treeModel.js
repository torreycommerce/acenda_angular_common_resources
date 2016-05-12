angular.module("app.directives")
.directive( 'treeModel', ['$compile', function( $compile ) {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      //tree id
      var treeId = attrs.treeId;

      //tree model
      var treeModel = attrs.treeModel;

      //node id
      var nodeId = attrs.nodeId || '';

      //node label
      var nodeLabel = attrs.nodeLabel || 'label';

      //children
      var nodeChildren = attrs.nodeChildren || 'children';

      //tree template
      var template =
      '<ul>' +
      '<li data-ng-repeat="node in ' + treeModel + '">' +
      '<i ng-class="[node.type, node.collapsed]" data-ng-click="' + treeId + '.selectNodeHead(node)"></i>' +
      '<span data-ng-class="node.selected" data-ng-click="' + treeId + '.selectNodeLabel(node)">{{node.' + nodeLabel + '}}</span>' +
      '<div data-ng-hide="node.collapsed" data-tree-id="' + treeId + '" data-tree-model="node.' + nodeChildren + '" data-node-id="' + nodeId + '" data-node-label=' + nodeLabel + ' data-node-children=' + nodeChildren + '></div>' +
      '<div ng-show="node.loading"><i class="fa fa-spin fa-spinner"></i></div>' +
      '</li>' +
      '</ul>';

      //check tree id, tree model
      if(treeId && treeModel)
      {
        //root node
        if(attrs.angularTreeview)
        {
          //create tree object if not exists
          scope[treeId] = scope[treeId] || {};

          //if node head clicks,
          scope[treeId].selectNodeHead = scope[treeId].selectNodeHead || function( selectedNode )
          {
            //Collapse or Expand
            selectedNode.collapsed = !selectedNode.collapsed;
          };

            //if node label clicks,
            scope[treeId].selectNodeLabel = scope[treeId].selectNodeLabel || function( selectedNode)
            {
              //remove highlight from previous node
              if( scope[treeId].currentNode && scope[treeId].currentNode.selected ) {
                scope[treeId].currentNode.selected = undefined;
              }

              //set highlight to selected node
              selectedNode.selected = 'selected';

              //set currentNode
              scope[treeId].currentNode = selectedNode;
            };
        }
        //Rendering template.
        element.html('').append($compile(template)(scope));
      }
    }
  };
}])