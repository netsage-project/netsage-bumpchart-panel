/*! For license information please see module.js.LICENSE.txt */
define(["d3","react","@grafana/data"],(function(t,e,r){return function(t){var e={};function r(a){if(e[a])return e[a].exports;var n=e[a]={i:a,l:!1,exports:{}};return t[a].call(n.exports,n,n.exports,r),n.l=!0,n.exports}return r.m=t,r.c=e,r.d=function(t,e,a){r.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:a})},r.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},r.t=function(t,e){if(1&e&&(t=r(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var a=Object.create(null);if(r.r(a),Object.defineProperty(a,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var n in t)r.d(a,n,function(e){return t[e]}.bind(null,n));return a},r.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="/",r(r.s=3)}([function(e,r){e.exports=t},function(t,r){t.exports=e},function(t,e){t.exports=r},function(t,e,r){"use strict";r.r(e);var a=r(2);var n=function(){return(n=Object.assign||function(t){for(var e,r=1,a=arguments.length;r<a;r++)for(var n in e=arguments[r])Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=e[n]);return t}).apply(this,arguments)};var o=r(1),l=r.n(o);var c=r(0);function s(t,e){for(var r=0;r<e.length;r++){var a=e[r];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(t,a.key,a)}}var u=function(){function t(e){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this.containerID=e}var e,r,a;return e=t,(r=[{key:"renderChart",value:function(t,e,r){if(t){c.select("#"+this.containerID).selectAll("svg").remove(),c.select("#"+this.containerID).selectAll("dropdown").remove(),c.select("#"+this.containerID).selectAll(".tooltip").remove();var a=t.parsed_data,n=t.final_positions,o=t.colorPal,l=t.dates,s=this.containerID,u=document.getElementById(this.containerID).offsetWidth,d=document.getElementById(this.containerID).offsetHeight,p=25,f=325,h=150,g=25,v=25,y=u-g-f,m=d-p-h;c.select("#"+s).insert("select","svg").on("change",(function(t){!function(t){w=[0,A=t-1],_.domain(w),j=c.axisRight(_).ticks(t).tickSize(5).tickFormat((function(t){return console.log("d"+t),n[t].org}));var e=c.select("#"+s).transition();for(e.select(".yAxis").duration(750).call(j).selectAll(".tick text").call(B,f-25),i=0;i<a.length;i++)e.select(".org-"+i+s).duration(750).attr("d",c.line().curve(c.curveMonotoneX).x((function(t){return P(t.date)})).y((function(t){return _(t.rank)}))),e.selectAll("circle").duration(750).attr("cx",(function(t){return P(t.date)})).attr("cy",(function(t){return _(t.rank)}))}(c.select(this).property("value"))})).selectAll("option").data([10,9,8,7,6,5,4,3,2,1]).enter().append("option").text((function(t){return t})).attr("value",(function(t){return t})),c.selectAll("select").attr("class","dropdownMenu");var x=y+g+f-120;c.select("#"+s).insert("svg","svg").attr("width",x).attr("height",30).append("text").attr("class","dropdown-text").attr("transform","translate("+x+", 20)").style("text-anchor","end").text("Number of Lines to Display: ");var b=c.select("#"+this.containerID).append("svg").attr("width",y+g+f).attr("height",m+p+h+v).append("g").attr("height",m).attr("transform","translate("+g+","+p+")"),k=c.extent(a[0].data,(function(t){return t.date})),A=r-1,w=[0,A],I=c.timeFormat("%m/%d/%y"),P=c.scaleTime().domain(k).range([0,y]),_=c.scaleLinear().domain(w).range([0,m]),j=c.axisRight(_).ticks(r-1).tickSize(5).tickFormat((function(t){return n[t].org})),M=c.axisBottom(P).tickValues(l).tickSize(5).tickFormat(I);b.append("g").call(j).attr("margin",10).attr("transform","translate("+(y+v)+","+p+")").attr("class","yAxis").selectAll(".tick text").call(B,f-25).attr("transform","translate(10,0)"),b.append("g").call(M).attr("class","axis").attr("transform","translate("+v+","+(m+v+p)+")").selectAll(".tick text").call(B,100).attr("transform","rotate(-60)").style("text-anchor","end"),b.append("text").attr("class","header-text").attr("transform","translate("+(y+g+10)+" ,"+p/4+")").style("text-anchor","start").text(e);for(var O=c.select("body").append("div").attr("class","tooltip").style("opacity",0),D=0;D<a.length;D++){var T=a[D].data;b.append("svg").attr("width",y+v).attr("height",m+v+p).append("g").attr("transform","translate("+v+","+p+")").append("path").attr("class","org-"+D+s).data(T).attr("fill","none").attr("stroke",o[D%o.length]).attr("opacity",.5).attr("stroke-width",7).attr("d",c.line().curve(c.curveMonotoneX).x((function(t){return P(t.date)})).y((function(t){return _(t.rank)}))).on("mouseover",(function(t){c.selectAll("path").attr("opacity",.2),c.select(this).attr("opacity",1);var e=c.select(this).attr("class");c.selectAll("circle").each((function(t){var r=c.select(this).attr("class"),a=e===r;c.select(this).attr("opacity",a?1:.2).attr("fill-opacity",a?.9:.2)})),O.transition().duration(200).style("opacity",.9),O.html((function(){return"<b>"+t[0].org+"</b>"})).style("left",c.event.pageX+"px").style("top",c.event.pageY-28+"px")})).on("mouseout",(function(t){O.transition().duration(500).style("opacity",0),c.selectAll("path").attr("opacity",.5),c.selectAll("circle").attr("fill-opacity",.5).attr("opacity",.7)})),b.append("svg").attr("width",y+10+v).attr("height",m+v+p).append("g").attr("transform","translate("+v+","+p+")").selectAll("circle").data(T).enter().append("circle").attr("class","org-"+D+s).attr("cx",(function(t){return P(t.date)})).attr("cy",(function(t){return _(t.rank)})).attr("fill",o[D%o.length]).attr("fill-opacity",.5).attr("r",10).attr("stroke",o[D%o.length]).attr("opacity",.7).attr("stroke-width",1.5)}c.select("body").append("div").attr("class","small-tooltip"),b.selectAll("circle").on("mouseover",(function(t){var e=c.select(this).attr("class");console.log(e),c.selectAll("circle").each((function(t){var r=c.select(this).attr("class"),a=e===r;c.select(this).attr("opacity",a?1:.2).attr("fill-opacity",a?1:.2)})),c.selectAll("path").each((function(t){var r=c.select(this).attr("class"),a=e===r;c.select(this).attr("opacity",a?1:.2)})),O.transition().duration(200).style("opacity",.9),O.html((function(){var e=t.rank+1,r=t.value/1e3,a=r+"bytes";return a=(r/=1e3)<1e3?Math.round(10*r)/10+" KB":(r/=1e3)<1e3?Math.round(10*r)/10+" MB":(r/=1e3)<1e3?Math.round(10*r)/10+" GB":(r/=1e3)<1e3?Math.round(10*r)/10+" TB":Math.round(10*r)/10+" PB","<b>#"+e+": </b>"+t.org+"<br><b>Volume: </b>"+a})).style("left",c.event.pageX+"px").style("top",c.event.pageY-28+"px")})).on("mouseout",(function(t){O.transition().duration(500).style("opacity",0),c.selectAll("circle").attr("fill-opacity",.5).attr("opacity",.7),c.selectAll("path").attr("opacity",.5)}))}function B(t,e){t.each((function(){for(var t,r=c.select(this),a=r.text().split(/\s+/).reverse(),n=[],o=0,l=r.attr("y"),i=parseFloat(r.attr("dy")),s=r.text(null).append("tspan").attr("x",0).attr("y",l).attr("dy",i+"em");t=a.pop();)n.push(t),s.text(n.join(" ")),s.node().getComputedTextLength()>e&&(n.pop(),s.text(n.join(" ")),n=[t],s=r.append("tspan").attr("x",0).attr("y",l).attr("dy",1.1*++o+i+"em").text(t))}))}}}])&&s(e.prototype,r),a&&s(e,a),t}(),d=function(t){return Object(o.useEffect)((function(){console.log("rendering");var e=t.panelId,r=new u("Chart_"+e);console.log(r),r.renderChart(t.data,t.options.linecount,t.options.headerText)})),l.a.createElement("div",{id:"Chart_"+t.panelId,style:{height:t.height,width:t.width}})};r.d(e,"plugin",(function(){return p}));var p=new a.PanelPlugin((function(t){var e=t.options,r=t.data,a=t.width,o=t.height,i=t.id,c=n({},e),s={};try{s=function(t){var e=[],r=["rgba(223, 79, 79,1)","rgba(88, 223, 79,1)","rgba(79, 145, 223,1)","rgba(223, 79, 168,1)","rgba(223, 155, 79,1)","rgba(79, 223, 192,1)","rgba(138, 79, 223,1)","rgba(166, 223, 79,1)","rgba(147, 50, 55,1)","rgba(50, 147, 142,1)","rgba(59, 147, 50,1)","rgba(94, 50, 147,1)","rgba(147, 78, 50,1)","rgba(50, 81, 147,1)"],a=t.series;console.log(a),console.log(a[0].fields);for(var n=0;n<a.length;n++){var o=a[n].name;e[n]={org:o,data:[]};for(var l=a[n].fields,i=0;i<l[0].values.length;i++){var c=l[0].values.buffer[i],s=l[1].values.buffer[i];e[n].data[i]={date:c,value:s,rank:0,orig_index:parseInt(n)}}}for(n=0;n<e[0].data.length;n++){var u=[];for(i=0;i<e.length;i++)u[i]=e[i].data[n];u.sort((function(t,e){return e.value-t.value}));for(var d=0;d<u.length;d++)e[u[d].orig_index].data[n].rank=d}for(n=0;n<e.length;n++)for(i=0;i<e[0].data.length;i++)e[n].data[i].org=e[n].org,e[n].data[i].color=r[n%r.length];var p=[];for(var n in e){var f=e[n].data[e[n].data.length-1];p[n]={org:f.org,rank:f.rank}}p.sort((function(t,e){return t.rank-e.rank}));var h=[];for(n=0;n<e[0].data.length;n++)h[n]=e[0].data[n].date;var g={parsed_data:e,final_positions:p,colorPal:r,dates:h};return console.log(g),g}(r),console.log(s)}catch(t){console.error("Parsing error : ",t)}return l.a.createElement(d,{height:o,width:a,panelId:i,options:c,data:s})})).setPanelOptions((function(t){return t.addNumberInput({path:"linecount",name:"Number of lines",description:"Number of lines to show",defaultValue:10}).addTextInput({path:"headerText",name:"Axis Header",description:"Axis header display",defaultValue:"Axis header"})}))}])}));
//# sourceMappingURL=module.js.map