'use strict';

/**
 * Binds a ACE Editor widget
 */
angular.module('ui.ace-diff', [])
  .constant('uiAceConfig', {})
  .directive('uiAceDiff', ['uiAceConfig','$timeout', function (uiAceConfig,$timeout) {

    if (angular.isUndefined(window.ace)) {
      throw new Error('ui-ace-diff need ace to work... (o rly?)');
    }
    var Range = window.ace.require('ace/range').Range;

    // some constants from old acediff
    var C = {
      DIFF_EQUAL: 0,
      DIFF_DELETE: -1,
      DIFF_INSERT: 1,
      EDITOR_RIGHT: 'right',
      EDITOR_LEFT: 'left',
      RTL: 'rtl',
      LTR: 'ltr',
      SVG_NS: 'http://www.w3.org/2000/svg',
      DIFF_GRANULARITY_SPECIFIC: 'specific',
      DIFF_GRANULARITY_BROAD: 'broad'
    };
    var classes = {
        gutterID: '#uiacediff-gutter',
        diff: 'uiacediff-diff',
        connector: 'uiacediff-connector',
        newCodeConnectorLink: 'uiacediff-new-code-connector-copy',
        newCodeConnectorLinkContent: '&#128465;',
        deletedCodeConnectorLink: 'uiacediff-deleted-code-connector-copy',
        deletedCodeConnectorLinkContent: '&#8592;',
        copyRightContainer: 'uiacediff-copy-right',
        copyLeftContainer: 'uiacediff-copy-left'
    };
    var setOptions = function(scope,acee, session, opts,ngModel) {

      // sets the ace worker path, if running from concatenated
      // or minified source
      if (angular.isDefined(opts.workerPath)) {
        var config = window.ace.require('ace/config');
        config.set('workerPath', opts.workerPath);
      }
      // ace requires loading
      if (angular.isDefined(opts.require)) {
        opts.require.forEach(function (n) {
            window.ace.require(n);
        });
      }
      // Boolean options
      if (angular.isDefined(opts.showGutter)) {
        acee.renderer.setShowGutter(opts.showGutter);
      }
      if (angular.isDefined(opts.useWrapMode)) {
        session.setUseWrapMode(opts.useWrapMode);
      }
      if (angular.isDefined(opts.showInvisibles)) {
        acee.renderer.setShowInvisibles(opts.showInvisibles);
      }
      if (angular.isDefined(opts.showIndentGuides)) {
        acee.renderer.setDisplayIndentGuides(opts.showIndentGuides);
      }
      if (angular.isDefined(opts.useSoftTabs)) {
        session.setUseSoftTabs(opts.useSoftTabs);
      }
      if (angular.isDefined(opts.showPrintMargin)) {
        acee.setShowPrintMargin(opts.showPrintMargin);
      }
      acee.$blockScrolling = Infinity
      // commands
      if (angular.isDefined(opts.disableSearch) && opts.disableSearch) {
        acee.commands.addCommands([
          {
            name: 'unfind',
            bindKey: {
              win: 'Ctrl-F',
              mac: 'Command-F'
            },
            exec: function () {
              return false;
            },
            readOnly: true
          }
        ]);
      }

      // Basic options
      if (angular.isString(opts.theme)) {
        acee.setTheme('ace/theme/' + opts.theme);
      }
      if (angular.isString(opts.mode)) {
        session.setMode('ace/mode/' + opts.mode);
      }
      // Advanced options
      if (angular.isDefined(opts.firstLineNumber)) {
        if (angular.isNumber(opts.firstLineNumber)) {
          session.setOption('firstLineNumber', opts.firstLineNumber);
        } else if (angular.isFunction(opts.firstLineNumber)) {
          session.setOption('firstLineNumber', opts.firstLineNumber());
        }
      }

      // advanced options
      var key, obj;
      if (angular.isDefined(opts.advanced)) {
          for (key in opts.advanced) {
              // create a javascript object with the key and value
              obj = { name: key, value: opts.advanced[key] };
              // try to assign the option to the ace editor
              acee.setOption(obj.name, obj.value);
          }
      }

      // advanced options for the renderer
      if (angular.isDefined(opts.rendererOptions)) {
          for (key in opts.rendererOptions) {
              // create a javascript object with the key and value
              obj = { name: key, value: opts.rendererOptions[key] };
              // try to assign the option to the ace editor
              acee.renderer.setOption(obj.name, obj.value);
          }
      }
      // onLoad callbakcks
      angular.forEach(opts.callbacks, function (cb) {     
        if (angular.isFunction(scope.$parent[cb])) { 
          scope.$parent[cb](acee);
        }
      });
    };

    return {
      restrict: 'EA',
      require: '?ngModel',
      scope: {'leftFile':'=','rightFile':'=','showDiffs':'=','hasDiffs':'='},
      template: '<div id="flex-container"><div id="left-container"><div id="uiacediff-left-editor" class="editor-left"></div></div><div id="uiacediff-gutter"></div><div id="right-container"><div id="uiacediff-right-editor" class="editor-right"></div></div></div>',
      link: function (scope, elm, attrs,ngModel) {
      
         var diffs = [];
        /**
         * Corresponds the uiAceConfig ACE configuration.
         * @type object
         */
        var options = uiAceConfig.ace || {};

        /**
         * uiAceConfig merged with user options via json in attribute or data binding
         * @type object
         */
        var opts = angular.extend({}, options, scope.$eval(attrs.uiAceDiff));
        // instantiate the editors in an internal data structure that will store a little info about the diffs and
        // editor content
        var editors = {
          left: {
            ace:  window.ace.edit(elm[0].querySelector('.editor-left')),
            markers: [],
            lineLengths: []
          },
          right: {
            ace: window.ace.edit(elm[0].querySelector('.editor-right')),
            markers: [],
            lineLengths: []
          },
          editorHeight: null
        };
        var lineHeight = 16;
        var connectorYOffset;        
        var gutterSVG=null;
        var copyRightContainer,copyLeftContainer;
        var gutterHeight;
        var gutterWidth;
        var diffGranularity = C.DIFF_GRANULARITY_BROAD;
        /**
         * ACE editor session.
         * @type object
         * @see [EditSession]{@link http://ace.c9.io/#nav=api&api=edit_session}
         */
        var sessionleft = editors.left.ace.getSession();
        var sessionright = editors.right.ace.getSession();
        /**
         * Reference to a change listener created by the listener factory.
         * @function
         * @see listenerFactory.onChange
         */
        var onChangeListener;

        /**
         * Reference to a blur listener created by the listener factory.
         * @function
         * @see listenerFactory.onBlur
         */
        var onBlurListener;

        function addEventHandlers(acediff) {
          var leftLastScrollTime = new Date().getTime(),
              rightLastScrollTime = new Date().getTime(),
              now;
          scope.$on("dmessage", function (e, msg) {
            clearDiffs();
            decorate();            
            console.log(msg);
          });

         editors.left.ace.getSession().on('changeScrollTop', function(scroll) {
            now = new Date().getTime();
            if (rightLastScrollTime + 50 < now) {
              updateGap(acediff, 'left', scroll);
            }
          });

          editors.right.ace.getSession().on('changeScrollTop', function(scroll) {
            now = new Date().getTime();
            if (leftLastScrollTime + 50 < now) {
              updateGap(acediff, 'right', scroll);
            }
          });
        }
        function debounce(func, wait, immediate) {
          var timeout;
          return function() {
            var context = this, args = arguments;
            var later = function() {
              timeout = null;
              if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
          };
        }

        // since the right side is read-only, we're just going to trash what we have on the left rather than copy it over
        function trash(acediff,e,dir) {
          var diffIndex = parseInt(e.target.getAttribute('data-diff-index'), 10);
          var diff = diffs[diffIndex];
          var sourceEditor, targetEditor;

          var startLine, endLine, targetStartLine, targetEndLine;
          if (dir === C.LTR) {
            sourceEditor = editors.left;
            targetEditor = editors.right;
            startLine = diff.leftStartLine;
            endLine = diff.leftEndLine;
            targetStartLine = diff.rightStartLine;
            targetEndLine = diff.rightEndLine;
          } else {
            sourceEditor = editors.right;
            targetEditor = editors.left;
            startLine = diff.rightStartLine;
            endLine = diff.rightEndLine;
            targetStartLine = diff.leftStartLine;
            targetEndLine = diff.leftEndLine;
          }
          var totalLines = sourceEditor.ace.getSession().getLength();
          var contentToInsert = '';
          for (var i=0; i<totalLines; i++) {
            if(i>=startLine && i<endLine) continue;
            contentToInsert += getLine(sourceEditor, i);
            if(i!=totalLines-1) contentToInsert += '\n';
          }

          // keep track of the scroll height
          var h = sourceEditor.ace.getSession().getScrollTop();
          sourceEditor.ace.getSession().setValue(contentToInsert);
          sourceEditor.ace.getSession().setScrollTop(parseInt(h));  
          do_diffs();
        }  
        function copy(acediff, e, dir) {
          var diffIndex = parseInt(e.target.getAttribute('data-diff-index'), 10);
          var diff = diffs[diffIndex];
          var sourceEditor, targetEditor;

          var startLine, endLine, targetStartLine, targetEndLine;
          if (dir === C.LTR) {
            sourceEditor = editors.left;
            targetEditor = editors.right;
            startLine = diff.leftStartLine;
            endLine = diff.leftEndLine;
            targetStartLine = diff.rightStartLine;
            targetEndLine = diff.rightEndLine;
          } else {
            sourceEditor = editors.right;
            targetEditor = editors.left;
            startLine = diff.rightStartLine;
            endLine = diff.rightEndLine;
            targetStartLine = diff.leftStartLine;
            targetEndLine = diff.leftEndLine;
          }

          var contentToInsert = '';
          for (var i=startLine; i<endLine; i++) {
            contentToInsert += getLine(sourceEditor, i) + '\n';
          }

          var startContent = '';
          for (var i=0; i<targetStartLine; i++) {
            startContent += getLine(targetEditor, i) + '\n';
          }

          var endContent = '';
          var totalLines = targetEditor.ace.getSession().getLength();
          for (var i=targetEndLine; i<totalLines; i++) {
            endContent += getLine(targetEditor, i);
            if (i<totalLines-1) {
              endContent += '\n';
            }
          }

          endContent = endContent.replace(/\s*$/, '');

          // keep track of the scroll height
          var h = targetEditor.ace.getSession().getScrollTop();
          targetEditor.ace.getSession().setValue(startContent + contentToInsert + endContent);
          targetEditor.ace.getSession().setScrollTop(parseInt(h));
          //scope.$broadcast('dmessage', 'force reset of diff tool')   
          do_diffs();
        }


        function getLineLengths(editor) {
          var lines = editor.ace.getSession().doc.getAllLines();
          var lineLengths = [];
          lines.forEach(function(line) {
            lineLengths.push(line.length + 1); // +1 for the newline char
          });
          return lineLengths;
        }
        // generates a Bezier curve in SVG format
        function getCurve(startX, startY, endX, endY) {
          var w = endX - startX;
          var halfWidth = startX + (w / 2);

          // position it at the initial x,y coords
          var curve = 'M ' + startX + ' ' + startY +

            // now create the curve. This is of the form "C M,N O,P Q,R" where C is a directive for SVG ("curveto"),
            // M,N are the first curve control point, O,P the second control point and Q,R are the final coords
            ' C ' + halfWidth + ',' + startY + ' ' + halfWidth + ',' + endY + ' ' + endX + ',' + endY;

          return curve;
        }


        // called onscroll. Updates the gap to ensure the connectors are all lining up
        function updateGap(acediff, editor, scroll) {

          clearDiffs();
          decorate();

          // reposition the copy containers containing all the arrows
          positionCopyContainers(acediff);
        }


        function clearDiffs() {
          editors.left.markers.forEach(function(marker) {
            editors.left.ace.getSession().removeMarker(marker);
          });
          editors.right.markers.forEach(function(marker) {
            editors.right.ace.getSession().removeMarker(marker);
          });
        }
        // Hide right side and gutter
        function hideRight() {
            elm[0].querySelector('#right-container').style.display = 'none';
            elm[0].querySelector('#uiacediff-gutter').style.display = 'none';            
        }
        function repaint() {

        }

        function showRight() {
            elm[0].querySelector('#right-container').style.display = 'block';
            elm[0].querySelector('#uiacediff-gutter').style.display = 'block';
        }


        function addConnector(acediff, leftStartLine, leftEndLine, rightStartLine, rightEndLine) {
          var leftScrollTop  = editors.left.ace.getSession().getScrollTop();
          var rightScrollTop = editors.right.ace.getSession().getScrollTop();

          // All connectors, regardless of ltr or rtl have the same point system, even if p1 === p3 or p2 === p4
          //  p1   p2
          //
          //  p3   p4

          connectorYOffset = 1;

          var p1_x = -1;
          var p1_y = (leftStartLine * lineHeight) - leftScrollTop + 0.5;
          var p2_x = gutterWidth + 1;
          var p2_y = rightStartLine * lineHeight - rightScrollTop + 0.5;
          var p3_x = -1;
          var p3_y = (leftEndLine * lineHeight) - leftScrollTop + connectorYOffset + 0.5;
          var p4_x = gutterWidth + 1;
          var p4_y = (rightEndLine * lineHeight) - rightScrollTop + connectorYOffset + 0.5;
          var curve1 = getCurve(p1_x, p1_y, p2_x, p2_y);
          var curve2 = getCurve(p4_x, p4_y, p3_x, p3_y);

          var verticalLine1 = 'L' + p2_x + ',' + p2_y + ' ' + p4_x + ',' + p4_y;
          var verticalLine2 = 'L' + p3_x + ',' + p3_y + ' ' + p1_x + ',' + p1_y;
          var d = curve1 + ' ' + verticalLine1 + ' ' + curve2 + ' ' + verticalLine2;

          var el = document.createElementNS(C.SVG_NS, 'path');
          el.setAttribute('d', d);
          el.setAttribute('class', classes.connector);
          gutterSVG.appendChild(el);
        }


        function addCopyArrows(acediff, info, diffIndex) {
          if (info.leftEndLine > info.leftStartLine ) {
            var arrow = createArrow({
              className: classes.newCodeConnectorLink,
              topOffset: (info.leftStartLine *  lineHeight) + 3,
              tooltip: 'Remove Section',
              diffIndex: diffIndex,
              arrowContent: classes.newCodeConnectorLinkContent
            });
            arrow.addEventListener('click',function(e) {
                 trash(acediff, e, C.LTR);
            });
            copyRightContainer.appendChild(arrow);
          }

          if (info.rightEndLine > info.rightStartLine ) {
            var arrow = createArrow({
              className: classes.deletedCodeConnectorLink,
              topOffset: info.rightStartLine * lineHeight,
              tooltip: 'Copy to left',
              diffIndex: diffIndex,
              arrowContent: classes.deletedCodeConnectorLinkContent
            });
            arrow.addEventListener('click',function(e) {
                 copy(acediff, e, C.RTL);
            });

            copyLeftContainer.appendChild(arrow);
          }
        }


        function positionCopyContainers(acediff) {
          var leftTopOffset = editors.left.ace.getSession().getScrollTop();
          var rightTopOffset = editors.right.ace.getSession().getScrollTop();

          copyRightContainer.style.cssText = 'top: ' + (-leftTopOffset) + 'px';
          copyLeftContainer.style.cssText = 'top: ' + (-rightTopOffset) + 'px';
        }


        /**
         * This method takes the raw diffing info from the Google lib and returns a nice clean object of the following
         * form:
         * {
         *   leftStartLine:
         *   leftEndLine:
         *   rightStartLine:
         *   rightEndLine:
         * }
         *
         * Ultimately, that's all the info we need to highlight the appropriate lines in the left + right editor, add the
         * SVG connectors, and include the appropriate <<, >> arrows.
         *
         * Note: leftEndLine and rightEndLine are always the start of the NEXT line, so for a single line diff, there will
         * be 1 separating the startLine and endLine values. So if leftStartLine === leftEndLine or rightStartLine ===
         * rightEndLine, it means that new content from the other editor is being inserted and a single 1px line will be
         * drawn.
         */
        function computeDiff(acediff, diffType, offsetLeft, offsetRight, diffText) {
          var lineInfo = {};

          // this was added in to hack around an oddity with the Google lib. Sometimes it would include a newline
          // as the first char for a diff, other times not - and it would change when you were typing on-the-fly. This
          // is used to level things out so the diffs don't appear to shift around
          var newContentStartsWithNewline = /^\n/.test(diffText);

          if (diffType === C.DIFF_INSERT) {

            // pretty confident this returns the right stuff for the left editor: start & end line & char
            var info = getSingleDiffInfo(editors.left, offsetLeft, diffText);

            // this is the ACTUAL undoctored current line in the other editor. It's always right. Doesn't mean it's
            // going to be used as the start line for the diff though.
            var currentLineOtherEditor = getLineForCharPosition(editors.right, offsetRight);
            var numCharsOnLineOtherEditor = getCharsOnLine(editors.right, currentLineOtherEditor);
            var numCharsOnLeftEditorStartLine = getCharsOnLine(editors.left, info.startLine);
            var numCharsOnLine = getCharsOnLine(editors.left, info.startLine);

            // this is necessary because if a new diff starts on the FIRST char of the left editor, the diff can comes
            // back from google as being on the last char of the previous line so we need to bump it up one
            var rightStartLine = currentLineOtherEditor;
            if (numCharsOnLine === 0 && newContentStartsWithNewline) {
              newContentStartsWithNewline = false;
            }
            if (info.startChar === 0 && isLastChar(editors.right, offsetRight, newContentStartsWithNewline)) {
              rightStartLine = currentLineOtherEditor + 1;
            }

            var sameLineInsert = info.startLine === info.endLine;

            // whether or not this diff is a plain INSERT into the other editor, or overwrites a line take a little work to
            // figure out. This feels like the hardest part of the entire script.
            var numRows = 0;
            if (

              // dense, but this accommodates two scenarios:
              // 1. where a completely fresh new line is being inserted in left editor, we want the line on right to stay a 1px line
              // 2. where a new character is inserted at the start of a newline on the left but the line contains other stuff,
              //    we DO want to make it a full line
              (info.startChar > 0 || (sameLineInsert && diffText.length < numCharsOnLeftEditorStartLine)) &&

              // if the right editor line was empty, it's ALWAYS a single line insert [not an OR above?]
              numCharsOnLineOtherEditor > 0 &&

              // if the text being inserted starts mid-line
              (info.startChar < numCharsOnLeftEditorStartLine)) {
              numRows++;
            }

            lineInfo = {
              leftStartLine: info.startLine,
              leftEndLine: info.endLine + 1,
              rightStartLine: rightStartLine,
              rightEndLine: rightStartLine + numRows
            };

          } else {
            var info = getSingleDiffInfo(editors.right, offsetRight, diffText);

            var currentLineOtherEditor = getLineForCharPosition(editors.left, offsetLeft);
            var numCharsOnLineOtherEditor = getCharsOnLine(editors.left, currentLineOtherEditor);
            var numCharsOnRightEditorStartLine = getCharsOnLine(editors.right, info.startLine);
            var numCharsOnLine = getCharsOnLine(editors.right, info.startLine);

            // this is necessary because if a new diff starts on the FIRST char of the left editor, the diff can comes
            // back from google as being on the last char of the previous line so we need to bump it up one
            var leftStartLine = currentLineOtherEditor;
            if (numCharsOnLine === 0 && newContentStartsWithNewline) {
              newContentStartsWithNewline = false;
            }
            if (info.startChar === 0 && isLastChar(editors.left, offsetLeft, newContentStartsWithNewline)) {
              leftStartLine = currentLineOtherEditor + 1;
            }

            var sameLineInsert = info.startLine === info.endLine;
            var numRows = 0;
            if (

              // dense, but this accommodates two scenarios:
              // 1. where a completely fresh new line is being inserted in left editor, we want the line on right to stay a 1px line
              // 2. where a new character is inserted at the start of a newline on the left but the line contains other stuff,
              //    we DO want to make it a full line
              (info.startChar > 0 || (sameLineInsert && diffText.length < numCharsOnRightEditorStartLine)) &&

              // if the right editor line was empty, it's ALWAYS a single line insert [not an OR above?]
              numCharsOnLineOtherEditor > 0 &&

              // if the text being inserted starts mid-line
              (info.startChar < numCharsOnRightEditorStartLine)) {
                numRows++;
            }

            lineInfo = {
              leftStartLine: leftStartLine,
              leftEndLine: leftStartLine + numRows,
              rightStartLine: info.startLine,
              rightEndLine: info.endLine + 1
            };
          }

          return lineInfo;
        }
        function normalizeContent(value = '') {
          const normalized = value.replace(/\r\n/g, '\n').replace(/\r/g,'\n');
          return normalized;
        }

        // helper to return the startline, endline, startChar and endChar for a diff in a particular editor. Pretty
        // fussy function
        function getSingleDiffInfo(editor, offset, diffString) {
          var info = {
            startLine: 0,
            startChar: 0,
            endLine: 0,
            endChar: 0
          };
          var endCharNum = offset + diffString.length;
          var runningTotal = 0;
          var startLineSet = false,
              endLineSet = false;

          editor.lineLengths.forEach(function(lineLength, lineIndex) {
            runningTotal += lineLength;

            if (!startLineSet && offset < runningTotal) {
              info.startLine = lineIndex;
              info.startChar = offset - runningTotal + lineLength;
              startLineSet = true;
            }

            if (!endLineSet && endCharNum <= runningTotal) {
              info.endLine = lineIndex;
              info.endChar = endCharNum - runningTotal + lineLength;
              endLineSet = true;
            }
          });

          // if the start char is the final char on the line, it's a newline & we ignore it
          if (info.startChar > 0 && getCharsOnLine(editor, info.startLine) === info.startChar) {
            info.startLine++;
            info.startChar = 0;
          }

          // if the end char is the first char on the line, we don't want to highlight that extra line
          if (info.endChar === 0) {
            info.endLine--;
          }

          var endsWithNewline = /\n$/.test(diffString);
          if (info.startChar > 0 && endsWithNewline) {
            info.endLine++;
          }

          return info;
        }


        // note that this and everything else in this script uses 0-indexed row numbers
        function getCharsOnLine(editor, line) {
          return getLine(editor, line).length;
        }


        function getLine(editor, line) {
          return editor.ace.getSession().doc.getLine(line);
        }


        function getLineForCharPosition(editor, offsetChars) {
          var lines = editor.ace.getSession().doc.getAllLines(),
              foundLine = 0,
              runningTotal = 0;

          for (var i=0; i<lines.length; i++) {
            runningTotal += lines[i].length + 1; // +1 needed for newline char
            if (offsetChars <= runningTotal) {
              foundLine = i;
              break;
            }
          }
          return foundLine;
        }


        function isLastChar(editor, char, startsWithNewline) {
          var lines = editor.ace.getSession().doc.getAllLines(),
              runningTotal = 0,
              isLastChar = false;

          for (var i=0; i<lines.length; i++) {
            runningTotal += lines[i].length + 1; // +1 needed for newline char
            var comparison = runningTotal;
            if (startsWithNewline) {
              comparison--;
            }

            if (char === comparison) {
              isLastChar = true;
              break;
            }
          }
          return isLastChar;
        }


        function createArrow(info) {
          var el = document.createElement('div');
          var props = {
            'class': info.className,
            'style': 'top:' + info.topOffset + 'px',
            title: info.tooltip,
            'data-diff-index': info.diffIndex
          };
          for (var key in props) {
            el.setAttribute(key, props[key]);
          }
          el.innerHTML = info.arrowContent;
          return el;
        }


        function createGutter(acediff) {
          gutterHeight = elm[0].querySelector(classes.gutterID).clientHeight;
          gutterWidth = elm[0].querySelector(classes.gutterID).clientWidth;

          var leftHeight = getTotalHeight(acediff, C.EDITOR_LEFT);
          var rightHeight = getTotalHeight(acediff, C.EDITOR_RIGHT);
          var height = Math.max(leftHeight, rightHeight, gutterHeight);

          gutterSVG = document.createElementNS(C.SVG_NS, 'svg');
          gutterSVG.setAttribute('width', gutterWidth);
          gutterSVG.setAttribute('height', height);

          elm[0].querySelector(classes.gutterID).appendChild(gutterSVG);
        }

        // acediff.editors.left.ace.getSession().getLength() * acediff.lineHeight
        function getTotalHeight(acediff, editor) {
          var ed = (editor === C.EDITOR_LEFT) ? editors.left : editors.right;
          return ed.ace.getSession().getLength() * lineHeight;
        }

        // creates two contains for positioning the copy left + copy right arrows
        function createCopyContainers(acediff) {
          copyRightContainer = document.createElement('div');
          copyRightContainer.setAttribute('class',classes.copyRightContainer);
          copyLeftContainer = document.createElement('div');
          copyLeftContainer.setAttribute('class', classes.copyLeftContainer);

           elm[0].querySelector(classes.gutterID).appendChild(copyRightContainer);
           elm[0].querySelector(classes.gutterID).appendChild(copyLeftContainer);
        }


        function clearGutter(acediff) {
          var gutterEl  = elm[0].querySelector(classes.gutterID);
          if(gutterSVG!==null)
             gutterEl.removeChild(gutterSVG);

          createGutter();
        }


        function clearArrows(acediff) {
            copyLeftContainer.innerHTML = '';  
            copyRightContainer.innerHTML = '';                                  
        }


        /*
         * This combines multiple rows where, say, line 1 => line 1, line 2 => line 2, line 3-4 => line 3. That could be
         * reduced to a single connector line 1=4 => line 1-3
         */
        function simplifyDiffs(acediff, diffs) {
          var groupedDiffs = [];

          function compare(val) {
            return (diffGranularity === C.DIFF_GRANULARITY_SPECIFIC) ? val < 1 : val <= 1;
          }

          diffs.forEach(function(diff, index) {
            if (index === 0) {
              groupedDiffs.push(diff);
              return;
            }

            // loop through all grouped diffs. If this new diff lies between an existing one, we'll just add to it, rather
            // than create a new one
            var isGrouped = false;
            for (var i=0; i<groupedDiffs.length; i++) {
              if (compare(Math.abs(diff.leftStartLine - groupedDiffs[i].leftEndLine)) &&
                  compare(Math.abs(diff.rightStartLine - groupedDiffs[i].rightEndLine))) {

                // update the existing grouped diff to expand its horizons to include this new diff start + end lines
                groupedDiffs[i].leftStartLine = Math.min(diff.leftStartLine, groupedDiffs[i].leftStartLine);
                groupedDiffs[i].rightStartLine = Math.min(diff.rightStartLine, groupedDiffs[i].rightStartLine);
                groupedDiffs[i].leftEndLine = Math.max(diff.leftEndLine, groupedDiffs[i].leftEndLine);
                groupedDiffs[i].rightEndLine = Math.max(diff.rightEndLine, groupedDiffs[i].rightEndLine);
                isGrouped = true;
                break;
              }
            }

            if (!isGrouped) {
              groupedDiffs.push(diff);
            }
          });

          // clear out any single line diffs (i.e. single line on both editors)
          var fullDiffs = [];
          groupedDiffs.forEach(function(diff) {
            if (diff.leftStartLine === diff.leftEndLine && diff.rightStartLine === diff.rightEndLine) {
              return;
            }
            fullDiffs.push(diff);
          });

          return fullDiffs;
        }



    // *****    



        // shows a diff in one of the two editors.
        var showDiff = function(editor, startLine, endLine, className) {
          var editor = editors[editor];

          if (endLine < startLine) { // can this occur? Just in case.
            endLine = startLine;
          }

          var classNames = className + ' ' + ((endLine > startLine) ? 'lines' : 'targetOnly');
          endLine--; // because endLine is always + 1

          // to get Ace to highlight the full row we just set the start and end chars to 0 and 1
          editor.markers.push(editor.ace.session.addMarker(new Range(startLine, 0, endLine, 1), classNames, 'fullLine'));
        }
        var decorate = function() {

          if(diffs.length) scope.hasDiffs = true; 
          else {
              scope.hasDiffs = false; 
          }
         
           if(scope.showDiffs) { 
            if(!diffs.length) {
                hideRight();
                scope.hasDiffs = false;
            } else{
                scope.hasDiffs = true;              
                showRight();
            }

            clearGutter();
            clearArrows();         
            diffs.forEach(function(info, diffIndex) {
                showDiff(C.EDITOR_LEFT, info.leftStartLine, info.leftEndLine, classes.diff);
                showDiff(C.EDITOR_RIGHT, info.rightStartLine, info.rightEndLine, classes.diff);

                addConnector(this, info.leftStartLine, info.leftEndLine, info.rightStartLine, info.rightEndLine);
                addCopyArrows(this, info, diffIndex);
            });     

          } else {         
                hideRight(); 
          }
        }
        var do_diffs = function() {
          var dmp = new diff_match_patch();
          var val1 = sessionleft.getValue();
          var val2 = sessionright.getValue();
          var diff = dmp.diff_main(val2, val1);
          dmp.diff_cleanupSemantic(diff);
          diffs = [];
          editors.left.lineLengths  = getLineLengths(editors.left);
          editors.right.lineLengths = getLineLengths(editors.right);

          // parse the raw diff into something a little more palatable
 
          var offset = {
            left: 0,
            right: 0
          };

          diff.forEach(function(chunk) {
            var chunkType = chunk[0];
            var text = chunk[1];

            // oddly, occasionally the algorithm returns a diff with no changes made
            if (text.length === 0) {
              return;
            }
            if (chunkType === C.DIFF_EQUAL) {
              offset.left += text.length;
              offset.right += text.length;
            } else if (chunkType === C.DIFF_DELETE) {
              diffs.push(computeDiff(this, C.DIFF_DELETE, offset.left, offset.right, text));
              offset.right += text.length;

            } else if (chunkType === C.DIFF_INSERT) {
              diffs.push(computeDiff(this, C.DIFF_INSERT, offset.left, offset.right, text));
              offset.left += text.length;
            }
          }, this);

          // simplify our computed diffs; this groups together multiple diffs on subsequent lines
          diffs = simplifyDiffs(this, diffs);
          // if we're dealing with too many diffs, fail silently
          if (diffs.length > 5000) {
            return;
          }
          clearDiffs();
          clearArrows();
          decorate();

        }


        /**
         * Calls a callback by checking its existing. The argument list
         * is variable and thus this function is relying on the arguments
         * object.
         * @throws {Error} If the callback isn't a function
         */
        var executeUserCallback = function () {

          /**
           * The callback function grabbed from the array-like arguments
           * object. The first argument should always be the callback.
           *
           * @see [arguments]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions_and_function_scope/arguments}
           * @type {*}
           */
          var callback = arguments[0];

          /**
           * Arguments to be passed to the callback. These are taken
           * from the array-like arguments object. The first argument
           * is stripped because that should be the callback function.
           *
           * @see [arguments]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions_and_function_scope/arguments}
           * @type {Array}
           */
          var args = Array.prototype.slice.call(arguments, 1);

          if (angular.isDefined(callback)) {
            scope.$evalAsync(function () {
              if (angular.isFunction(callback)) {
                callback(args);
              } if(angular.isFunction(scope.$parent[callback])) {
                    scope.$parent[callback](args);
              }  else {
                throw new Error('ui-ace use a function as callback.');
              }
            });
          }
        };

        /**
         * Listener factory. Until now only change listeners can be created.
         * @type object
         */
        var listenerFactory = {
          /**
           * Creates a change listener which propagates the change event
           * and the editor session to the callback from the user option
           * onChange. It might be exchanged during runtime, if this
           * happens the old listener will be unbound.
           *
           * @param callback callback function defined in the user options
           * @see onChangeListener
           */
          onChange: function (callback) {
            return function (e) {
              var newValue = sessionleft.getValue();
              var newValue2 = sessionright.getValue();

              newValue = newValue + newValue2;
              if (scope.leftFile && newValue !== ngModel.$viewValue &&
                  // HACK make sure to only trigger the apply outside of the
                  // digest loop 'cause ACE is actually using this callback
                  // for any text transformation !
                  !scope.$$phase && !scope.$root.$$phase) {
                scope.$evalAsync(function () {
                  console.log('onchange');
                  ngModel.$setViewValue(newValue);
                  scope.leftFile =sessionleft.getValue();
                  scope.rightFile =sessionright.getValue();
                  do_diffs();               
                });
              }

              executeUserCallback(callback, e, editors.left.ace);
            };
          },
          /**
           * Creates a blur listener which propagates the editor session
           * to the callback from the user option onBlur. It might be
           * exchanged during runtime, if this happens the old listener
           * will be unbound.
           *
           * @param callback callback function defined in the user options
           * @see onBlurListener
           */
          onBlur: function (callback) {
            return function () {
              executeUserCallback(callback, editors.left.ace);
            };
          }
        };

          sessionleft.setUseWorker(false);
          sessionright.setUseWorker(false);                    
          addEventHandlers(this);
          createGutter();          
          createCopyContainers();        
          attrs.$observe('readonly', function (value) {
          acee.setReadOnly(!!value || value === '');
        });

        // Value Blind
        if (scope.leftFile) {
          ngModel.$formatters.push(function (value) {
            if (angular.isUndefined(value) || value === null) {
              return '';
            }
            else if (angular.isObject(value) || angular.isArray(value)) {
              throw new Error('ui-ace cannot use an object or an array as a model');
            }
            return value;
          });

          ngModel.$render = function () {
            sessionleft.setValue(normalizeContent(scope.leftFile));
            sessionright.setValue(normalizeContent(scope.rightFile)); 

            do_diffs();
            showDiff(C.EDITOR_LEFT, 0, 2, classes.diff);
            showDiff(C.EDITOR_RIGHT, 2, 5, classes.diff);
          };
        }

        // Listen for option updates
        var updateOptions = function (current, previous) {
          if (current === previous) return;
          opts = angular.extend({}, options, scope.$eval(attrs.uiAceDiff));
          opts.callbacks = [ opts.onLoad ];
          if (opts.onLoad !== options.onLoad) {
            // also call the global onLoad handler
            opts.callbacks.unshift(options.onLoad);
          }

          // EVENTS

          // unbind old change listener
          sessionleft.removeListener('change', onChangeListener);
          sessionright.removeListener('change', onChangeListener);

          // bind new change listener
          onChangeListener = listenerFactory.onChange(opts.onChange);
          sessionleft.on('change', onChangeListener);
          sessionright.on('change', onChangeListener);

          // unbind old blur listener
          //session.removeListener('blur', onBlurListener);
          editors.left.ace.removeListener('blur', onBlurListener);
          editors.right.ace.removeListener('blur', onBlurListener);
          // bind new blur listener
          onBlurListener = listenerFactory.onBlur(opts.onBlur);
          editors.left.ace.on('blur', onBlurListener);
          editors.right.ace.on('blur', onBlurListener);

          setOptions(scope, editors.left.ace, sessionleft, opts);          
          setOptions(scope, editors.right.ace, sessionright, opts);  
          editors.right.ace.setReadOnly(true);
          editors.left.ace.setShowPrintMargin(false);
          editors.right.ace.setShowPrintMargin(false);

        };

        scope.$watch(attrs.uiAceDiff, updateOptions, /* deep watch */ true);
        // set the options here, even if we try to watch later, if this
        // line is missing things go wrong (and the tests will also fail)
        updateOptions(options);

        elm.on('$destroy', function () {
          console.log('destroy');
          sessionleft.$stopWorker();
          editors.left.ace.destroy();
          sessionleft.$stopWorker();
          editors.right.ace.destroy();
        });
        scope.$watch('showDiffs',function(o,n) {
            $timeout(function(){
              updateGap();  
            });

        },true);

        scope.$watch(function() {
          return [elm[0].offsetWidth, elm[0].offsetHeight];
        }, function() {          
          editors.left.ace.resize();
          editors.left.ace.renderer.updateFull();
          editors.right.ace.resize();
          editors.right.ace.renderer.updateFull();

        }, true);
      }
    };
  }]);
