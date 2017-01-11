// shadow-book ver 0.0.1

if (!window.W) { window.W = new Array(); W.$modules = [];} W.$modules.push( function(require,module,exports) {

var React = require('react');
var ReactDOM = require('react-dom');

var W = require('shadow-widget');
var main = W.$main, utils = W.$utils, ex = W.$ex, idSetter = W.$idSetter;

// define bookConfig by localStorage
//----------------------------------

var storageHead_ = 'rewgt/shadow-book/';

function bookConfig_() {
  var sPath = window.location.pathname || 'untitled';
  if (sPath.slice(-1) == '/') sPath += 'index.html';
  
  this.canSave  = !!window.localStorage;
  this.bookPath = sPath;
  this.bookId   = stringHashCode(sPath) + '';
  this.config   = {};
  
  function stringHashCode(s) {
    var hash = 0, i, chr, len;
    if (s.length == 0) return hash;
    for (i = 0,len = s.length; i < len; i++) {
      chr = s.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }
}

bookConfig_.prototype = {
  clearBefore: function(iTime) {
    if (!this.canSave) return;
    
    var dBook = localStorage.getItem(storageHead_ + 'books');
    if (dBook) {
      dBook = JSON.parse(dBook);
      
      var bRmv0 = [];
      for (var sKey in dBook) {
        var dItem = localStorage.getItem(storageHead_ + sKey);
        if (dItem) {
          dItem = JSON.parse(dItem);
          
          var iNum = 0, bRmv = [];
          for (var sKey2 in dItem) {
            iNum += 1;
            if (dItem[sKey2] < iTime) bRmv.push(sKey2);
          }
          
          if (iNum == bRmv.length) {
            localStorage.removeItem(storageHead_ + sKey);
            bRmv0.push(sKey);
          }
          else if (bRmv.length) {
            bRmv.forEach( function(item) {
              delete dItem[item];
            });
            localStorage.setItem(storageHead_ + sKey,JSON.stringify(dItem));
          }
          // else, keep same
        }
      }
      
      if (bRmv0.length) {
        bRmv0.forEach( function(item) {
          delete dBook[item];
        });
        localStorage.setItem(storageHead_ + 'books',JSON.stringify(dBook));
      }
    }
  },
  
  loadItems: function() {
    this.config = {};
    if (!this.canSave) return;
    
    var dBook = JSON.parse(localStorage.getItem(storageHead_ + 'books') || '{}');
    if (!dBook[this.bookId]) {
      dBook[this.bookId] = this.bookPath;
      localStorage.setItem(storageHead_ + 'books',JSON.stringify(dBook));
    }
    
    this.config = JSON.parse(localStorage.getItem(storageHead_ + this.bookId) || '{}');
  },
  
  setItem: function(sKey,value) {  // value can be any json-able value
    this.config[sKey] = value;
    if (this.canSave)
      localStorage.setItem(storageHead_ + this.bookId,JSON.stringify(this.config));
  },
  
  getItem: function(sKey) {
    return this.config[sKey];
  },
};

var bookConfig  = new bookConfig_();

// shadow definition for book_summary.list
//----------------------------------------
function sumPanelId__(value,oldValue) {
  if (value <= 2) {
    if (value == 1) {   // init process
      this.defineDual('json', function(value,oldValue) {
        this.state.json = value;
        if (value) loadSummary(this,value);
      });
    }
    // else, value == 2 for didMount(), value == 0 for willUnmount()
    return;
  }
  
  function loadSummary(self,sUrl) {
    utils.ajax( { type:'GET', url:sUrl, timeout:30000, dataType:'json',
      success: function(data,statusText,xhr) {
        if (Array.isArray(data) && data.length >= 1) {  // data come from json, no need re-create
          var config = data[0];
          if (typeof config == 'object' && !Array.isArray(config)) {
            data.shift();
            
            // use config.title/navPanelWidth/ctrlPanelLib
            if (config.title) document.title = config.title + '';
            if (typeof config.navPanelWidth == 'number')
              self.duals.width = config.navPanelWidth;
            if (config.ctrlPanelLib) {
              var jsNode = document.createElement('script');
              jsNode.setAttribute('type','text/javascript');
              jsNode.setAttribute('src',config.ctrlPanelLib+'');
              document.body.appendChild(jsNode);
            }
          }
          else config = {};
          
          // remove expired local storage items
          bookConfig.clearBefore(Math.floor((new Date()).valueOf()/1000) - (config.storageExpiredDays || 250) * 24 * 3600);
          bookConfig.loadItems();
          
          // adjust data
          data.forEach( function(item,idx) {
            var sIdx = item[1];
            if (sIdx) {
              if (bookConfig.getItem(sIdx))
                item.push('done');
            }
          });
          self.duals.data = data;
        }
        // else, unknown format, ignore
      },
      
      error: function(xhr,statusText) {
        console.log('warning: query book summary failed (' + (statusText || 'unknown error') + ')');
      },
    });
  }
}

//-------------------------------
var sumListPanel = null;

function sumListClick(event) {
  var targ = event.target, liNode = null;
  while (targ) {
    if (targ.nodeName == 'LI') {
      liNode = targ;
      break;
    }
    targ = targ.parentNode;
  }
  if (!liNode) return;
  
  var sIdx = liNode.dataset.idx || '';
  if (sIdx) this.duals.goTo = [sIdx,ex.time()];
}

function sumListId__(value,oldValue) {
  if (value <= 2) {
    if (value == 1) {       // init process
      sumListPanel = this;
      this.state.currIndex = '';
      
      // listen 'jumpTo' to receive jump command
      this.defineDual('jumpTo', function(value,oldValue) {
        this.state.jumpTo = value; // [prevId,nextId,currId,sUrl,sAnchor,sTitle] or undefined
      });
      
      // response to double click and onhashchange
      var firstGoto = true;
      this.defineDual('goTo', function(value,oldValue) {
        this.state.goTo = value;
        
        var targ = null, node = this.getHtmlNode();
        if (!node) return;
        
        var sHash = value[0], sAnchor = '', iPos = sHash.indexOf('!');
        if (iPos >= 0) {
          sAnchor = sHash.slice(iPos+1).trim();
          sHash = sHash.slice(0,iPos);
        }
        
        try {
          if (!sHash)
            targ = node.querySelector('li[data-idx]');
          else targ = node.querySelector('li[data-idx="' + sHash + '"]');
        } catch(e) { }
        if (targ) {
          gotoPage(this,node,targ,sAnchor);
          if (firstGoto) targ.scrollIntoView(false);
        }
      },['',0]);
      window.onhashchange = getHashChangeFn(this);
      
      this.listen('data', function(value,oldValue) {
        if (!value) return;
        if (!oldValue || oldValue.length == 0) { // first time of getting summary data
          window.onhashchange();
          setTimeout( function() {
            firstGoto = false;
          },300);
        }
      });
    }
    else if (value == 0) {  // unmount process
      sumListPanel = null;
    }
    // else, value == 2 for didMount()
    
    return;
  }
  
  var bChild = [];
  var b = this.state.data, currIndex = this.state.currIndex;
  b.forEach( function(item,idx) {
    var bCls = [], indent = item[0] || 0, sIndex = item[1] || '', sTitle = item[2] || '', sUrl = item[3] || '';
    for (var i=4,item2; item2=item[i]; i++) {
      if (typeof item2 == 'string')
        bCls.push(item2);  // add 'done' or others
    }
    if (sIndex && sIndex === currIndex) bCls.push('active');
    
    var dProp = {key:idx+'','data-url':sUrl,'data-idx':sIndex};
    if (bCls.length) dProp.klass = bCls.join(' ');
    if (indent < 0) {
      dProp.style = {display:'none'};
      dProp.margin = [6,0,6,0];
    }
    else dProp.margin = [6,0,6,10*indent];
    
    var bItem = [['Li',dProp]], sIndex2 = (sIndex=='0' || sIndex.startsWith('0.'))? '': sIndex;
    bItem.push(['Span',{key:'0',klass:'summary_id','html.':sIndex2}]);
    bItem.push(['Span',{key:'1','html.':sTitle}]);
    bChild.push(utils.loadElement(bItem));
  });
  
  utils.setChildren(this,bChild);
  
  //-------------------------------
  function getHashChangeFn(self) {
    return (function() {
      var sHash = window.location.hash;
      if (sHash && sHash[0] == '#')
        sHash = decodeURIComponent(sHash.slice(1));
      else sHash = '';
      self.duals.goTo = [sHash,ex.time()];
    });
  }
  
  function gotoPage(self,ulNode,liNode,sAnchor) {
    var prevLi = liNode.previousElementSibling, prevId = '';
    if (prevLi && prevLi.nodeName == 'LI')
      prevId = prevLi.dataset.idx || '';
    var nextLi = liNode.nextElementSibling, nextId = '';
    if (nextLi && nextLi.nodeName == 'LI')
      nextId = nextLi.dataset.idx || '';
    var currId = liNode.dataset.idx || '';
    
    var sUrl = liNode.dataset.url;
    if (sUrl) {
      if (currId) {
        var iTimeId = Math.floor((new Date()).valueOf()/1000);
        bookConfig.setItem(currId,iTimeId);
      }
      
      // prepare new data and trigger reset
      var newItem, newData = self.state.data;
      var sKey = utils.keyOfNode(liNode), iPos = parseInt(sKey);
      if (!isNaN(iPos) && (newItem=newData[iPos])) {
        newItem = newItem.slice(0);
        if (newItem.indexOf('done') < 0)
          newItem.push('done');
        newData = ex.update(newData,{$splice:[[iPos,1,newItem]]}); // force change
      }
      self.state.currIndex = currId;
      self.componentOf('//').duals.data = newData;
      
      self.duals.jumpTo = [prevId,nextId,currId,sUrl,sAnchor || '',liNode.textContent];
    }
    // else, not define url, just ignore
  }
}

//-------------------------------
var prevPagePanel = null;
var nextPagePanel = null;
var markdownPanel = null;

function mdPanelId__(value,oldValue) {
  if (value <= 2) {
    if (value == 1) {  // init process
      this.defineDual('jumpTo', function(value,oldValue) {
        if (value.length >= 5) {
          var prevId = value[0], nextId = value[1], currId = value[2];
          if (prevPagePanel) {
            prevPagePanel.duals.klass = prevId? 'book_to_prev': '';
            prevPagePanel.duals['data-id'] = prevId;
          }
          if (nextPagePanel) {
            nextPagePanel.duals.klass = nextId? 'book_to_next': '';
            nextPagePanel.duals['data-id'] = nextId;
          }
          
          var sUrl = value[3], sAnchor = value[4];
          if (sUrl) {
            if (W.__debug__) {
              console.log('open md:', sUrl);  // not actually open
              return;
            }
            
            utils.ajax( { type:'GET', url:sUrl, timeout:30000, dataType:'text',
              success: function(data,statusText,xhr) {
                if (markdownPanel)
                  markdownPanel.duals['html.'] = data;
                
                var sNewHash = '#' + encodeURIComponent(currId);
                if (sAnchor) {
                  sNewHash += '!' + sAnchor;
                  setTimeout( function() {
                    try {
                      var targNode = document.querySelector('a[name="' + sAnchor + '"]');
                      if (targNode) targNode.scrollIntoView(true);
                    }
                    catch(e) { }
                  },300);
                }
                if (window.location.hash != sNewHash) // pushState() not trigger onhashchange
                  window.history.pushState(null,'section: ' + currId,sNewHash);
              },
              
              error: function(xhr,statusText) {
                console.log('warning: query md file failed (' + sUrl + ')');
              },
            });
          }
        }
      },[]);
      
      this.defineDual('summaryPath', function(value,oldValue) {
        if (oldValue) {
          var sPath = oldValue.endsWith('.list')? oldValue: oldValue + '.list';
          var sour = this.componentOf(sPath);
          if (sour) sour.unlisten('*',this);
        }
        if (value) {
          var sPath = value.endsWith('.list')? value: value + '.list';
          var sour = this.componentOf(sPath);
          if (sour) 
            sour.listen('jumpTo',this,'jumpTo');
          else console.log('error: can not locate component (' + sPath + ')');
        }
      });
    }
    else if (value == 2) {  // mount process
      prevPagePanel = this.componentOf('prev');
      nextPagePanel = this.componentOf('next');
      markdownPanel = this.componentOf('mark');
    }
    else if (value == 0) {  // unmount process
      prevPagePanel = null;
      nextPagePanel = null;
      markdownPanel = null;
    }
    return;
  }
}

//-------------------------------
function goTopId__(value,oldValue) {
  if (value <= 2) {
    if (value == 1) {
      this.defineDual('data-src', function(value,oldValue) {
        this.state['data-src'] = value;
        if (value) {
          var imgComp = this.componentOf('img');
          if (imgComp && imgComp.isHooked)
            imgComp.duals.src = value;
        }
      });
    }
    return;
  }
  
  if (oldValue == 1) {
    var imgEle = ['Img',{key:'img',style:{width:'100%',height:'100%',backgroundColor:'rgba(0,0,0,0.04)'},
      src: this.state['data-src'] || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAn1BMVEUAAAD///////////////////////////////8AAAAHBwcICAgJCQkLCwsMDAwdHR05OTk6Ojo7Ozs8PDw9PT0+Pj4/Pz9DQ0NERERFRUVGRkZISEhJSUlMTExNTU1/f3+UlJSXl5ecnJyfn5+3t7e4uLi5ubnBwcHCwsLDw8PExMTx8fHy8vLz8/P09PT19fX29vb4+Pj5+fn6+vr////GdZrgAAAACXRSTlMATU7i5OXm5/HEWyOWAAAAAWJLR0Q0qbHp/QAAAN9JREFUOMvVkckSgjAQRImKJm6I+44Lirug/f/f5sSKqQihLG/aB2CmX8gk7Th/okIRVhWZAlzkqKQAYN23aA1oIBAWBd8AH7YoG3MliVG4r2NWdOsyGl91UWGp6+A4toTwT+DMel0cJ18Ol0NoP4cgPx6QWa3SYxhnCLm+TVYzihr0ap9TBPnnztMHoiZ9dN4J7e/k6bKE9LvK5xzYSaJrEC5uE2rVQvIZ0QhrVE7vRtwL6W/wXKOJpRHWTIj6FuqfktgQMTeAldc/QO8piX3PW6XTfJvakqaZXbbz23oAhlQ3P/v7RVUAAAAASUVORK5CYII=',
      $onClick: goTopClick,
    }];
    utils.setChildren(this,[utils.loadElement(imgEle)]);
    
    this.componentOf('.body').listen('innerSize', (function(value,oldValue) {
      this.reRender();
    }).bind(this));
  }
  
  var bSize = this.componentOf('.body').duals.innerSize;
  this.state.left = bSize[0] - this.state.width - (parseInt(this.state['data-right']) || 4);
  this.state.top = bSize[1] - this.state.height - (parseInt(this.state['data-bottom']) || 4);
  
  function goTopClick(event) {
    var node = markdownPanel && markdownPanel.getHtmlNode();
    if (node) {
      node.scrollTop = 0;
      node.scrollLeft = 0;
    }
  }
}

// define $$onLoad function
//-------------------------------
main.$$onLoad.push( function(callback) {
  utils.setVendorLib('rewgt', function(template) {
    var summaryEle = utils.loadElement([
      ['Panel',{key:'book_summary',width:240,klass:'auto-hidden-visible default-large-small',style:{backgroundColor:'#fafafa'},'json':'','dual-data':[],$id__:sumPanelId__}],
      ['Ul',{key:'list',width:0.9999,padding:[0,0,12,4],klass:'default-square-circle default-large-small auto-hidden-visible book_summary',style:{color:'#444'},$data:'duals.data',$onClick:sumListClick,$id__:sumListId__}],
    ]);
    var contentEle = utils.loadElement([ ['Panel',{key:'book_content',summaryPath:'',$id__:mdPanelId__}],
      ['Panel',{key:'prev','data-id':'', width:36, height:0.9999, $onClick:goPrevNext}],
      ['MarkedDiv',{key:'mark', width:-1, height:0.9999, style:{overflow:'auto'}}],
      ['Panel',{key:'next','data-id':'', width:36, height:0.9999, $onClick:goPrevNext}],
    ]);
    var gotoTopEle = utils.loadElement([ ['Div',{key:'book_top',width:0,height:0,'data-width':'32','data-height':'32','data-right':'4','data-bottom':'4','data-src':'','data-title':''}],
      ['P',{ key:'p',margin:[0,0,0,0], $id__:goTopId__,
        $title: 'duals["data-title"]',
        $width: 'ex.parseInt(duals["data-width"])',
        $height: 'ex.parseInt(duals["data-height"])',
        '$data-right': 'duals["data-right"]',
        '$data-bottom': 'duals["data-bottom"]',
        '$data-src': 'duals["data-src"]',
        style: {position:'absolute',zIndex:'999'}
      }],
    ]);
    template.setChild(summaryEle,contentEle,gotoTopEle,callback);
  });
  
  function goPrevNext(event) {
    if (W.__design__) return;
    
    var sId = event.target.getAttribute('data-id');
    if (sId && sumListPanel)
      sumListPanel.duals.goTo = [sId,ex.time()];
  }
});

});
