"use strict";(self.webpackChunkatar_calculator=self.webpackChunkatar_calculator||[]).push([[834],{3834:function(e,t,i){i.r(t),i.d(t,{default:function(){return m}});var n=i(885),s=i(7762),o=i(2982),a=i(5671),r=i(3144),h=i(136),l=i(8557),c=i(2791),d=i(1712),u=i.n(d),p=i(8588),b=i(3898),g=i(6951),f=i(184),v=["steelblue","orangered","#05b378","darkviolet","orange","brown","magenta"],y=[-9,103,113,-6];u().Options.text.cssDefaultStyle="",u().Options.text.highlightCssDefaultStyle="";var m=function(e){(0,h.Z)(i,e);var t=(0,l.Z)(i);function i(){return(0,a.Z)(this,i),t.apply(this,arguments)}return(0,r.Z)(i,[{key:"componentDidMount",value:function(){this.board=u().JSXGraph.initBoard("jsxgraph",{axis:!0,maxFrameRate:30,boundingbox:y,maxboundingbox:[-100,200,200,-100],showCopyright:!1,showInfobox:!1,zoom:{factorX:1.25,factorY:1.25,wheel:!0,needShift:!1,min:1,max:50,pinchHorizontal:!1,pinchVertical:!1,pinchSensitivity:7},pan:{enabled:!0,needTwoFingers:!1,needShift:!1},navbar:{strokeColor:"#333333",fillColor:"transparent",highlightFillColor:"#aaaaaa",padding:"0px",position:"absolute",fontSize:"14px",cursor:"pointer",zIndex:"100",right:"5px",bottom:"0px"}}),this.legend=u().JSXGraph.initBoard("jsxlegend",{boundingbox:[0,120,20,0],maxFrameRate:1,registerEvents:!1,showCopyright:!1,showInfobox:!1,showNavigation:!1,zoom:{factorX:1,factorY:1,wheel:!1,needShift:!0,min:1,max:1,pinchHorizontal:!1,pinchVertical:!1,pinchSensitivity:7},pan:{enabled:!1,needTwoFingers:!0,needShift:!0}}),this.addZoomLevelListeners(),this.createMouseCoordinates(),this.originalObjects=(0,o.Z)(this.board.objectsList),this.points=[],this.subjects=[],this.year=2022,this.componentDidUpdate()}},{key:"clearBoard",value:function(){for(var e=(0,o.Z)(this.board.objectsList),t=e.length-1;t>=0;t-=1){var i=e[t];("line"===i.elType||"curve"===i.elType||"text"===i.elType&&i.htmlStr.length>3||"point"===i.elType&&null!==i.Xjc||!this.originalObjects.includes(i))&&this.board.removeObject(i.id)}}},{key:"plotScalingFunctions",value:function(){var e=this;console.log(this.subjects);var t,i=(0,s.Z)(this.subjects.entries());try{var o=function(){var i=(0,n.Z)(t.value,2),s=i[0],o=i[1],a=(0,g.bZ)(e.props.year),r=a[o].a,h=a[o].b,l=a[o].c;e.board.create("functiongraph",[function(e){return r/(1+Math.exp(-h*(e-l)))},0,100],{strokeColor:v[s%v.length]}).hasPoint=function(e,t){return!1}};for(i.s();!(t=i.n()).done;)o()}catch(a){i.e(a)}finally{i.f()}}},{key:"clearLegend",value:function(){for(var e=(0,o.Z)(this.legend.objectsList),t=e.length-1;t>=0;t-=1){var i=e[t];this.legend.removeObject(i.id)}}},{key:"createLegend",value:function(){var e=this.subjects.map((function(e){return b[e]})),t=e.reduce((function(e,t){return e.length>t.length?e:t})),i=9*Math.ceil(t.length/12)+10,n=this.legend.create("legend",[0,100],{labels:e,colors:v,rowHeight:i}).lines.at(-1).getTextAnchor().scrCoords.at(-1)+i+this.maxWidth/30;document.getElementById("jsxlegend").style.top="".concat(this.graphHeight-n,"px"),this.legend.resizeContainer(110,n,!1,!0)}},{key:"plotPoints",value:function(){var e,t=this.board.getBoundingBox(),i=(y[2]-y[0])/(t[2]-t[0])>=1.7,n=(0,s.Z)(this.subjects);try{for(n.s();!(e=n.n()).done;){var o=e.value,a=this.props.subjects[o];if(a){var r=(0,p.lT)(a,o,this.props.year),h=this.board.create("point",[a,r],{face:"cross",name:b[o],withLabel:!0});h.label.setAttribute({offset:[10,-4]}),i||h.setAttribute({withLabel:!1}),h.hasPoint=function(e,t){return!1},this.points.push(h)}}}catch(l){n.e(l)}finally{n.f()}}},{key:"zoomFactorChange",value:function(e,t,i){return e>=i?t<i:t>i}},{key:"addZoomLevelListeners",value:function(){var e=this,t=1;this.board.on("boundingbox",(function(){var i=e.board.getBoundingBox(),n=(y[2]-y[0])/(i[2]-i[0]);if(e.zoomFactorChange(n,t,1.7)){e.board.suspendUpdate();var o,a=n>=1.7,r=(0,s.Z)(e.points);try{for(r.s();!(o=r.n()).done;){o.value.setAttribute({withLabel:a})}}catch(h){r.e(h)}finally{r.f()}e.board.unsuspendUpdate()}e.isMobile&&e.zoomFactorChange(n,t,10)&&(document.getElementById("jsxlegend").style.display=n>=10?"none":""),t=n}))}},{key:"createMouseCoordinates",value:function(){var e=this,t=this.board.create("point",[0,0],{visible:!1,fixed:!0,size:2,fillColor:"black",highlightFillColor:"black",fillOpacity:.7,highlightFillOpacity:.7,highlightStrokeWidth:0,strokeWidth:0,precision:{touch:0,mouse:0,pen:0}});t.label.setAttribute({offset:[7,13]});var i=[0,0],n=!1,s=function(){if(e.subjects.length<1)return!1;var s=new(u().Coords)(d.COORDS_BY_SCREEN,e.board.getMousePosition(),e.board).usrCoords.slice(1),o=Math.round(s[0]);if(o>=-1&&o<=101){o<=0&&(o=0),o>=100&&(o=100);var a=e.subjects.reduce((function(t,i){return Math.abs((0,p.lT)(o,t,e.props.year)-s[1])<Math.abs((0,p.lT)(o,i,e.props.year)-s[1])?t:i})),r=(0,p.lT)(o,a,e.props.year);n||(e.board.suspendUpdate(),t.showElement(),n=!0);var h=[o,r];if(o===i[0]&&r===i[1])return!1;i=h,e.board.suspendUpdate(),t.moveTo(h),t.setAttribute({name:"(".concat(o.toFixed(0),", ").concat(r.toFixed(2),")")}),e.board.unsuspendUpdate()}else n&&(t.hideElement(),n=!1)};this.board.on("touchstart",s),this.board.on("pointermove",s)}},{key:"clearPoints",value:function(){for(var e=(0,o.Z)(this.board.objectsList),t=e.length-1;t>=0;t-=1){var i=e[t];"point"===i.elType&&null!==i.Xjc&&this.board.removeObject(i.id)}}},{key:"componentDidUpdate",value:function(){var e=this;this.board.suspendUpdate(),this.legend.suspendUpdate();var t=(0,o.Z)(this.subjects);this.subjects=Object.keys(this.props.subjects).filter((function(t){return void 0!==e.props.subjects[t]})),console.log(this.subjects),this.subjectsHaveChanged=!(JSON.stringify(t)===JSON.stringify(this.subjects)),(this.subjectsHaveChanged||this.year!==this.props.year)&&(this.year=this.props.year,this.clearBoard(),this.subjects.length>0&&this.plotScalingFunctions()),this.subjectsHaveChanged?(this.clearLegend(),this.subjects.length>0&&this.createLegend()):this.clearPoints(),this.plotPoints(),this.board.unsuspendUpdate(),this.legend.unsuspendUpdate()}},{key:"render",value:function(){return this.isMobile=this.maxWidth<400,this.maxWidth=document.querySelector(".section-inner").getBoundingClientRect().width,this.graphHeight=Math.abs(this.maxWidth*(y[1]-y[3])/(y[2]-y[0])),(0,f.jsxs)("div",{style:{position:"relative"},children:[(0,f.jsx)("div",{id:"jsxgraph",style:{width:this.maxWidth,height:this.graphHeight}}),(0,f.jsx)("div",{id:"jsxlegend",style:{position:"absolute",top:this.graphHeight-250,right:0,width:110,height:this.graphHeight,zIndex:-1}})]})}}]),i}(c.Component)}}]);
//# sourceMappingURL=834.e2ebc3b1.chunk.js.map