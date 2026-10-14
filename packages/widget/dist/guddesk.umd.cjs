(function(D,h){typeof exports=="object"&&typeof module<"u"?module.exports=h():typeof define=="function"&&define.amd?define(h):(D=typeof globalThis<"u"?globalThis:D||self,D.GudDesk=h())})(this,(function(){"use strict";var D,h,Be,Ge,F,qe,Ve,je,Ke,ke,Se,$e,ae={},ce=[],Mt=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,ue=Array.isArray;function H(t,e){for(var n in e)t[n]=e[n];return t}function Te(t){t&&t.parentNode&&t.parentNode.removeChild(t)}function Je(t,e,n){var i,r,o,l={};for(o in e)o=="key"?i=e[o]:o=="ref"?r=e[o]:l[o]=e[o];if(arguments.length>2&&(l.children=arguments.length>3?D.call(arguments,2):n),typeof t=="function"&&t.defaultProps!=null)for(o in t.defaultProps)l[o]===void 0&&(l[o]=t.defaultProps[o]);return fe(t,l,i,r,null)}function fe(t,e,n,i,r){var o={type:t,props:e,key:n,ref:i,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:r??++Be,__i:-1,__u:0};return r==null&&h.vnode!=null&&h.vnode(o),o}function M(t){return t.children}function Q(t,e){this.props=t,this.context=e}function G(t,e){if(e==null)return t.__?G(t.__,t.__i+1):null;for(var n;e<t.__k.length;e++)if((n=t.__k[e])!=null&&n.__e!=null)return n.__e;return typeof t.type=="function"?G(t):null}function Ut(t){if(t.__P&&t.__d){var e=t.__v,n=e.__e,i=[],r=[],o=H({},e);o.__v=e.__v+1,h.vnode&&h.vnode(o),Ie(t.__P,o,e,t.__n,t.__P.namespaceURI,32&e.__u?[n]:null,i,n??G(e),!!(32&e.__u),r),o.__v=e.__v,o.__.__k[o.__i]=o,nt(i,o,r),e.__e=e.__=null,o.__e!=n&&Ye(o)}}function Ye(t){if((t=t.__)!=null&&t.__c!=null)return t.__e=t.__c.base=null,t.__k.some(function(e){if(e!=null&&e.__e!=null)return t.__e=t.__c.base=e.__e}),Ye(t)}function Ze(t){(!t.__d&&(t.__d=!0)&&F.push(t)&&!de.__r++||qe!=h.debounceRendering)&&((qe=h.debounceRendering)||Ve)(de)}function de(){for(var t,e=1;F.length;)F.length>e&&F.sort(je),t=F.shift(),e=F.length,Ut(t);de.__r=0}function Qe(t,e,n,i,r,o,l,a,u,c,_){var s,p,d,v,$,b,y,g=i&&i.__k||ce,L=e.length;for(u=zt(n,e,g,u,L),s=0;s<L;s++)(d=n.__k[s])!=null&&(p=d.__i!=-1&&g[d.__i]||ae,d.__i=s,b=Ie(t,d,p,r,o,l,a,u,c,_),v=d.__e,d.ref&&p.ref!=d.ref&&(p.ref&&Ee(p.ref,null,d),_.push(d.ref,d.__c||v,d)),$==null&&v!=null&&($=v),(y=!!(4&d.__u))||p.__k===d.__k?u=Xe(d,u,t,y):typeof d.type=="function"&&b!==void 0?u=b:v&&(u=v.nextSibling),d.__u&=-7);return n.__e=$,u}function zt(t,e,n,i,r){var o,l,a,u,c,_=n.length,s=_,p=0;for(t.__k=new Array(r),o=0;o<r;o++)(l=e[o])!=null&&typeof l!="boolean"&&typeof l!="function"?(typeof l=="string"||typeof l=="number"||typeof l=="bigint"||l.constructor==String?l=t.__k[o]=fe(null,l,null,null,null):ue(l)?l=t.__k[o]=fe(M,{children:l},null,null,null):l.constructor===void 0&&l.__b>0?l=t.__k[o]=fe(l.type,l.props,l.key,l.ref?l.ref:null,l.__v):t.__k[o]=l,u=o+p,l.__=t,l.__b=t.__b+1,a=null,(c=l.__i=Lt(l,n,u,s))!=-1&&(s--,(a=n[c])&&(a.__u|=2)),a==null||a.__v==null?(c==-1&&(r>_?p--:r<_&&p++),typeof l.type!="function"&&(l.__u|=4)):c!=u&&(c==u-1?p--:c==u+1?p++:(c>u?p--:p++,l.__u|=4))):t.__k[o]=null;if(s)for(o=0;o<_;o++)(a=n[o])!=null&&(2&a.__u)==0&&(a.__e==i&&(i=G(a)),ot(a,a));return i}function Xe(t,e,n,i){var r,o;if(typeof t.type=="function"){for(r=t.__k,o=0;r&&o<r.length;o++)r[o]&&(r[o].__=t,e=Xe(r[o],e,n,i));return e}t.__e!=e&&(i&&(e&&t.type&&!e.parentNode&&(e=G(t)),n.insertBefore(t.__e,e||null)),e=t.__e);do e=e&&e.nextSibling;while(e!=null&&e.nodeType==8);return e}function Lt(t,e,n,i){var r,o,l,a=t.key,u=t.type,c=e[n],_=c!=null&&(2&c.__u)==0;if(c===null&&a==null||_&&a==c.key&&u==c.type)return n;if(i>(_?1:0)){for(r=n-1,o=n+1;r>=0||o<e.length;)if((c=e[l=r>=0?r--:o++])!=null&&(2&c.__u)==0&&a==c.key&&u==c.type)return l}return-1}function et(t,e,n){e[0]=="-"?t.setProperty(e,n??""):t[e]=n==null?"":typeof n!="number"||Mt.test(e)?n:n+"px"}function _e(t,e,n,i,r){var o,l;e:if(e=="style")if(typeof n=="string")t.style.cssText=n;else{if(typeof i=="string"&&(t.style.cssText=i=""),i)for(e in i)n&&e in n||et(t.style,e,"");if(n)for(e in n)i&&n[e]==i[e]||et(t.style,e,n[e])}else if(e[0]=="o"&&e[1]=="n")o=e!=(e=e.replace(Ke,"$1")),l=e.toLowerCase(),e=l in t||e=="onFocusOut"||e=="onFocusIn"?l.slice(2):e.slice(2),t.l||(t.l={}),t.l[e+o]=n,n?i?n.u=i.u:(n.u=ke,t.addEventListener(e,o?$e:Se,o)):t.removeEventListener(e,o?$e:Se,o);else{if(r=="http://www.w3.org/2000/svg")e=e.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(e!="width"&&e!="height"&&e!="href"&&e!="list"&&e!="form"&&e!="tabIndex"&&e!="download"&&e!="rowSpan"&&e!="colSpan"&&e!="role"&&e!="popover"&&e in t)try{t[e]=n??"";break e}catch{}typeof n=="function"||(n==null||n===!1&&e[4]!="-"?t.removeAttribute(e):t.setAttribute(e,e=="popover"&&n==1?"":n))}}function tt(t){return function(e){if(this.l){var n=this.l[e.type+t];if(e.t==null)e.t=ke++;else if(e.t<n.u)return;return n(h.event?h.event(e):e)}}}function Ie(t,e,n,i,r,o,l,a,u,c){var _,s,p,d,v,$,b,y,g,L,B,le,Dt,we,We,A=e.type;if(e.constructor!==void 0)return null;128&n.__u&&(u=!!(32&n.__u),o=[a=e.__e=n.__e]),(_=h.__b)&&_(e);e:if(typeof A=="function")try{if(y=e.props,g="prototype"in A&&A.prototype.render,L=(_=A.contextType)&&i[_.__c],B=_?L?L.props.value:_.__:i,n.__c?b=(s=e.__c=n.__c).__=s.__E:(g?e.__c=s=new A(y,B):(e.__c=s=new Q(y,B),s.constructor=A,s.render=Wt),L&&L.sub(s),s.state||(s.state={}),s.__n=i,p=s.__d=!0,s.__h=[],s._sb=[]),g&&s.__s==null&&(s.__s=s.state),g&&A.getDerivedStateFromProps!=null&&(s.__s==s.state&&(s.__s=H({},s.__s)),H(s.__s,A.getDerivedStateFromProps(y,s.__s))),d=s.props,v=s.state,s.__v=e,p)g&&A.getDerivedStateFromProps==null&&s.componentWillMount!=null&&s.componentWillMount(),g&&s.componentDidMount!=null&&s.__h.push(s.componentDidMount);else{if(g&&A.getDerivedStateFromProps==null&&y!==d&&s.componentWillReceiveProps!=null&&s.componentWillReceiveProps(y,B),e.__v==n.__v||!s.__e&&s.shouldComponentUpdate!=null&&s.shouldComponentUpdate(y,s.__s,B)===!1){e.__v!=n.__v&&(s.props=y,s.state=s.__s,s.__d=!1),e.__e=n.__e,e.__k=n.__k,e.__k.some(function(Z){Z&&(Z.__=e)}),ce.push.apply(s.__h,s._sb),s._sb=[],s.__h.length&&l.push(s);break e}s.componentWillUpdate!=null&&s.componentWillUpdate(y,s.__s,B),g&&s.componentDidUpdate!=null&&s.__h.push(function(){s.componentDidUpdate(d,v,$)})}if(s.context=B,s.props=y,s.__P=t,s.__e=!1,le=h.__r,Dt=0,g)s.state=s.__s,s.__d=!1,le&&le(e),_=s.render(s.props,s.state,s.context),ce.push.apply(s.__h,s._sb),s._sb=[];else do s.__d=!1,le&&le(e),_=s.render(s.props,s.state,s.context),s.state=s.__s;while(s.__d&&++Dt<25);s.state=s.__s,s.getChildContext!=null&&(i=H(H({},i),s.getChildContext())),g&&!p&&s.getSnapshotBeforeUpdate!=null&&($=s.getSnapshotBeforeUpdate(d,v)),we=_!=null&&_.type===M&&_.key==null?it(_.props.children):_,a=Qe(t,ue(we)?we:[we],e,n,i,r,o,l,a,u,c),s.base=e.__e,e.__u&=-161,s.__h.length&&l.push(s),b&&(s.__E=s.__=null)}catch(Z){if(e.__v=null,u||o!=null)if(Z.then){for(e.__u|=u?160:128;a&&a.nodeType==8&&a.nextSibling;)a=a.nextSibling;o[o.indexOf(a)]=null,e.__e=a}else{for(We=o.length;We--;)Te(o[We]);Ce(e)}else e.__e=n.__e,e.__k=n.__k,Z.then||Ce(e);h.__e(Z,e,n)}else o==null&&e.__v==n.__v?(e.__k=n.__k,e.__e=n.__e):a=e.__e=Ft(n.__e,e,n,i,r,o,l,u,c);return(_=h.diffed)&&_(e),128&e.__u?void 0:a}function Ce(t){t&&(t.__c&&(t.__c.__e=!0),t.__k&&t.__k.some(Ce))}function nt(t,e,n){for(var i=0;i<n.length;i++)Ee(n[i],n[++i],n[++i]);h.__c&&h.__c(e,t),t.some(function(r){try{t=r.__h,r.__h=[],t.some(function(o){o.call(r)})}catch(o){h.__e(o,r.__v)}})}function it(t){return typeof t!="object"||t==null||t.__b>0?t:ue(t)?t.map(it):H({},t)}function Ft(t,e,n,i,r,o,l,a,u){var c,_,s,p,d,v,$,b=n.props||ae,y=e.props,g=e.type;if(g=="svg"?r="http://www.w3.org/2000/svg":g=="math"?r="http://www.w3.org/1998/Math/MathML":r||(r="http://www.w3.org/1999/xhtml"),o!=null){for(c=0;c<o.length;c++)if((d=o[c])&&"setAttribute"in d==!!g&&(g?d.localName==g:d.nodeType==3)){t=d,o[c]=null;break}}if(t==null){if(g==null)return document.createTextNode(y);t=document.createElementNS(r,g,y.is&&y),a&&(h.__m&&h.__m(e,o),a=!1),o=null}if(g==null)b===y||a&&t.data==y||(t.data=y);else{if(o=o&&D.call(t.childNodes),!a&&o!=null)for(b={},c=0;c<t.attributes.length;c++)b[(d=t.attributes[c]).name]=d.value;for(c in b)d=b[c],c=="dangerouslySetInnerHTML"?s=d:c=="children"||c in y||c=="value"&&"defaultValue"in y||c=="checked"&&"defaultChecked"in y||_e(t,c,null,d,r);for(c in y)d=y[c],c=="children"?p=d:c=="dangerouslySetInnerHTML"?_=d:c=="value"?v=d:c=="checked"?$=d:a&&typeof d!="function"||b[c]===d||_e(t,c,d,b[c],r);if(_)a||s&&(_.__html==s.__html||_.__html==t.innerHTML)||(t.innerHTML=_.__html),e.__k=[];else if(s&&(t.innerHTML=""),Qe(e.type=="template"?t.content:t,ue(p)?p:[p],e,n,i,g=="foreignObject"?"http://www.w3.org/1999/xhtml":r,o,l,o?o[0]:n.__k&&G(n,0),a,u),o!=null)for(c=o.length;c--;)Te(o[c]);a||(c="value",g=="progress"&&v==null?t.removeAttribute("value"):v!=null&&(v!==t[c]||g=="progress"&&!v||g=="option"&&v!=b[c])&&_e(t,c,v,b[c],r),c="checked",$!=null&&$!=t[c]&&_e(t,c,$,b[c],r))}return t}function Ee(t,e,n){try{if(typeof t=="function"){var i=typeof t.__u=="function";i&&t.__u(),i&&e==null||(t.__u=t(e))}else t.current=e}catch(r){h.__e(r,n)}}function ot(t,e,n){var i,r;if(h.unmount&&h.unmount(t),(i=t.ref)&&(i.current&&i.current!=t.__e||Ee(i,null,e)),(i=t.__c)!=null){if(i.componentWillUnmount)try{i.componentWillUnmount()}catch(o){h.__e(o,e)}i.base=i.__P=null}if(i=t.__k)for(r=0;r<i.length;r++)i[r]&&ot(i[r],e,n||typeof t.type!="function");n||Te(t.__e),t.__c=t.__=t.__e=void 0}function Wt(t,e,n){return this.constructor(t,n)}function rt(t,e,n){var i,r,o,l;e==document&&(e=document.documentElement),h.__&&h.__(t,e),r=(i=!1)?null:e.__k,o=[],l=[],Ie(e,t=e.__k=Je(M,null,[t]),r||ae,ae,e.namespaceURI,r?null:e.firstChild?D.call(e.childNodes):null,o,r?r.__e:e.firstChild,i,l),nt(o,t,l)}D=ce.slice,h={__e:function(t,e,n,i){for(var r,o,l;e=e.__;)if((r=e.__c)&&!r.__)try{if((o=r.constructor)&&o.getDerivedStateFromError!=null&&(r.setState(o.getDerivedStateFromError(t)),l=r.__d),r.componentDidCatch!=null&&(r.componentDidCatch(t,i||{}),l=r.__d),l)return r.__E=r}catch(a){t=a}throw t}},Be=0,Ge=function(t){return t!=null&&t.constructor===void 0},Q.prototype.setState=function(t,e){var n;n=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=H({},this.state),typeof t=="function"&&(t=t(H({},n),this.props)),t&&H(n,t),t!=null&&this.__v&&(e&&this._sb.push(e),Ze(this))},Q.prototype.forceUpdate=function(t){this.__v&&(this.__e=!0,t&&this.__h.push(t),Ze(this))},Q.prototype.render=M,F=[],Ve=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,je=function(t,e){return t.__v.__b-e.__v.__b},de.__r=0,Ke=/(PointerCapture)$|Capture$/i,ke=0,Se=tt(!1),$e=tt(!0);var X,x,Ne,st,pe=0,lt=[],w=h,at=w.__b,ct=w.__r,ut=w.diffed,ft=w.__c,dt=w.unmount,_t=w.__;function Pe(t,e){w.__h&&w.__h(x,t,pe||e),pe=0;var n=x.__H||(x.__H={__:[],__h:[]});return t>=n.__.length&&n.__.push({}),n.__[t]}function R(t){return pe=1,Bt(vt,t)}function Bt(t,e,n){var i=Pe(X++,2);if(i.t=t,!i.__c&&(i.__=[vt(void 0,e),function(a){var u=i.__N?i.__N[0]:i.__[0],c=i.t(u,a);u!==c&&(i.__N=[c,i.__[1]],i.__c.setState({}))}],i.__c=x,!x.__f)){var r=function(a,u,c){if(!i.__c.__H)return!0;var _=i.__c.__H.__.filter(function(p){return p.__c});if(_.every(function(p){return!p.__N}))return!o||o.call(this,a,u,c);var s=i.__c.props!==a;return _.some(function(p){if(p.__N){var d=p.__[0];p.__=p.__N,p.__N=void 0,d!==p.__[0]&&(s=!0)}}),o&&o.call(this,a,u,c)||s};x.__f=!0;var o=x.shouldComponentUpdate,l=x.componentWillUpdate;x.componentWillUpdate=function(a,u,c){if(this.__e){var _=o;o=void 0,r(a,u,c),o=_}l&&l.call(this,a,u,c)},x.shouldComponentUpdate=r}return i.__N||i.__}function ee(t,e){var n=Pe(X++,3);!w.__s&&ht(n.__H,e)&&(n.__=t,n.u=e,x.__H.__h.push(n))}function q(t){return pe=5,Oe(function(){return{current:t}},[])}function Oe(t,e){var n=Pe(X++,7);return ht(n.__H,e)&&(n.__=t(),n.__H=e,n.__h=t),n.__}function Gt(){for(var t;t=lt.shift();){var e=t.__H;if(t.__P&&e)try{e.__h.some(he),e.__h.some(Ae),e.__h=[]}catch(n){e.__h=[],w.__e(n,t.__v)}}}w.__b=function(t){x=null,at&&at(t)},w.__=function(t,e){t&&e.__k&&e.__k.__m&&(t.__m=e.__k.__m),_t&&_t(t,e)},w.__r=function(t){ct&&ct(t),X=0;var e=(x=t.__c).__H;e&&(Ne===x?(e.__h=[],x.__h=[],e.__.some(function(n){n.__N&&(n.__=n.__N),n.u=n.__N=void 0})):(e.__h.some(he),e.__h.some(Ae),e.__h=[],X=0)),Ne=x},w.diffed=function(t){ut&&ut(t);var e=t.__c;e&&e.__H&&(e.__H.__h.length&&(lt.push(e)!==1&&st===w.requestAnimationFrame||((st=w.requestAnimationFrame)||qt)(Gt)),e.__H.__.some(function(n){n.u&&(n.__H=n.u),n.u=void 0})),Ne=x=null},w.__c=function(t,e){e.some(function(n){try{n.__h.some(he),n.__h=n.__h.filter(function(i){return!i.__||Ae(i)})}catch(i){e.some(function(r){r.__h&&(r.__h=[])}),e=[],w.__e(i,n.__v)}}),ft&&ft(t,e)},w.unmount=function(t){dt&&dt(t);var e,n=t.__c;n&&n.__H&&(n.__H.__.some(function(i){try{he(i)}catch(r){e=r}}),n.__H=void 0,e&&w.__e(e,n.__v))};var pt=typeof requestAnimationFrame=="function";function qt(t){var e,n=function(){clearTimeout(i),pt&&cancelAnimationFrame(e),setTimeout(t)},i=setTimeout(n,35);pt&&(e=requestAnimationFrame(n))}function he(t){var e=x,n=t.__c;typeof n=="function"&&(t.__c=void 0,n()),x=e}function Ae(t){var e=x;t.__c=t.__(),x=e}function ht(t,e){return!t||t.length!==e.length||e.some(function(n,i){return n!==t[i]})}function vt(t,e){return typeof e=="function"?e(t):e}var Vt=Symbol.for("preact-signals");function ve(){if(U>1)U--;else{for(var t,e=!1;te!==void 0;){var n=te;for(te=void 0,He++;n!==void 0;){var i=n.o;if(n.o=void 0,n.f&=-3,!(8&n.f)&&yt(n))try{n.c()}catch(r){e||(t=r,e=!0)}n=i}}if(He=0,U--,e)throw t}}function jt(t){if(U>0)return t();U++;try{return t()}finally{ve()}}var m=void 0;function mt(t){var e=m;m=void 0;try{return t()}finally{m=e}}var te=void 0,U=0,He=0,me=0;function gt(t){if(m!==void 0){var e=t.n;if(e===void 0||e.t!==m)return e={i:0,S:t,p:m.s,n:void 0,t:m,e:void 0,x:void 0,r:e},m.s!==void 0&&(m.s.n=e),m.s=e,t.n=e,32&m.f&&t.S(e),e;if(e.i===-1)return e.i=0,e.n!==void 0&&(e.n.p=e.p,e.p!==void 0&&(e.p.n=e.n),e.p=m.s,e.n=void 0,m.s.n=e,m.s=e),e}}function S(t,e){this.v=t,this.i=0,this.n=void 0,this.t=void 0,this.W=e?.watched,this.Z=e?.unwatched,this.name=e?.name}S.prototype.brand=Vt,S.prototype.h=function(){return!0},S.prototype.S=function(t){var e=this,n=this.t;n!==t&&t.e===void 0&&(t.x=n,this.t=t,n!==void 0?n.e=t:mt(function(){var i;(i=e.W)==null||i.call(e)}))},S.prototype.U=function(t){var e=this;if(this.t!==void 0){var n=t.e,i=t.x;n!==void 0&&(n.x=i,t.e=void 0),i!==void 0&&(i.e=n,t.x=void 0),t===this.t&&(this.t=i,i===void 0&&mt(function(){var r;(r=e.Z)==null||r.call(e)}))}},S.prototype.subscribe=function(t){var e=this;return ne(function(){var n=e.value,i=m;m=void 0;try{t(n)}finally{m=i}},{name:"sub"})},S.prototype.valueOf=function(){return this.value},S.prototype.toString=function(){return this.value+""},S.prototype.toJSON=function(){return this.value},S.prototype.peek=function(){var t=m;m=void 0;try{return this.value}finally{m=t}},Object.defineProperty(S.prototype,"value",{get:function(){var t=gt(this);return t!==void 0&&(t.i=this.i),this.v},set:function(t){if(t!==this.v){if(He>100)throw new Error("Cycle detected");this.v=t,this.i++,me++,U++;try{for(var e=this.t;e!==void 0;e=e.x)e.t.N()}finally{ve()}}}});function I(t,e){return new S(t,e)}function yt(t){for(var e=t.s;e!==void 0;e=e.n)if(e.S.i!==e.i||!e.S.h()||e.S.i!==e.i)return!0;return!1}function bt(t){for(var e=t.s;e!==void 0;e=e.n){var n=e.S.n;if(n!==void 0&&(e.r=n),e.S.n=e,e.i=-1,e.n===void 0){t.s=e;break}}}function xt(t){for(var e=t.s,n=void 0;e!==void 0;){var i=e.p;e.i===-1?(e.S.U(e),i!==void 0&&(i.n=e.n),e.n!==void 0&&(e.n.p=i)):n=e,e.S.n=e.r,e.r!==void 0&&(e.r=void 0),e=i}t.s=n}function W(t,e){S.call(this,void 0),this.x=t,this.s=void 0,this.g=me-1,this.f=4,this.W=e?.watched,this.Z=e?.unwatched,this.name=e?.name}W.prototype=new S,W.prototype.h=function(){if(this.f&=-3,1&this.f)return!1;if((36&this.f)==32||(this.f&=-5,this.g===me))return!0;if(this.g=me,this.f|=1,this.i>0&&!yt(this))return this.f&=-2,!0;var t=m;try{bt(this),m=this;var e=this.x();(16&this.f||this.v!==e||this.i===0)&&(this.v=e,this.f&=-17,this.i++)}catch(n){this.v=n,this.f|=16,this.i++}return m=t,xt(this),this.f&=-2,!0},W.prototype.S=function(t){if(this.t===void 0){this.f|=36;for(var e=this.s;e!==void 0;e=e.n)e.S.S(e)}S.prototype.S.call(this,t)},W.prototype.U=function(t){if(this.t!==void 0&&(S.prototype.U.call(this,t),this.t===void 0)){this.f&=-33;for(var e=this.s;e!==void 0;e=e.n)e.S.U(e)}},W.prototype.N=function(){if(!(2&this.f)){this.f|=6;for(var t=this.t;t!==void 0;t=t.x)t.t.N()}},Object.defineProperty(W.prototype,"value",{get:function(){if(1&this.f)throw new Error("Cycle detected");var t=gt(this);if(this.h(),t!==void 0&&(t.i=this.i),16&this.f)throw this.v;return this.v}});function ge(t,e){return new W(t,e)}function wt(t){var e=t.u;if(t.u=void 0,typeof e=="function"){U++;var n=m;m=void 0;try{e()}catch(i){throw t.f&=-2,t.f|=8,Re(t),i}finally{m=n,ve()}}}function Re(t){for(var e=t.s;e!==void 0;e=e.n)e.S.U(e);t.x=void 0,t.s=void 0,wt(t)}function Kt(t){if(m!==this)throw new Error("Out-of-order effect");xt(this),m=t,this.f&=-2,8&this.f&&Re(this),ve()}function V(t,e){this.x=t,this.u=void 0,this.s=void 0,this.o=void 0,this.f=32,this.name=e?.name}V.prototype.c=function(){var t=this.S();try{if(8&this.f||this.x===void 0)return;var e=this.x();typeof e=="function"&&(this.u=e)}finally{t()}},V.prototype.S=function(){if(1&this.f)throw new Error("Cycle detected");this.f|=1,this.f&=-9,wt(this),bt(this),U++;var t=m;return m=this,Kt.bind(this,t)},V.prototype.N=function(){2&this.f||(this.f|=2,this.o=te,te=this)},V.prototype.d=function(){this.f|=8,1&this.f||Re(this)},V.prototype.dispose=function(){this.d()};function ne(t,e){var n=new V(t,e);try{n.c()}catch(r){throw n.d(),r}var i=n.d.bind(n);return i[Symbol.dispose]=i,i}var kt,ye,Jt=typeof window<"u"&&!!window.__PREACT_SIGNALS_DEVTOOLS__,St=[];ne(function(){kt=this.N})();function j(t,e){h[t]=e.bind(null,h[t]||function(){})}function be(t){if(ye){var e=ye;ye=void 0,e()}ye=t&&t.S()}function $t(t){var e=this,n=t.data,i=Tt(n);i.value=n;var r=Oe(function(){for(var a=e,u=e.__v;u=u.__;)if(u.__c){u.__c.__$f|=4;break}var c=ge(function(){var d=i.value.value;return d===0?0:d===!0?"":d||""}),_=ge(function(){return!Array.isArray(c.value)&&!Ge(c.value)}),s=ne(function(){if(this.N=It,_.value){var d=c.value;a.__v&&a.__v.__e&&a.__v.__e.nodeType===3&&(a.__v.__e.data=d)}}),p=e.__$u.d;return e.__$u.d=function(){s(),p.call(this)},[_,c]},[]),o=r[0],l=r[1];return o.value?l.peek():l.value}$t.displayName="ReactiveTextNode",Object.defineProperties(S.prototype,{constructor:{configurable:!0,value:void 0},type:{configurable:!0,value:$t},props:{configurable:!0,get:function(){return{data:this}}},__b:{configurable:!0,value:1}}),j("__b",function(t,e){if(typeof e.type=="string"){var n,i=e.props;for(var r in i)if(r!=="children"){var o=i[r];o instanceof S&&(n||(e.__np=n={}),n[r]=o,i[r]=o.peek())}}t(e)}),j("__r",function(t,e){if(t(e),e.type!==M){be();var n,i=e.__c;i&&(i.__$f&=-2,(n=i.__$u)===void 0&&(i.__$u=n=(function(r,o){var l;return ne(function(){l=this},{name:o}),l.c=r,l})(function(){var r;Jt&&((r=n.y)==null||r.call(n)),i.__$f|=1,i.setState({})},typeof e.type=="function"?e.type.displayName||e.type.name:""))),be(n)}}),j("__e",function(t,e,n,i){be(),t(e,n,i)}),j("diffed",function(t,e){be();var n;if(typeof e.type=="string"&&(n=e.__e)){var i=e.__np,r=e.props;if(i){var o=n.U;if(o)for(var l in o){var a=o[l];a!==void 0&&!(l in i)&&(a.d(),o[l]=void 0)}else o={},n.U=o;for(var u in i){var c=o[u],_=i[u];c===void 0?(c=Yt(n,u,_),o[u]=c):c.o(_,r)}for(var s in i)r[s]=i[s]}}t(e)});function Yt(t,e,n,i){var r=e in t&&t.ownerSVGElement===void 0,o=I(n),l=n.peek();return{o:function(a,u){o.value=a,l=a.peek()},d:ne(function(){this.N=It;var a=o.value.value;l!==a?(l=void 0,r?t[e]=a:a!=null&&(a!==!1||e[4]==="-")?t.setAttribute(e,a):t.removeAttribute(e)):l=void 0})}}j("unmount",function(t,e){if(typeof e.type=="string"){var n=e.__e;if(n){var i=n.U;if(i){n.U=void 0;for(var r in i){var o=i[r];o&&o.d()}}}e.__np=void 0}else{var l=e.__c;if(l){var a=l.__$u;a&&(l.__$u=void 0,a.d())}}t(e)}),j("__h",function(t,e,n,i){(i<3||i===9)&&(e.__$f|=2),t(e,n,i)}),Q.prototype.shouldComponentUpdate=function(t,e){if(this.__R)return!0;var n=this.__$u,i=n&&n.s!==void 0;for(var r in e)return!0;if(this.__f||typeof this.u=="boolean"&&this.u===!0){var o=2&this.__$f;if(!(i||o||4&this.__$f)||1&this.__$f)return!0}else if(!(i||4&this.__$f)||3&this.__$f)return!0;for(var l in t)if(l!=="__source"&&t[l]!==this.props[l])return!0;for(var a in this.props)if(!(a in t))return!0;return!1};function Tt(t,e){return Oe(function(){return I(t,e)},[])}var Zt=function(t){queueMicrotask(function(){queueMicrotask(t)})};function Qt(){jt(function(){for(var t;t=St.shift();)kt.call(t)})}function It(){St.push(this)===1&&(h.requestAnimationFrame||Zt)(Qt)}const E=I(!1),Ct=I(!1),T=I([]),k=I(null),K=I(null),P=I(null),z=I(null),ie=I(""),oe=I(!1),xe=I(!1),C=I({primaryColor:"#3ECF8E",position:"bottom-right",welcomeMessage:"Hi! How can we help you?",workspaceName:null,showBranding:!0,requireEmail:!1,pusherKey:null,pusherCluster:null,offlineFormTimeout:null,pageVisibilityMode:"exclude",pageVisibilityPatterns:[]}),Et=I(!1),Xt=ge(()=>C.value.requireEmail&&!z.value&&!k.value),en=ge(()=>!!k.value),Nt="guddesk_state";function De(){try{localStorage.setItem(Nt,JSON.stringify({conversationId:k.value,visitorId:K.value,visitorToken:P.value,visitorEmail:z.value}))}catch{}}function tn(){try{const t=localStorage.getItem(Nt);if(!t)return;const e=JSON.parse(t);e.conversationId&&(k.value=e.conversationId),e.visitorId&&(K.value=e.visitorId),e.visitorToken&&(P.value=e.visitorToken),e.visitorEmail&&(z.value=e.visitorEmail)}catch{}}function nn(t,e,n){return{appId:t,visitorToken:e,externalId:n.userId,name:n.name,email:n.email,metadata:n.metadata,userHash:n.userHash}}function on(t){const e={...t.extra};return t.hasBody&&(e["Content-Type"]="application/json"),t.visitorToken&&(e["x-visitor-token"]=t.visitorToken),e}let re="",Pt="";function rn(t,e){re=t,Pt=e.replace(/\/$/,"")}async function J(t,e={}){const n=on({hasBody:!!e.body,visitorToken:P.value,extra:e.headers}),i=await fetch(`${Pt}${t}`,{...e,headers:n});if(!i.ok){const r=await i.json().catch(()=>({error:"Request failed"}));throw new Error(r.error||"Request failed")}return i.json()}async function sn(){const t=await J(`/api/widget/config?appId=${encodeURIComponent(re)}`);C.value=t,Et.value=!0}async function ln(){if(P.value&&K.value)return;const t=await J("/api/widget/auth",{method:"POST",body:JSON.stringify({appId:re})});K.value=t.visitorId,P.value=t.visitorToken,De()}async function Me(t){const e=await J("/api/widget/visitors",{method:"POST",body:JSON.stringify(nn(re,P.value,t))});K.value=e.visitorId,P.value=e.visitorToken,t.email&&(z.value=t.email),De()}let an=0;function Ot(t){const e=`_opt_${++an}`,n={id:e,body:t,type:"VISITOR",senderName:null,createdAt:new Date().toISOString(),_sending:!0};return T.value=[...T.value,n],e}function Ue(t,e){e?T.value=T.value.map(n=>n.id===t?e:n):T.value=T.value.map(n=>n.id===t?{...n,_sending:!1}:n)}async function cn(t){const e=Ot(t);try{const n=await J("/api/widget/conversations",{method:"POST",body:JSON.stringify({appId:re,visitorToken:P.value,message:t,visitorName:null,visitorEmail:z.value})});k.value=n.conversationId,K.value=n.visitorId,P.value=n.visitorToken,T.value=n.messages,De()}catch{Ue(e,null)}}async function un(t){if(!k.value)return cn(t);const e=Ot(t);try{const n=await J(`/api/widget/conversations/${k.value}/messages`,{method:"POST",body:JSON.stringify({message:t})});Ue(e,n)}catch{Ue(e,null)}}async function ze(){if(!k.value)return;const t=await J(`/api/widget/conversations/${k.value}/messages`);T.value=t.messages}const fn="https://www.guddesk.com",dn=new Set(["cdn.guddesk.com","www.guddesk.com","guddesk.com"]);function _n(t,e,n){if(n)return n.replace(/\/$/,"");if(t)try{const i=new URL(t);if(dn.has(i.hostname))return fn;if(i.hostname.includes("guddesk")||t.includes("widget"))return i.origin}catch{}return e}function pn(t){for(let e=t.length-1;e>=0;e--){const n=t[e]?.src;if(n&&(n.includes("guddesk")||n.includes("widget")))return n}}var hn=0;function f(t,e,n,i,r,o){e||(e={});var l,a,u=e;if("ref"in u)for(a in u={},e)a=="ref"?l=e[a]:u[a]=e[a];var c={type:t,props:u,key:n,ref:l,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:--hn,__i:-1,__u:0,__source:r,__self:o};if(typeof t=="function"&&(l=t.defaultProps))for(a in l)u[a]===void 0&&(u[a]=l[a]);return h.vnode&&h.vnode(c),c}function vn(t){const e=t.replace(/([.+?^${}()|[\]\\])/g,"\\$1").replace(/\*\*/g,"{{GLOBSTAR}}").replace(/\*/g,"[^/]*").replace(/\{\{GLOBSTAR\}\}/g,".*");return new RegExp(`^${e}$`)}function mn(t,e,n){if(!n||n.length===0)return!0;const i=n.some(r=>{try{return vn(r).test(t)}catch{return!1}});return e==="exclude"?!i:i}let O=null,N=null,Y=null;const gn=8e3;async function yn(t,e,n){const{default:i}=await import("pusher-js"),r=new i(t,{cluster:e,channelAuthorization:{endpoint:n,transport:"ajax",customHandler:({channelName:o,socketId:l},a)=>{fetch(n,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded","x-visitor-token":P.value??""},body:new URLSearchParams({socket_id:l,channel_name:o}).toString()}).then(async u=>{if(!u.ok){a(new Error(`Pusher auth failed: ${u.status}`),null);return}const c=await u.json();a(null,c)}).catch(u=>a(u,null))}}});return await new Promise((o,l)=>{const a=setTimeout(()=>{u();try{r.disconnect()}catch{}l(new Error("Pusher connection timeout"))},gn);function u(){clearTimeout(a),r.connection.unbind("connected",c),r.connection.unbind("error",_),r.connection.unbind("unavailable",_),r.connection.unbind("failed",_)}function c(){u(),o()}function _(s){u();try{r.disconnect()}catch{}l(s instanceof Error?s:new Error("Pusher connection error"))}r.connection.bind("connected",c),r.connection.bind("error",_),r.connection.bind("unavailable",_),r.connection.bind("failed",_)}),O=r,O}function At(){if(!O||!k.value)return;N&&(N.unbind_all(),O.unsubscribe(N.name));const t=`private-visitor-${k.value}`;N=O.subscribe(t),N.bind("message:created",e=>{T.value.some(n=>n.id===e.id)||(T.value=[...T.value,e])}),N.bind("typing:start",()=>{oe.value=!0,Y&&clearTimeout(Y),Y=setTimeout(()=>{oe.value=!1},4e3)}),N.bind("typing:stop",()=>{oe.value=!1,Y&&(clearTimeout(Y),Y=null)})}function Le(){return O?.connection?.state==="connected"}function bn(){N&&(N.unbind_all(),O?.unsubscribe(N.name),N=null),O&&(O.disconnect(),O=null)}function xn(t,e){const n=e==="bottom-right";return`
    :host {
      all: initial;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #1f2937;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    .fc-container {
      position: fixed;
      bottom: 20px;
      ${n?"right: 20px;":"left: 20px;"}
      z-index: 2147483647;
      display: flex;
      flex-direction: column;
      align-items: ${n?"flex-end":"flex-start"};
    }

    .fc-bubble {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: ${t};
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .fc-bubble:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 20px rgba(0,0,0,0.2);
    }

    .fc-window {
      width: 370px;
      max-height: 520px;
      border-radius: 16px;
      overflow: hidden;
      background: white;
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
      display: flex;
      flex-direction: column;
      margin-bottom: 12px;
      animation: fc-slide-up 0.25s ease-out;
    }

    @keyframes fc-slide-up {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .fc-header {
      background: ${t};
      color: white;
      padding: 16px;
    }
    .fc-header-title {
      font-size: 15px;
      font-weight: 600;
    }
    .fc-header-subtitle {
      font-size: 12px;
      opacity: 0.85;
      margin-top: 2px;
    }
    .fc-header-close {
      position: absolute;
      top: 12px;
      right: 12px;
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      opacity: 0.8;
      padding: 4px;
    }
    .fc-header-close:hover { opacity: 1; }

    .fc-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-height: 200px;
      max-height: 320px;
    }

    .fc-msg-row {
      display: flex;
      flex-direction: column;
    }
    .fc-msg-row-visitor {
      align-items: flex-end;
    }
    .fc-msg-row-agent {
      align-items: flex-start;
    }

    .fc-msg {
      max-width: 80%;
      padding: 8px 12px;
      border-radius: 12px;
      font-size: 13px;
      line-height: 1.4;
      word-wrap: break-word;
    }
    .fc-msg-visitor {
      background: ${t};
      color: white;
      border-bottom-right-radius: 4px;
    }
    .fc-msg-agent {
      background: #f3f4f6;
      color: #1f2937;
      border-bottom-left-radius: 4px;
    }
    .fc-msg-sender {
      font-size: 11px;
      color: #6b7280;
      margin-bottom: 2px;
    }
    .fc-msg-time {
      font-size: 10px;
      opacity: 0.6;
      margin-top: 2px;
    }
    .fc-msg-sending {
      opacity: 0.7;
    }
    .fc-sending-indicator {
      display: inline-flex;
      gap: 2px;
      align-items: center;
    }
    .fc-sending-dot {
      width: 3px;
      height: 3px;
      border-radius: 50%;
      background: currentColor;
      opacity: 0.5;
      animation: fc-sending-pulse 1s infinite;
    }
    .fc-sending-dot:nth-child(2) { animation-delay: 0.15s; }
    .fc-sending-dot:nth-child(3) { animation-delay: 0.3s; }
    @keyframes fc-sending-pulse {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 1; }
    }

    .fc-typing {
      align-self: flex-start;
      padding: 8px 12px;
      background: #f3f4f6;
      border-radius: 12px;
      font-size: 13px;
      color: #6b7280;
    }
    .fc-typing-dots span {
      animation: fc-blink 1.4s infinite both;
    }
    .fc-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
    .fc-typing-dots span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes fc-blink {
      0%, 80%, 100% { opacity: 0.3; }
      40% { opacity: 1; }
    }

    .fc-input-area {
      border-top: 1px solid #e5e7eb;
      padding: 12px;
      display: flex;
      gap: 8px;
      align-items: flex-end;
    }
    .fc-input {
      flex: 1;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 13px;
      font-family: inherit;
      outline: none;
      resize: none;
      min-height: 36px;
      max-height: 80px;
      line-height: 1.4;
    }
    .fc-input:focus {
      border-color: ${t};
    }
    .fc-send-btn {
      background: ${t};
      color: white;
      border: none;
      border-radius: 8px;
      padding: 8px 12px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      white-space: nowrap;
    }
    .fc-send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .fc-branding {
      text-align: center;
      padding: 6px;
      font-size: 10px;
      color: #9ca3af;
      border-top: 1px solid #f3f4f6;
    }
    .fc-branding a {
      color: #6b7280;
      text-decoration: none;
    }
    .fc-branding a:hover { text-decoration: underline; }

    .fc-prechat {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .fc-prechat label {
      font-size: 13px;
      font-weight: 500;
      color: #374151;
    }
    .fc-prechat input {
      width: 100%;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 13px;
      font-family: inherit;
      outline: none;
    }
    .fc-prechat input:focus {
      border-color: ${t};
    }
    .fc-prechat button {
      background: ${t};
      color: white;
      border: none;
      border-radius: 8px;
      padding: 10px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
    }

    .fc-offline-form {
      padding: 16px;
      animation: fc-slide-up 0.2s ease-out;
    }
    .fc-offline-header {
      margin-bottom: 12px;
    }
    .fc-offline-title {
      font-size: 14px;
      font-weight: 600;
      color: #1f2937;
    }
    .fc-offline-subtitle {
      font-size: 12px;
      color: #6b7280;
      margin-top: 2px;
    }
    .fc-offline-fields {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .fc-offline-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .fc-offline-field label {
      font-size: 12px;
      font-weight: 500;
      color: #374151;
    }
    .fc-offline-field input,
    .fc-offline-field textarea {
      width: 100%;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 13px;
      font-family: inherit;
      outline: none;
      resize: none;
    }
    .fc-offline-field input:focus,
    .fc-offline-field textarea:focus {
      border-color: ${t};
    }
    .fc-offline-error {
      font-size: 12px;
      color: #ef4444;
    }
    .fc-offline-submit {
      background: ${t};
      color: white;
      border: none;
      border-radius: 8px;
      padding: 10px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
    }
    .fc-offline-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .fc-offline-dismiss {
      background: none;
      border: none;
      color: #6b7280;
      font-size: 12px;
      cursor: pointer;
      text-align: center;
      padding: 6px;
      width: 100%;
    }
    .fc-offline-dismiss:hover {
      color: #374151;
    }
    .fc-offline-success {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 20px 0;
      gap: 8px;
    }
    .fc-offline-success-title {
      font-size: 14px;
      font-weight: 600;
      color: #1f2937;
    }
    .fc-offline-success-text {
      font-size: 12px;
      color: #6b7280;
      line-height: 1.4;
    }
    .fc-offline-success-text strong {
      color: #374151;
    }

    @media (max-width: 440px) {
      .fc-window {
        width: calc(100vw - 24px);
        max-height: calc(100vh - 100px);
        border-radius: 12px;
      }
      .fc-container {
        bottom: 12px;
        ${n?"right: 12px;":"left: 12px;"}
      }
    }
  `}const wn='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',kn='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',Sn='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';function $n(){return f("div",{class:"fc-header",style:{position:"relative"},children:[f("div",{class:"fc-header-title",children:C.value.workspaceName||"Support"}),f("div",{class:"fc-header-subtitle",children:"We typically reply in a few minutes"}),f("button",{class:"fc-header-close",onClick:()=>E.value=!1,"aria-label":"Close chat",dangerouslySetInnerHTML:{__html:kn}})]})}function Tn(t){try{return new Date(t).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}catch{return""}}function Ht(){const t=q(null);return ee(()=>{t.current?.scrollIntoView({behavior:"smooth"})},[T.value.length,oe.value]),en.value?f("div",{class:"fc-messages",children:[T.value.map(e=>f("div",{class:`fc-msg-row ${e.type==="VISITOR"?"fc-msg-row-visitor":"fc-msg-row-agent"}`,children:[e.type!=="VISITOR"&&e.senderName&&f("div",{class:"fc-msg-sender",children:e.senderName}),f("div",{class:`fc-msg ${e.type==="VISITOR"?"fc-msg-visitor":"fc-msg-agent"}${e._sending?" fc-msg-sending":""}`,children:[e.body,f("div",{class:"fc-msg-time",children:e._sending?f("span",{class:"fc-sending-indicator",children:[f("span",{class:"fc-sending-dot"}),f("span",{class:"fc-sending-dot"}),f("span",{class:"fc-sending-dot"})]}):Tn(e.createdAt)})]})]},e.id)),oe.value&&f("div",{class:"fc-typing",children:f("span",{class:"fc-typing-dots",children:[f("span",{children:"."}),f("span",{children:"."}),f("span",{children:"."})]})}),f("div",{ref:t})]}):f("div",{class:"fc-messages",children:f("div",{class:"fc-msg fc-msg-agent",children:C.value.welcomeMessage})})}function In(){const t=q(null);async function e(){const i=ie.value.trim();!i||Ct.value||(ie.value="",await un(i),t.current?.focus())}function n(i){i.key==="Enter"&&!i.shiftKey&&(i.preventDefault(),e())}return f("div",{class:"fc-input-area",children:[f("textarea",{ref:t,class:"fc-input",rows:1,placeholder:"Type a message...",value:ie.value,onInput:i=>{ie.value=i.target.value},onKeyDown:n}),f("button",{class:"fc-send-btn",onClick:e,disabled:!ie.value.trim()||Ct.value,children:"Send"})]})}function Cn(){const[t,e]=R(""),[n,i]=R(""),[r,o]=R(!1);async function l(a){a.preventDefault();const u=t.trim();if(!u||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u)){i("Please enter a valid email address.");return}o(!0),i("");try{await Me({email:u}),z.value=u}catch{i("Something went wrong. Please try again.")}finally{o(!1)}}return f("form",{class:"fc-prechat",onSubmit:l,children:[f("label",{children:"Enter your email to start chatting"}),f("input",{type:"email",placeholder:"you@example.com",value:t,onInput:a=>e(a.target.value),required:!0}),n&&f("div",{style:{color:"#ef4444",fontSize:"12px"},children:n}),f("button",{type:"submit",disabled:r,children:r?"...":"Start Chat"})]})}function En(){const[t,e]=R(""),[n,i]=R(z.value??""),[r,o]=R(""),[l,a]=R(!1),[u,c]=R(!1),[_,s]=R("");async function p(v){v.preventDefault();const $=n.trim();if(!$||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($)){s("Please enter a valid email address.");return}c(!0),s("");try{await Me({email:$,name:t.trim()||void 0}),z.value=$,a(!0)}catch{s("Something went wrong. Please try again.")}finally{c(!1)}}function d(){xe.value=!1}return l?f("div",{class:"fc-offline-form",children:f("div",{class:"fc-offline-success",children:[f("svg",{width:"32",height:"32",viewBox:"0 0 24 24",fill:"none",stroke:C.value.primaryColor,"stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round",children:[f("path",{d:"M22 11.08V12a10 10 0 1 1-5.93-9.14"}),f("polyline",{points:"22 4 12 14.01 9 11.01"})]}),f("p",{class:"fc-offline-success-title",children:"Thanks! We'll be in touch."}),f("p",{class:"fc-offline-success-text",children:["We'll get back to you at ",f("strong",{children:n})," as soon as possible."]}),f("button",{class:"fc-offline-dismiss",onClick:d,children:"Continue chatting"})]})}):f("div",{class:"fc-offline-form",children:[f("div",{class:"fc-offline-header",children:[f("p",{class:"fc-offline-title",children:"We're not available right now"}),f("p",{class:"fc-offline-subtitle",children:"Leave your details and we'll get back to you."})]}),f("form",{class:"fc-offline-fields",onSubmit:p,children:[f("div",{class:"fc-offline-field",children:[f("label",{children:"Name"}),f("input",{type:"text",placeholder:"Your name",value:t,onInput:v=>e(v.target.value)})]}),f("div",{class:"fc-offline-field",children:[f("label",{children:"Email *"}),f("input",{type:"email",placeholder:"you@example.com",value:n,onInput:v=>i(v.target.value),required:!0})]}),f("div",{class:"fc-offline-field",children:[f("label",{children:"Message"}),f("textarea",{placeholder:"Anything else you'd like us to know?",rows:3,value:r,onInput:v=>o(v.target.value)})]}),_&&f("div",{class:"fc-offline-error",children:_}),f("button",{type:"submit",class:"fc-offline-submit",disabled:u,children:u?"Sending...":"Leave a message"}),f("button",{type:"button",class:"fc-offline-dismiss",onClick:d,children:"Continue chatting"})]})]})}function Nn(){return f("div",{class:"fc-window",children:[f($n,{}),Xt.value?f(Cn,{}):xe.value?f(M,{children:[f(Ht,{}),f(En,{})]}):f(M,{children:[f(Ht,{}),f(In,{})]}),C.value.showBranding&&f("div",{class:"fc-branding",children:["Powered by"," ",f("a",{href:"https://guddesk.com",target:"_blank",rel:"noopener",children:"GudDesk"})]})]})}function Pn(){return f("button",{class:"fc-bubble",onClick:()=>E.value=!E.value,"aria-label":E.value?"Close chat":"Open chat",dangerouslySetInnerHTML:{__html:E.value?Sn:wn}})}const On=4e3;function An({appId:t,baseUrl:e,pusherKey:n,pusherCluster:i}){const r=q(null),o=q(!1),l=q(null),a=q(0),u=Tt(!1);function c(){_(),r.current=setInterval(()=>{k.value&&E.value&&ze().catch(()=>{})},On)}function _(){r.current&&(clearInterval(r.current),r.current=null)}async function s(p,d){if(!o.current){o.current=!0;try{await yn(p,d,`${e}/api/pusher/auth`),k.value&&At(),_()}catch{o.current=!1,c()}}}return ee(()=>(tn(),rn(t,e),Promise.all([sn().catch(()=>{}),ln().catch(()=>{})]).then(()=>{if(!mn(window.location.pathname,C.value.pageVisibilityMode,C.value.pageVisibilityPatterns)){u.value=!0;return}k.value&&ze().catch(()=>{});const d=n||C.value.pusherKey,v=i||C.value.pusherCluster;d&&v?s(d,v):c()}),()=>{bn(),_()}),[]),ee(()=>{k.value&&(Le()?At():r.current||c())},[k.value]),ee(()=>{E.value&&k.value&&!Le()?(ze().catch(()=>{}),c()):!E.value&&!Le()&&_()},[E.value]),ee(()=>{const p=C.value.offlineFormTimeout;if(!p||!k.value)return;const d=T.value,v=d.filter(b=>b.type==="VISITOR").length;if(d.some(b=>b.type==="AGENT"||b.type==="BOT")){xe.value=!1,l.current&&(clearTimeout(l.current),l.current=null),a.current=v;return}return v>a.current&&(a.current=v,l.current&&clearTimeout(l.current),l.current=setTimeout(()=>{T.value.some(g=>g.type==="AGENT"||g.type==="BOT")||(xe.value=!0)},p*60*1e3)),()=>{l.current&&(clearTimeout(l.current),l.current=null)}},[T.value,k.value,C.value.offlineFormTimeout]),!Et.value||u.value?null:f(M,{children:[f("style",{children:xn(C.value.primaryColor,C.value.position)}),f("div",{class:"fc-container",children:[E.value&&f(Nn,{}),f(Pn,{})]})]})}let se=null;function Hn(t){const e=Array.from(document.querySelectorAll("script[src]")).map(n=>({src:n.src}));return _n(pn(e),window.location.origin,t)}function Fe(t){if(se)return;const e=t.appId;if(!e){console.error("[GudDesk] Missing appId in GudDeskSettings");return}const n=Hn(t.baseUrl),i=document.createElement("div");i.id="guddesk-widget",document.body.appendChild(i),se=i.attachShadow({mode:"open"}),rt(Je(An,{appId:e,baseUrl:n,pusherKey:t.pusherKey,pusherCluster:t.pusherCluster}),se)}function Rn(){const t=document.getElementById("guddesk-widget");t&&(rt(null,se),t.remove(),se=null)}const Rt={init:Fe,identify:t=>Me(t),open:()=>{E.value=!0},close:()=>{E.value=!1},destroy:Rn};return window.GudDesk=Rt,window.GudDeskSettings&&(document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>Fe(window.GudDeskSettings)):Fe(window.GudDeskSettings)),Rt}));
