(function(e,t){function r(t,n,r,i){n.on(r,function(){var n=e.makeArray(arguments);n.splice(0,0,t);i.apply(this,n)})}function i(e,t,n,r){var i=function(){var i=r.call(t,e);t[n]=function(){return i};return i};t[n]=i;return function(){t[n](e)}}function s(o,u,a,f){if(a===t||a===null){return t}if(!a.hasOwnProperty("selector")){return a}var l;if(u){l=u.find(a.selector)}else{o=l=e(a.selector)}if(a.hasOwnProperty("init")&&a.init!==t&&a.init!==null){if(typeof a.init!=="function"){throw"init property must have a function value"}a.init.call(l)}for(var c in a){if(n.indexOf(c)>-1){continue}if(l.hasOwnProperty(c)){throw"Property '"+c+"' already exists"}var h=a[c];if(h===t||h===null){l[c]=h;continue}var p=typeof h==="string";var d=h instanceof jQuery;var v=typeof h==="function";var m=typeof h==="object";if(p){l[c]=l.find(h)}else if(d){l[c]=h}else if(v){if(c[0]==="_"){var g=c.substring(1);r(o,l,g,h)}else{f.push(i(o,l,c,h))}}else if(m){l[c]=s(o,l,h,f)}else{l[c]=h}}return l}var n=["selector","init"];window.DomView=function(e){var n=[];var r=s(t,t,e,n);for(var i=0;i<n.length;i++){n[i](r)}return r}})(jQuery)